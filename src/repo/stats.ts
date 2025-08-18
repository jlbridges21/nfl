import { supabaseServer } from '@/lib/supabase-server';
import { toTeamStats } from '@/lib/mappers';
import type { TeamsRow, SeasonStatsRow } from '@/types/db';
import type { TeamStats } from '@/types/model';
import type { Database } from '@/types/database';

type SeasonStatsDbRow = Database['public']['Tables']['season_stats']['Row'];
type TeamsDbRow = Database['public']['Tables']['teams']['Row'];

/**
 * Converts database row to SeasonStatsRow type expected by mapper
 */
function convertDbRowToSeasonStatsRow(dbRow: SeasonStatsDbRow): SeasonStatsRow {
  return {
    id: dbRow.id,
    teamId: dbRow.team_id,
    year: dbRow.Year,
    yardsPerGame: dbRow.Yards_per_Game,
    yardsPerGameLast3: dbRow.Yards_per_Game_Last_3,
    yardsPerGameLast1: dbRow.Yards_per_Game_Last_1,
    yardsPerGameHome: dbRow.Yards_per_Game_Home,
    yardsPerGameAway: dbRow.Yards_per_Game_Away,
    pointsPerGame: dbRow.Points_Per_Game,
    pointsPerGameLast3: dbRow.Points_Per_Game_Last_3,
    pointsPerGameLast1: dbRow.Points_Per_Game_Last_1,
    pointsPerGameHome: dbRow.Points_Per_Game_Home,
    pointsPerGameAway: dbRow.Points_Per_Game_Away,
    touchdownsPerGame: dbRow.Touchdowns_per_Game,
    touchdownsPerGameLast3: dbRow.Touchdowns_per_Game_Last_3,
    touchdownsPerGameLast1: dbRow.Touchdowns_per_Game_Last_1,
    touchdownsPerGameHome: dbRow.Touchdowns_per_Game_Home,
    touchdownsPerGameAway: dbRow.Touchdowns_per_Game_Away,
    passingYardsPerGame: dbRow.Passing_Yards_Per_Game,
    passingYardsPerGameLast3: dbRow.Passing_Yards_Per_Game_Last_3,
    passingYardsPerGameLast1: dbRow.Passing_Yards_Per_Game_Last_1,
    passingYardsPerGameHome: dbRow.Passing_Yards_Per_Game_Home,
    passingYardsPerGameAway: dbRow.Passing_Yards_Per_Game_Away,
    rushingYardsPerGame: dbRow.Rushing_Yards_Per_Game_,
    rushingYardsPerGameLast3: dbRow.Rushing_Yards_Per_Game_Last_3,
    rushingYardsPerGameLast1: dbRow.Rushing_Yards_Per_Game_Last_1,
    rushingYardsPerGameHome: dbRow.Rushing_Yards_Per_Game_Home,
    rushingYardsPerGameAway: dbRow.Rushing_Yards_Per_Game_Away,
    redZoneScoresPerGameTdOnly: dbRow.Red_Zone_Scores_Per_Game_TD_only,
    redZoneScoresPerGameTdOnlyLast3: dbRow.Red_Zone_Scores_Per_Game_TD_only_Last_3,
    redZoneScoresPerGameTdOnlyLast1: dbRow.Red_Zone_Scores_Per_Game_TD_only_Last_1,
    redZoneScoresPerGameTdOnlyHome: dbRow.Red_Zone_Scores_Per_Game_TD_only_Home,
    redZoneScoresPerGameTdOnlyAway: dbRow.Red_Zone_Scores_Per_Game_TD_only_Away,
    opponentYardsPerGame: dbRow.Opponent_Yards_per_Game,
    opponentYardsPerGameLast3: dbRow.Opponent_Yards_per_Game_Last_3,
    opponentYardsPerGameLast1: dbRow.Opponent_Yards_per_Game_Last_1,
    opponentYardsPerGameHome: dbRow.Opponent_Yards_per_Game_Home,
    opponentYardsPerGameAway: dbRow.Opponent_Yards_per_Game_Away,
    opponentPointsPerGame: dbRow.Opponent_Points_per_Game,
    opponentPointsPerGameLast3: dbRow.Opponent_Points_per_Game_Last_3,
    opponentPointsPerGameLast1: dbRow.Opponent_Points_per_Game_Last_1,
    opponentPointsPerGameHome: dbRow.Opponent_Points_per_Game_Home,
    opponentPointsPerGameAway: dbRow.Opponent_Points_per_Game_Away,
    opponentPassingYardsPerGame: dbRow.Opponent_Passing_Yards_per_Game,
    opponentPassingYardsPerGameLast3: dbRow.Opponent_Passing_Yards_per_Game_Last_3,
    opponentPassingYardsPerGameLast1: dbRow.Opponent_Passing_Yards_per_Game_Last_1,
    opponentPassingYardsPerGameHome: dbRow.Opponent_Passing_Yards_per_Game_Home,
    opponentPassingYardsPerGameAway: dbRow.Opponent_Passing_Yards_per_Game_Away,
    opponentRushingYardsPerGame: dbRow.Opponent_Rushing_Yards_per_Game,
    opponentRushingYardsPerGameLast3: dbRow.Opponent_Rushing_Yards_per_Game_Last_3,
    opponentRushingYardsPerGameLast1: dbRow.Opponent_Rushing_Yards_per_Game_Last_1,
    opponentRushingYardsPerGameHome: dbRow.Opponent_Rushing_Yards_per_Game_Home,
    opponentRushingYardsPerGameAway: dbRow.Opponent_Rushing_Yards_per_Game_Away,
    opponentRedZoneScoresPerGameTdsOnly: dbRow.Opponent_Red_Zone_Scores_per_Game_TDs_only,
    opponentRedZoneScoresPerGameTdsOnlyLast3: dbRow.Opponent_Red_Zone_Scores_per_Game_TDs_only_Last_3,
    opponentRedZoneScoresPerGameTdsOnlyLast1: dbRow.Opponent_Red_Zone_Scores_per_Game_TDs_only_Last_1,
    opponentRedZoneScoresPerGameTdsOnlyHome: dbRow.Opponent_Red_Zone_Scores_per_Game_TDs_only_Home,
    opponentRedZoneScoresPerGameTdsOnlyAway: dbRow.Opponent_Red_Zone_Scores_per_Game_TDs_only_Away,
    averageScoringMargin: dbRow.Average_Scoring_Margin,
    averageScoringMarginLast3: dbRow.Average_Scoring_Margin_Last_3,
    averageScoringMarginLast1: dbRow.Average_Scoring_Margin_Last_1,
    averageScoringMarginHome: dbRow.Average_Scoring_Margin_Home,
    averageScoringMarginAway: dbRow.Average_Scoring_Margin_Away,
    yardsPerPoint: dbRow.Yards_Per_Point,
    yardsPerPointLast3: dbRow.Yards_Per_Point_Last_3,
    yardsPerPointLast1: dbRow.Yards_Per_Point_Last_1,
    yardsPerPointHome: dbRow.Yards_Per_Point_Home,
    yardsPerPointAway: dbRow.Yards_Per_Point_Away,
    fpi: dbRow.fpi,
    fpiOffense: dbRow.fpi_offense,
    fpiDefense: dbRow.fpi_defense,
  };
}

/**
 * Converts database row to TeamsRow type
 */
function convertDbRowToTeamsRow(dbRow: TeamsDbRow): TeamsRow {
  return {
    id: dbRow.id,
    name: dbRow.name,
    abbreviation: dbRow.abbreviation,
    conference: dbRow.conference,
    division: dbRow.division,
    logoUrl: dbRow.logo_url,
    primaryColor: dbRow.primary_color,
    secondaryColor: dbRow.secondary_color,
  };
}

export interface LeagueAvgs {
  leagueAvgDefensiveYardsAllowed: number;
  leagueAvgDefensivePointsAllowed: number;
  leagueAvgYardsPerPoint: number;
}

export interface ModelInputs {
  year: number;
  home: {
    team: TeamsRow;
    stats: TeamStats;
  };
  away: {
    team: TeamsRow;
    stats: TeamStats;
  };
  league: LeagueAvgs;
}

/**
 * Resolves the latest common year between two teams
 * Returns the maximum year where both teams have stats, or global max if no intersection
 */
export async function resolveLatestCommonYear(
  homeTeamId: string,
  awayTeamId: string
): Promise<number> {
  // Get distinct years for home team
  const { data: homeYears, error: homeError } = await supabaseServer
    .from('season_stats')
    .select('"Year"')
    .eq('team_id', homeTeamId)
    .not('"Year"', 'is', null);

  if (homeError) {
    throw new Error(`Failed to fetch years for home team: ${homeError.message}`);
  }

  // Get distinct years for away team
  const { data: awayYears, error: awayError } = await supabaseServer
    .from('season_stats')
    .select('"Year"')
    .eq('team_id', awayTeamId)
    .not('"Year"', 'is', null);

  if (awayError) {
    throw new Error(`Failed to fetch years for away team: ${awayError.message}`);
  }

  // Extract unique years for each team
  const homeYearSet = new Set(homeYears?.map(row => Number(row.Year)) || []);
  const awayYearSet = new Set(awayYears?.map(row => Number(row.Year)) || []);

  // Find intersection
  const commonYears = [...homeYearSet].filter(year => awayYearSet.has(year));

  if (commonYears.length > 0) {
    return Math.max(...commonYears);
  }

  // No intersection, get global max year
  const { data: globalYears, error: globalError } = await supabaseServer
    .from('season_stats')
    .select('"Year"')
    .not('"Year"', 'is', null)
    .order('"Year"', { ascending: false })
    .limit(1);

  if (globalError) {
    throw new Error(`Failed to fetch global max year: ${globalError.message}`);
  }

  if (!globalYears || globalYears.length === 0) {
    throw new Error('No season stats data found');
  }

  return Number(globalYears[0].Year);
}

/**
 * Gets team stats for a specific team and year
 */
export async function getTeamStats(
  teamFilter: { id: string },
  year: number
): Promise<TeamStats> {
  const { data, error } = await supabaseServer
    .from('season_stats')
    .select('*')
    .eq('team_id', teamFilter.id)
    .eq('"Year"', year)
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch team stats: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`No stats found for team ${teamFilter.id} in year ${year}`);
  }

  // Take the first record if multiple exist
  return toTeamStats(convertDbRowToSeasonStatsRow(data[0]));
}

/**
 * Gets league averages for a specific year
 */
export async function getLeagueAverages(year: number): Promise<LeagueAvgs> {
  const { data, error } = await supabaseServer
    .from('season_stats')
    .select('"Opponent_Yards_per_Game", "Opponent_Points_per_Game", "Yards_Per_Point"')
    .eq('"Year"', year)
    .not('"Opponent_Yards_per_Game"', 'is', null)
    .not('"Opponent_Points_per_Game"', 'is', null)
    .not('"Yards_Per_Point"', 'is', null);

  if (error) {
    throw new Error(`Failed to fetch league averages: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`No league data found for year ${year}`);
  }

  // Calculate averages
  const validYardsAllowed = data
    .map(row => Number(row.Opponent_Yards_per_Game))
    .filter(val => !isNaN(val) && val > 0);
  
  const validPointsAllowed = data
    .map(row => Number(row.Opponent_Points_per_Game))
    .filter(val => !isNaN(val) && val > 0);
  
  const validYardsPerPoint = data
    .map(row => Number(row.Yards_Per_Point))
    .filter(val => !isNaN(val) && val > 0);

  if (validYardsAllowed.length === 0 || validPointsAllowed.length === 0 || validYardsPerPoint.length === 0) {
    throw new Error(`Insufficient valid data for league averages in year ${year}`);
  }

  return {
    leagueAvgDefensiveYardsAllowed: validYardsAllowed.reduce((a, b) => a + b, 0) / validYardsAllowed.length,
    leagueAvgDefensivePointsAllowed: validPointsAllowed.reduce((a, b) => a + b, 0) / validPointsAllowed.length,
    leagueAvgYardsPerPoint: validYardsPerPoint.reduce((a, b) => a + b, 0) / validYardsPerPoint.length,
  };
}

/**
 * Gets team data by ID
 */
export async function getTeamById(teamId: string): Promise<TeamsRow> {
  const { data, error } = await supabaseServer
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch team: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Team not found: ${teamId}`);
  }

  return convertDbRowToTeamsRow(data);
}

/**
 * Gets model inputs for prediction
 * Automatically resolves the latest common year and fetches all required data
 */
export async function getModelInputs(
  homeId: string,
  awayId: string
): Promise<ModelInputs> {
  // Resolve the year to use
  const year = await resolveLatestCommonYear(homeId, awayId);

  // Fetch team data
  const [homeTeam, awayTeam] = await Promise.all([
    getTeamById(homeId),
    getTeamById(awayId),
  ]);

  // Fetch team stats
  const [homeStats, awayStats] = await Promise.all([
    getTeamStats({ id: homeId }, year),
    getTeamStats({ id: awayId }, year),
  ]);

  // Fetch league averages
  const league = await getLeagueAverages(year);

  return {
    year,
    home: {
      team: homeTeam,
      stats: homeStats,
    },
    away: {
      team: awayTeam,
      stats: awayStats,
    },
    league,
  };
}
