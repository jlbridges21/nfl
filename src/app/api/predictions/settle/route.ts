import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { z } from 'zod'

const settleRequestSchema = z.object({
  predictionId: z.string().uuid().optional(),
  gameId: z.string().optional(),
  homeTeamId: z.string().uuid().optional(),
  awayTeamId: z.string().uuid().optional(),
  predictedHomeScore: z.number(),
  predictedAwayScore: z.number(),
  actualHomeScore: z.number(),
  actualAwayScore: z.number(),
  gameDateISO: z.string().optional(),
})

interface PredictionData {
  id: string
  was_accurate: boolean | null
  error_margin: number | null
  settled_at: string | null
  game_id: string
  predicted_home_score?: number
  predicted_away_score?: number
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = settleRequestSchema.parse(body)
    
    const {
      predictionId,
      gameId,
      homeTeamId,
      awayTeamId,
      predictedHomeScore,
      predictedAwayScore,
      actualHomeScore,
      actualAwayScore,
      gameDateISO,
    } = validatedData

    // Create authenticated client (uses cookies for user identification)
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find predictions to settle
    let predictionsToSettle: PredictionData[] = []

    if (predictionId) {
      // We have a specific prediction ID - settle just that one
      const { data: prediction, error: fetchError } = await supabase
        .from('predictions')
        .select('id, was_accurate, error_margin, settled_at, game_id')
        .eq('id', predictionId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !prediction) {
        return NextResponse.json(
          { ok: false, error: 'Prediction not found or access denied' },
          { status: 404 }
        )
      }

      predictionsToSettle.push(prediction)
    } else if (homeTeamId && awayTeamId) {
      // Find all unsettled predictions for this team matchup
      const { data: predictions, error: fetchError } = await supabase
        .from('predictions')
        .select('id, was_accurate, error_margin, settled_at, game_id, predicted_home_score, predicted_away_score')
        .eq('user_id', user.id)
        .is('was_accurate', null) // Only unsettled predictions
        .or(`game_id.like.%${homeTeamId}_vs_${awayTeamId}%,game_id.like.%${awayTeamId}_vs_${homeTeamId}%`)

      if (fetchError) {
        console.error('Error finding predictions:', fetchError)
        return NextResponse.json(
          { ok: false, error: 'Error finding predictions' },
          { status: 500 }
        )
      }

      if (predictions && predictions.length > 0) {
        // Filter to exact matches with the predicted scores
        predictionsToSettle = predictions.filter(p => 
          p.predicted_home_score === predictedHomeScore && 
          p.predicted_away_score === predictedAwayScore
        )
      }
    } else {
      return NextResponse.json(
        { ok: false, error: 'Must provide either predictionId or homeTeamId/awayTeamId' },
        { status: 400 }
      )
    }

    if (predictionsToSettle.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No matching predictions found to settle' },
        { status: 404 }
      )
    }

    // Compute accuracy metrics
    const predictedWinner = predictedHomeScore >= predictedAwayScore ? 'Home' : 'Away'
    const actualWinner = actualHomeScore > actualAwayScore ? 'Home' : 'Away'
    const wasAccurate = predictedWinner === actualWinner
    
    // Handle ties as incorrect (as specified in requirements)
    const wasAccurateAdjusted = actualHomeScore === actualAwayScore ? false : wasAccurate

    const errorMargin = Math.abs(
      (predictedHomeScore + predictedAwayScore) - 
      (actualHomeScore + actualAwayScore)
    )

    const settledAt = new Date(gameDateISO ?? Date.now()).toISOString()

    // Update all matching predictions
    let settledCount = 0
    for (const prediction of predictionsToSettle) {
      // Check if already settled with identical values (idempotency)
      const alreadySettled = (
        prediction.was_accurate === wasAccurateAdjusted &&
        prediction.error_margin === errorMargin
      )

      if (!alreadySettled) {
        const { error: updateError } = await supabase
          .from('predictions')
          .update({
            was_accurate: wasAccurateAdjusted,
            error_margin: errorMargin,
            settled_at: settledAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', prediction.id)
          .eq('user_id', user.id) // RLS constraint

        if (updateError) {
          console.error('Error updating prediction:', updateError)
        } else {
          settledCount++
        }
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: `${settledCount} prediction(s) settled successfully`,
      data: {
        settledCount,
        wasAccurate: wasAccurateAdjusted,
        errorMargin,
        settledAt,
      }
    })

  } catch (error) {
    console.error('Prediction settlement error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Invalid request data',
          details: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
