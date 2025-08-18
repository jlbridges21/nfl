import type { SeasonStatsRow } from "../types/db";
import type { TeamStats } from "../types/model";

/**
 * Helper function to safely convert null/undefined to zero
 * Used internally by the mapper functions
 */
export function nullToZero(n: number | null | undefined): number {
  return n ?? 0;
}

/**
 * Maps a raw SeasonStatsRow from the database to a compact TeamStats object
 * for use by the scoring engine. All numeric values are coerced to numbers
 * with null/undefined values defaulting to 0.
 */
export function toTeamStats(row: SeasonStatsRow): TeamStats {
  return {
    // Core identifier
    year: nullToZero(typeof row.year === "string" ? parseFloat(row.year) : row.year),

    // Offense - Yards per Game
    yardsPerGameSeason: nullToZero(typeof row.yardsPerGame === "string" ? parseFloat(row.yardsPerGame) : row.yardsPerGame),
    yardsPerGameLast3: nullToZero(typeof row.yardsPerGameLast3 === "string" ? parseFloat(row.yardsPerGameLast3) : row.yardsPerGameLast3),
    yardsPerGameLast1: nullToZero(typeof row.yardsPerGameLast1 === "string" ? parseFloat(row.yardsPerGameLast1) : row.yardsPerGameLast1),
    yardsPerGameHome: nullToZero(typeof row.yardsPerGameHome === "string" ? parseFloat(row.yardsPerGameHome) : row.yardsPerGameHome),
    yardsPerGameAway: nullToZero(typeof row.yardsPerGameAway === "string" ? parseFloat(row.yardsPerGameAway) : row.yardsPerGameAway),

    // Offense - Points per Game
    pointsPerGameSeason: nullToZero(typeof row.pointsPerGame === "string" ? parseFloat(row.pointsPerGame) : row.pointsPerGame),
    pointsPerGameLast3: nullToZero(typeof row.pointsPerGameLast3 === "string" ? parseFloat(row.pointsPerGameLast3) : row.pointsPerGameLast3),
    pointsPerGameLast1: nullToZero(typeof row.pointsPerGameLast1 === "string" ? parseFloat(row.pointsPerGameLast1) : row.pointsPerGameLast1),
    pointsPerGameHome: nullToZero(typeof row.pointsPerGameHome === "string" ? parseFloat(row.pointsPerGameHome) : row.pointsPerGameHome),
    pointsPerGameAway: nullToZero(typeof row.pointsPerGameAway === "string" ? parseFloat(row.pointsPerGameAway) : row.pointsPerGameAway),

    // Offense - Touchdowns per Game (season only for now)
    touchdownsPerGameSeason: nullToZero(typeof row.touchdownsPerGame === "string" ? parseFloat(row.touchdownsPerGame) : row.touchdownsPerGame),

    // Defense - Allowed per Game
    defensiveYardsAllowedSeason: nullToZero(typeof row.opponentYardsPerGame === "string" ? parseFloat(row.opponentYardsPerGame) : row.opponentYardsPerGame),
    defensivePointsAllowedSeason: nullToZero(typeof row.opponentPointsPerGame === "string" ? parseFloat(row.opponentPointsPerGame) : row.opponentPointsPerGame),

    // Efficiency - Yards per Point
    yardsPerPointSeason: nullToZero(typeof row.yardsPerPoint === "string" ? parseFloat(row.yardsPerPoint) : row.yardsPerPoint),
    yardsPerPointLast3: nullToZero(typeof row.yardsPerPointLast3 === "string" ? parseFloat(row.yardsPerPointLast3) : row.yardsPerPointLast3),
    yardsPerPointLast1: nullToZero(typeof row.yardsPerPointLast1 === "string" ? parseFloat(row.yardsPerPointLast1) : row.yardsPerPointLast1),
    yardsPerPointHome: nullToZero(typeof row.yardsPerPointHome === "string" ? parseFloat(row.yardsPerPointHome) : row.yardsPerPointHome),
    yardsPerPointAway: nullToZero(typeof row.yardsPerPointAway === "string" ? parseFloat(row.yardsPerPointAway) : row.yardsPerPointAway),

    // Power Ratings (optional, default to 0)
    fpiOverall: nullToZero(typeof row.fpi === "string" ? parseFloat(row.fpi) : row.fpi),
    fpiOffense: nullToZero(typeof row.fpiOffense === "string" ? parseFloat(row.fpiOffense) : row.fpiOffense),
    fpiDefense: nullToZero(typeof row.fpiDefense === "string" ? parseFloat(row.fpiDefense) : row.fpiDefense),
  };
}
