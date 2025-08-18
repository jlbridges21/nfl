// Type definitions for the NFL Game Predictor

export interface Team {
  code: string;
  name: string;
  city: string;
  color: string;
}

export interface GamePrediction {
  awayTeam: Team;
  homeTeam: Team;
  awayScore: number;
  homeScore: number;
  spread: number;
  total: number;
  awayWinProbability: number;
  homeWinProbability: number;
  confidence: number;
}

export interface PredictionFactor {
  id: string;
  label: string;
  icon: string;
  contribution: number;
  description: string;
  color: 'positive' | 'negative' | 'neutral';
}

export interface MatchupSelection {
  awayTeam: string | null;
  homeTeam: string | null;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Theme types
export type Theme = 'light' | 'dark' | 'system';
