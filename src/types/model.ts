/**
 * Compact model types used by the scoring engine
 * These are the cleaned, processed types that the ML model will consume
 */

export interface TeamStats {
  // Core identifier
  year: number;

  // Offense - Yards per Game
  yardsPerGameSeason: number;
  yardsPerGameLast3: number;
  yardsPerGameLast1: number;
  yardsPerGameHome: number;
  yardsPerGameAway: number;

  // Offense - Points per Game
  pointsPerGameSeason: number;
  pointsPerGameLast3: number;
  pointsPerGameLast1: number;
  pointsPerGameHome: number;
  pointsPerGameAway: number;

  // Offense - Touchdowns per Game (season only for now)
  touchdownsPerGameSeason: number;

  // Defense - Allowed per Game
  defensiveYardsAllowedSeason: number;
  defensivePointsAllowedSeason: number;

  // Efficiency - Yards per Point
  yardsPerPointSeason: number;
  yardsPerPointLast3: number;
  yardsPerPointLast1: number;
  yardsPerPointHome: number;
  yardsPerPointAway: number;

  // Power Ratings (optional, default to 0)
  fpiOverall: number;
  fpiOffense: number;
  fpiDefense: number;
}
