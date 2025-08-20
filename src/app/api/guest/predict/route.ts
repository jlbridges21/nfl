import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

interface PredictRequestBody {
  deviceId: string;
  game_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  confidence: number;
  user_configuration: object;
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictRequestBody = await request.json();
    
    if (!body.deviceId || !body.game_id) {
      return NextResponse.json(
        { error: 'deviceId and game_id are required' },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Check if a prediction for this device + game already exists
    const { data: existingPrediction, error: checkError } = await (supabase as any)
      .from('guest_predictions')
      .select('id, created_at')
      .eq('device_id', body.deviceId)
      .eq('game_id', body.game_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Failed to check existing prediction:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing prediction' },
        { status: 500 }
      );
    }

    if (existingPrediction) {
      // Update existing prediction (no credit consumed)
      const { error: updateError } = await (supabase as any)
        .from('guest_predictions')
        .update({
          predicted_home_score: body.predicted_home_score,
          predicted_away_score: body.predicted_away_score,
          confidence: body.confidence,
          user_configuration: body.user_configuration,
          updated_at: new Date().toISOString(),
        })
        .eq('device_id', body.deviceId)
        .eq('game_id', body.game_id);

      if (updateError) {
        console.error('Failed to update guest prediction:', updateError);
        return NextResponse.json(
          { error: 'Failed to update prediction' },
          { status: 500 }
        );
      }

      // Get current credits
      const { data: sessionData, error: sessionError } = await (supabase as any)
        .from('guest_sessions')
        .select('credits_used')
        .eq('device_id', body.deviceId)
        .single();

      if (sessionError) {
        console.error('Failed to get session for updated prediction:', sessionError);
        return NextResponse.json(
          { error: 'Failed to get session data' },
          { status: 500 }
        );
      }

      const used = sessionData?.credits_used || 0;
      const remaining = Math.max(0, 10 - used);

      return NextResponse.json({
        ok: true,
        used,
        remaining,
        updated: true,
      });
    }

    // New prediction - check credits and insert atomically
    const { data: sessionData, error: sessionError } = await (supabase as any)
      .from('guest_sessions')
      .select('credits_used')
      .eq('device_id', body.deviceId)
      .single();

    if (sessionError) {
      console.error('Failed to get guest session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to get session data' },
        { status: 500 }
      );
    }

    const currentCreditsUsed = sessionData?.credits_used || 0;

    // Check if user has exceeded limit
    if (currentCreditsUsed >= 10) {
      return NextResponse.json(
        { error: 'PAYWALL' },
        { status: 402 }
      );
    }

    // Use a transaction to ensure atomic insert + credit increment
    // Since Supabase doesn't have native transactions in the client,
    // we'll use a stored procedure approach or handle race conditions
    
    // First, try to insert the prediction
    const { error: insertError } = await (supabase as any)
      .from('guest_predictions')
      .insert({
        device_id: body.deviceId,
        game_id: body.game_id,
        predicted_home_score: body.predicted_home_score,
        predicted_away_score: body.predicted_away_score,
        confidence: body.confidence,
        user_configuration: body.user_configuration,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      // If it's a unique constraint violation, someone else might have inserted
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Prediction already exists for this game' },
          { status: 409 }
        );
      }
      
      console.error('Failed to insert guest prediction:', insertError);
      return NextResponse.json(
        { error: 'Failed to create prediction' },
        { status: 500 }
      );
    }

    // Increment credits atomically
    const { data: updatedSession, error: incrementError } = await (supabase as any)
      .from('guest_sessions')
      .update({ credits_used: currentCreditsUsed + 1 })
      .eq('device_id', body.deviceId)
      .eq('credits_used', currentCreditsUsed) // Ensure no race condition
      .select('credits_used')
      .single();

    if (incrementError || !updatedSession) {
      // Rollback: delete the prediction if credit increment failed
      await (supabase as any)
        .from('guest_predictions')
        .delete()
        .eq('device_id', body.deviceId)
        .eq('game_id', body.game_id);
      
      console.error('Failed to increment credits:', incrementError);
      return NextResponse.json(
        { error: 'Failed to process prediction' },
        { status: 500 }
      );
    }

    const newUsed = updatedSession.credits_used;
    const remaining = Math.max(0, 10 - newUsed);

    return NextResponse.json({
      ok: true,
      used: newUsed,
      remaining,
      created: true,
    });

  } catch (error) {
    console.error('Guest predict API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create predictions.' },
    { status: 405 }
  );
}
