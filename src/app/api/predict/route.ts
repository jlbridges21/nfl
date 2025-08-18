import { NextRequest, NextResponse } from 'next/server';
import { getModelInputs } from '@/repo/stats';
import { predictGame } from '@/model/scoring';
import { predictGameEnhanced } from '@/model/enhanced-scoring';
import type { PredictionSettings } from '@/components/predictor/settings-modal';

interface PredictRequestBody {
  homeId: string;
  awayId: string;
  settings?: PredictionSettings;
}

// Default settings matching the modal defaults
const DEFAULT_SETTINGS: PredictionSettings = {
  recentForm: 0.30,
  homeFieldAdvantage: 0.15,
  defensiveStrength: 0.5,
  fpiEdge: 0.6,
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: PredictRequestBody = await request.json();
    
    if (!body.homeId || !body.awayId) {
      return NextResponse.json(
        { error: 'Both homeId and awayId are required' },
        { status: 400 }
      );
    }

    if (body.homeId === body.awayId) {
      return NextResponse.json(
        { error: 'Home and away teams must be different' },
        { status: 400 }
      );
    }

    // Get model inputs (this handles year resolution and data fetching)
    let modelInputs;
    try {
      modelInputs = await getModelInputs(body.homeId, body.awayId);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('No stats found')) {
          return NextResponse.json(
            { error: 'Insufficient data for this matchup', details: error.message },
            { status: 404 }
          );
        }
        if (error.message.includes('Team not found')) {
          return NextResponse.json(
            { error: 'One or both teams not found', details: error.message },
            { status: 404 }
          );
        }
      }
      throw error; // Re-throw unexpected errors
    }

    // Use settings from request or defaults
    const settings = body.settings || DEFAULT_SETTINGS;

    // Generate prediction using enhanced scoring with user settings
    const seed = body.homeId + '_' + body.awayId;
    const prediction = predictGameEnhanced(
      modelInputs.home.stats,
      modelInputs.away.stats,
      modelInputs.league,
      seed,
      settings
    );

    // Build response
    const response = {
      meta: {
        homeTeam: modelInputs.home.team,
        awayTeam: modelInputs.away.team,
        year: modelInputs.year,
      },
      prediction: {
        homeScore: Math.round(prediction.homeScore),
        awayScore: Math.round(prediction.awayScore),
        total: prediction.total,
        spread: prediction.spread,
        predictedWinner: prediction.predictedWinner,
        winProbabilityHome: prediction.winProbabilityHome,
        confidence: prediction.confidence,
      },
      contributions: prediction.contributions,
      inputs: {
        home: modelInputs.home.stats,
        away: modelInputs.away.stats,
        league: modelInputs.league,
      },
      calculationDetails: {
        adjustedHomeYards: prediction.adjustedHomeYards,
        adjustedAwayYards: prediction.adjustedAwayYards,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Prediction API error:', error);
    
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
    { error: 'Method not allowed. Use POST to generate predictions.' },
    { status: 405 }
  );
}
