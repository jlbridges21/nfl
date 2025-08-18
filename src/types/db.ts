/**
 * Raw database row types matching the exact schema structure
 * All field names converted from snake_case to camelCase
 */

export interface TeamsRow {
  id: string;
  name: string;
  abbreviation: string;
  conference: "AFC" | "NFC";
  division: "East" | "North" | "South" | "West";
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export interface SeasonStatsRow {
  // Core identifiers
  id: string;
  teamId: string;
  year: number | string | null;

  // Offense - Yards per Game
  yardsPerGame: number | string | null;
  yardsPerGameLast3: number | string | null;
  yardsPerGameLast1: number | string | null;
  yardsPerGameHome: number | string | null;
  yardsPerGameAway: number | string | null;

  // Offense - Points per Game
  pointsPerGame: number | string | null;
  pointsPerGameLast3: number | string | null;
  pointsPerGameLast1: number | string | null;
  pointsPerGameHome: number | string | null;
  pointsPerGameAway: number | string | null;

  // Offense - Touchdowns per Game
  touchdownsPerGame: number | string | null;
  touchdownsPerGameLast3: number | string | null;
  touchdownsPerGameLast1: number | string | null;
  touchdownsPerGameHome: number | string | null;
  touchdownsPerGameAway: number | string | null;

  // Offense - Passing Yards per Game
  passingYardsPerGame: number | string | null;
  passingYardsPerGameLast3: number | string | null;
  passingYardsPerGameLast1: number | string | null;
  passingYardsPerGameHome: number | string | null;
  passingYardsPerGameAway: number | string | null;

  // Offense - Rushing Yards per Game
  rushingYardsPerGame: number | string | null;
  rushingYardsPerGameLast3: number | string | null;
  rushingYardsPerGameLast1: number | string | null;
  rushingYardsPerGameHome: number | string | null;
  rushingYardsPerGameAway: number | string | null;

  // Offense - Red Zone Scores per Game (TD only)
  redZoneScoresPerGameTdOnly: number | string | null;
  redZoneScoresPerGameTdOnlyLast3: number | string | null;
  redZoneScoresPerGameTdOnlyLast1: number | string | null;
  redZoneScoresPerGameTdOnlyHome: number | string | null;
  redZoneScoresPerGameTdOnlyAway: number | string | null;

  // Defense - Opponent Yards per Game
  opponentYardsPerGame: number | string | null;
  opponentYardsPerGameLast3: number | string | null;
  opponentYardsPerGameLast1: number | string | null;
  opponentYardsPerGameHome: number | string | null;
  opponentYardsPerGameAway: number | string | null;

  // Defense - Opponent Points per Game
  opponentPointsPerGame: number | string | null;
  opponentPointsPerGameLast3: number | string | null;
  opponentPointsPerGameLast1: number | string | null;
  opponentPointsPerGameHome: number | string | null;
  opponentPointsPerGameAway: number | string | null;

  // Defense - Opponent Passing Yards per Game
  opponentPassingYardsPerGame: number | string | null;
  opponentPassingYardsPerGameLast3: number | string | null;
  opponentPassingYardsPerGameLast1: number | string | null;
  opponentPassingYardsPerGameHome: number | string | null;
  opponentPassingYardsPerGameAway: number | string | null;

  // Defense - Opponent Rushing Yards per Game
  opponentRushingYardsPerGame: number | string | null;
  opponentRushingYardsPerGameLast3: number | string | null;
  opponentRushingYardsPerGameLast1: number | string | null;
  opponentRushingYardsPerGameHome: number | string | null;
  opponentRushingYardsPerGameAway: number | string | null;

  // Defense - Opponent Red Zone Scores per Game (TDs only)
  opponentRedZoneScoresPerGameTdsOnly: number | string | null;
  opponentRedZoneScoresPerGameTdsOnlyLast3: number | string | null;
  opponentRedZoneScoresPerGameTdsOnlyLast1: number | string | null;
  opponentRedZoneScoresPerGameTdsOnlyHome: number | string | null;
  opponentRedZoneScoresPerGameTdsOnlyAway: number | string | null;

  // Efficiency - Average Scoring Margin
  averageScoringMargin: number | string | null;
  averageScoringMarginLast3: number | string | null;
  averageScoringMarginLast1: number | string | null;
  averageScoringMarginHome: number | string | null;
  averageScoringMarginAway: number | string | null;

  // Efficiency - Yards per Point
  yardsPerPoint: number | string | null;
  yardsPerPointLast3: number | string | null;
  yardsPerPointLast1: number | string | null;
  yardsPerPointHome: number | string | null;
  yardsPerPointAway: number | string | null;

  // Power Ratings (optional)
  fpi: number | string | null;
  fpiOffense: number | string | null;
  fpiDefense: number | string | null;
}
