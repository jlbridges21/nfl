import { z } from "zod";
import type { TeamsRow, SeasonStatsRow } from "../types/db";

/**
 * Helper function to coerce various input types to numbers
 * Handles null, undefined, empty strings, and string numbers
 */
const coerceToNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined || val === "") return 0;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  });

/**
 * Zod schema for Teams table validation
 */
export const ZTeamsRow = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  conference: z.enum(["AFC", "NFC"]),
  division: z.enum(["East", "North", "South", "West"]),
  logoUrl: z.string().nullable(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
}) satisfies z.ZodType<TeamsRow>;

/**
 * Zod schema for SeasonStats table validation
 * All numeric fields use coerceToNumber to handle null/string inputs
 */
export const ZSeasonStatsRow = z.object({
  // Core identifiers
  id: z.string(),
  teamId: z.string(),
  year: coerceToNumber,

  // Offense - Yards per Game
  yardsPerGame: coerceToNumber,
  yardsPerGameLast3: coerceToNumber,
  yardsPerGameLast1: coerceToNumber,
  yardsPerGameHome: coerceToNumber,
  yardsPerGameAway: coerceToNumber,

  // Offense - Points per Game
  pointsPerGame: coerceToNumber,
  pointsPerGameLast3: coerceToNumber,
  pointsPerGameLast1: coerceToNumber,
  pointsPerGameHome: coerceToNumber,
  pointsPerGameAway: coerceToNumber,

  // Offense - Touchdowns per Game
  touchdownsPerGame: coerceToNumber,
  touchdownsPerGameLast3: coerceToNumber,
  touchdownsPerGameLast1: coerceToNumber,
  touchdownsPerGameHome: coerceToNumber,
  touchdownsPerGameAway: coerceToNumber,

  // Offense - Passing Yards per Game
  passingYardsPerGame: coerceToNumber,
  passingYardsPerGameLast3: coerceToNumber,
  passingYardsPerGameLast1: coerceToNumber,
  passingYardsPerGameHome: coerceToNumber,
  passingYardsPerGameAway: coerceToNumber,

  // Offense - Rushing Yards per Game
  rushingYardsPerGame: coerceToNumber,
  rushingYardsPerGameLast3: coerceToNumber,
  rushingYardsPerGameLast1: coerceToNumber,
  rushingYardsPerGameHome: coerceToNumber,
  rushingYardsPerGameAway: coerceToNumber,

  // Offense - Red Zone Scores per Game (TD only)
  redZoneScoresPerGameTdOnly: coerceToNumber,
  redZoneScoresPerGameTdOnlyLast3: coerceToNumber,
  redZoneScoresPerGameTdOnlyLast1: coerceToNumber,
  redZoneScoresPerGameTdOnlyHome: coerceToNumber,
  redZoneScoresPerGameTdOnlyAway: coerceToNumber,

  // Defense - Opponent Yards per Game
  opponentYardsPerGame: coerceToNumber,
  opponentYardsPerGameLast3: coerceToNumber,
  opponentYardsPerGameLast1: coerceToNumber,
  opponentYardsPerGameHome: coerceToNumber,
  opponentYardsPerGameAway: coerceToNumber,

  // Defense - Opponent Points per Game
  opponentPointsPerGame: coerceToNumber,
  opponentPointsPerGameLast3: coerceToNumber,
  opponentPointsPerGameLast1: coerceToNumber,
  opponentPointsPerGameHome: coerceToNumber,
  opponentPointsPerGameAway: coerceToNumber,

  // Defense - Opponent Passing Yards per Game
  opponentPassingYardsPerGame: coerceToNumber,
  opponentPassingYardsPerGameLast3: coerceToNumber,
  opponentPassingYardsPerGameLast1: coerceToNumber,
  opponentPassingYardsPerGameHome: coerceToNumber,
  opponentPassingYardsPerGameAway: coerceToNumber,

  // Defense - Opponent Rushing Yards per Game
  opponentRushingYardsPerGame: coerceToNumber,
  opponentRushingYardsPerGameLast3: coerceToNumber,
  opponentRushingYardsPerGameLast1: coerceToNumber,
  opponentRushingYardsPerGameHome: coerceToNumber,
  opponentRushingYardsPerGameAway: coerceToNumber,

  // Defense - Opponent Red Zone Scores per Game (TDs only)
  opponentRedZoneScoresPerGameTdsOnly: coerceToNumber,
  opponentRedZoneScoresPerGameTdsOnlyLast3: coerceToNumber,
  opponentRedZoneScoresPerGameTdsOnlyLast1: coerceToNumber,
  opponentRedZoneScoresPerGameTdsOnlyHome: coerceToNumber,
  opponentRedZoneScoresPerGameTdsOnlyAway: coerceToNumber,

  // Efficiency - Average Scoring Margin
  averageScoringMargin: coerceToNumber,
  averageScoringMarginLast3: coerceToNumber,
  averageScoringMarginLast1: coerceToNumber,
  averageScoringMarginHome: coerceToNumber,
  averageScoringMarginAway: coerceToNumber,

  // Efficiency - Yards per Point
  yardsPerPoint: coerceToNumber,
  yardsPerPointLast3: coerceToNumber,
  yardsPerPointLast1: coerceToNumber,
  yardsPerPointHome: coerceToNumber,
  yardsPerPointAway: coerceToNumber,

  // Power Ratings (optional)
  fpi: coerceToNumber,
  fpiOffense: coerceToNumber,
  fpiDefense: coerceToNumber,
}) satisfies z.ZodType<SeasonStatsRow>;

/**
 * Helper function to validate and parse Teams row data
 */
export function asTeamsRow(input: unknown): TeamsRow {
  return ZTeamsRow.parse(input);
}

/**
 * Helper function to validate and parse SeasonStats row data
 */
export function asSeasonStatsRow(input: unknown): SeasonStatsRow {
  return ZSeasonStatsRow.parse(input);
}
