/**
 * SportsDataIO NFL API Service - Client-side proxy version
 * Routes requests through our secure API proxy at /api/sportsdata
 */

const API_PROXY_BASE_URL = '/api/sportsdata'

class SportsDataAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'SportsDataAPIError'
  }
}

async function apiRequest<T>(endpoint: string): Promise<T> {
  const url = `${API_PROXY_BASE_URL}/${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 5 minutes for most requests
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new SportsDataAPIError(
        errorData.error || `API request failed: ${response.status} ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof SportsDataAPIError) {
      throw error
    }
    throw new SportsDataAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export const sportsDataAPI = {
  // Team information & logos
  async getTeams() {
    return apiRequest<NFLTeam[]>('scores/json/Teams')
  },

  // Player roster & headshots
  async getPlayersByTeam(teamKey: string) {
    return apiRequest<NFLPlayer[]>(`scores/json/Players/${teamKey}`)
  },

  // Player season stats
  async getPlayerSeasonStatsByTeam(season: number, teamKey: string) {
    return apiRequest<NFLPlayerSeasonStats[]>(`stats/json/PlayerSeasonStatsByTeam/${season}/${teamKey}`)
  },

  // Team season stats
  async getTeamSeasonStats(season: number) {
    return apiRequest<NFLTeamSeasonStats[]>(`stats/json/TeamSeasonStats/${season}`)
  },

  // Scoreboard by week
  async getScoresByWeek(season: number, week: number) {
    return apiRequest<NFLGame[]>(`scores/json/ScoresByWeek/${season}/${week}`)
  },

  // Get all scores for the season (weeks 1-18)
  async getAllScoresForSeason(season: number) {
    const weeks = Array.from({ length: 18 }, (_, i) => i + 1)
    const promises = weeks.map(week => 
      this.getScoresByWeek(season, week).catch(error => {
        console.warn(`Failed to fetch week ${week}:`, error)
        return []
      })
    )
    
    const results = await Promise.all(promises)
    return results.map((games, index) => ({
      week: index + 1,
      games
    }))
  },

}

// Type definitions for SportsDataIO API responses
export interface NFLTeam {
  Key: string
  TeamID: number
  PlayerID?: number
  City: string
  Name: string
  Conference: string
  Division: string
  FullName: string
  StadiumID?: number
  ByeWeek?: number
  AverageDraftPosition?: number
  AverageDraftPositionPPR?: number
  HeadCoach?: string
  OffensiveCoordinator?: string
  DefensiveCoordinator?: string
  OffensiveScheme?: string
  DefensiveScheme?: string
  UpcomingSalary?: number
  UpcomingOpponent?: string
  UpcomingOpponentRank?: number
  UpcomingOpponentPositionRank?: number
  UpcomingFanDuelSalary?: number
  UpcomingDraftKingsSalary?: number
  UpcomingYahooSalary?: number
  PrimaryColor?: string
  SecondaryColor?: string
  TertiaryColor?: string
  QuaternaryColor?: string
  WikipediaLogoUrl?: string
  WikipediaWordMarkUrl?: string
  GlobalTeamID?: number
  DraftKingsName?: string
  DraftKingsPlayerID?: number
  FanDuelName?: string
  FanDuelPlayerID?: number
  FantasyDraftName?: string
  FantasyDraftPlayerID?: number
  YahooName?: string
  YahooPlayerID?: number
}

export interface NFLPlayer {
  PlayerID: number
  Team: string
  Number?: number
  FirstName: string
  LastName: string
  Position: string
  Status: string
  Height?: string
  Weight?: number
  BirthDate?: string
  College?: string
  Experience?: number
  FantasyPosition?: string
  Active: boolean
  PositionCategory?: string
  Name: string
  Age?: number
  PhotoUrl?: string
  ByeWeek?: number
  UpcomingSalary?: number
  FanDuelSalary?: number
  DraftKingsSalary?: number
  YahooSalary?: number
  InjuryStatus?: string
  InjuryBodyPart?: string
  InjuryStartDate?: string
  InjuryNotes?: string
  FanDuelPosition?: string
  DraftKingsPosition?: string
  YahooPosition?: string
  OpponentRank?: number
  OpponentPositionRank?: number
  GlobalTeamID?: number
  GameID?: number
  OpponentID?: number
  Opponent?: string
  Day?: string
  DateTime?: string
  HomeOrAway?: string
  IsGameOver?: boolean
  GlobalGameID?: number
  GlobalOpponentID?: number
  Updated?: string
  CreatedDate?: string
  UpdatedDate?: string
  Games?: number
  FantasyPoints?: number
  FantasyPointsPPR?: number
  FantasyPointsFanDuel?: number
  FantasyPointsDraftKings?: number
  FantasyPointsYahoo?: number
  FantasyPointsSuperdraft?: number
  OffensiveTouchdowns?: number
  DefensiveTouchdowns?: number
  SpecialTeamsTouchdowns?: number
  Touchdowns?: number
  FantasyPosition2?: string
  FantasyPoints2?: number
  FantasyPointsPPR2?: number
  UsaTodayPlayerID?: number
  UsaTodayHeadshotUrl?: string
  UsaTodayHeadshotNoBackgroundUrl?: string
  UsaTodayHeadshotUpdated?: string
  UsaTodayHeadshotNoBackgroundUpdated?: string
}

export interface NFLPlayerSeasonStats {
  StatID?: number
  TeamID?: number
  PlayerID?: number
  SeasonType?: number
  Season?: number
  Name?: string
  Team?: string
  Position?: string
  Number?: number
  Age?: number
  Experience?: number
  FantasyPosition?: string
  Active?: boolean
  Played?: number
  Started?: number
  PassingAttempts?: number
  PassingCompletions?: number
  PassingYards?: number
  PassingCompletionPercentage?: number
  PassingYardsPerAttempt?: number
  PassingYardsPerCompletion?: number
  PassingTouchdowns?: number
  PassingInterceptions?: number
  PassingRating?: number
  PassingLong?: number
  PassingSacks?: number
  PassingSackYards?: number
  RushingAttempts?: number
  RushingYards?: number
  RushingYardsPerAttempt?: number
  RushingTouchdowns?: number
  RushingLong?: number
  ReceivingTargets?: number
  Receptions?: number
  ReceivingYards?: number
  ReceivingYardsPerReception?: number
  ReceivingTouchdowns?: number
  ReceivingLong?: number
  Fumbles?: number
  FumblesLost?: number
  PuntReturns?: number
  PuntReturnYards?: number
  PuntReturnYardsPerAttempt?: number
  PuntReturnTouchdowns?: number
  PuntReturnLong?: number
  KickReturns?: number
  KickReturnYards?: number
  KickReturnYardsPerAttempt?: number
  KickReturnTouchdowns?: number
  KickReturnLong?: number
  SoloTackles?: number
  AssistedTackles?: number
  TacklesForLoss?: number
  Sacks?: number
  SackYards?: number
  QuarterbackHits?: number
  PassesDefended?: number
  FumblesForced?: number
  FumblesRecovered?: number
  FumbleReturnYards?: number
  FumbleReturnTouchdowns?: number
  Interceptions?: number
  InterceptionReturnYards?: number
  InterceptionReturnTouchdowns?: number
  BlockedKicks?: number
  SpecialTeamsSoloTackles?: number
  SpecialTeamsAssistedTackles?: number
  MiscSoloTackles?: number
  MiscAssistedTackles?: number
  Punts?: number
  PuntYards?: number
  PuntAverage?: number
  FieldGoalsAttempted?: number
  FieldGoalsMade?: number
  FieldGoalsLongestMade?: number
  ExtraPointsMade?: number
  TwoPointConversionPasses?: number
  TwoPointConversionRuns?: number
  TwoPointConversionReceptions?: number
  FantasyPoints?: number
  FantasyPointsPPR?: number
  ReceptionPercentage?: number
  ReceivingYardsPerTarget?: number
  Tackles?: number
  OffensiveTouchdowns?: number
  DefensiveTouchdowns?: number
  SpecialTeamsTouchdowns?: number
  Touchdowns?: number
  FantasyPosition2?: string
  FieldGoalPercentage?: number
  PlayerGameID?: number
  FumblesOwnRecoveries?: number
  FumblesOutOfBounds?: number
  KickReturnFairCatches?: number
  PuntReturnFairCatches?: number
  PuntTouchbacks?: number
  PuntInside20?: number
  PuntNetAverage?: number
  ExtraPointsAttempted?: number
  BlockedKickReturnTouchdowns?: number
  FieldGoalReturnTouchdowns?: number
  Safeties?: number
  FieldGoalsHadBlocked?: number
  PuntsHadBlocked?: number
  ExtraPointsHadBlocked?: number
  PuntLong?: number
  BlockedKickReturnYards?: number
  FieldGoalReturnYards?: number
  PuntNetYards?: number
  SpecialTeamsFumblesForced?: number
  SpecialTeamsFumblesRecovered?: number
  MiscFumblesForced?: number
  MiscFumblesRecovered?: number
  ShortName?: string
  PlayingSurface?: string
  IsGameOver?: boolean
  SafetiesAllowed?: number
  Stadium?: string
  Temperature?: number
  Humidity?: number
  WindSpeed?: number
  FanDuelSalary?: number
  DraftKingsSalary?: number
  FantasyDataSalary?: number
  OffensiveSnapsPlayed?: number
  DefensiveSnapsPlayed?: number
  SpecialTeamsSnapsPlayed?: number
  OffensiveTeamSnaps?: number
  DefensiveTeamSnaps?: number
  SpecialTeamsTeamSnaps?: number
  VictivSalary?: number
  TwoPointConversionReturns?: number
  FantasyPointsFanDuel?: number
  FieldGoalsMade0to19?: number
  FieldGoalsMade20to29?: number
  FieldGoalsMade30to39?: number
  FieldGoalsMade40to49?: number
  FieldGoalsMade50Plus?: number
  FantasyPointsDraftKings?: number
  YahooSalary?: number
  FantasyPointsYahoo?: number
  InjuryStatus?: string
  InjuryBodyPart?: string
  InjuryStartDate?: string
  InjuryNotes?: string
  FanDuelPosition?: string
  DraftKingsPosition?: string
  YahooPosition?: string
  OpponentRank?: number
  OpponentPositionRank?: number
  GlobalTeamID?: number
  Updated?: string
  Games?: number
  FantasyPointsSuperdraft?: number
  FantasyPointsSuperDraft?: number
  YahooPosition2?: string
  SuperDraftSalary?: number
}

export interface NFLTeamSeasonStats {
  StatID?: number
  TeamID?: number
  SeasonType?: number
  Season?: number
  Name?: string
  Team?: string
  Wins?: number
  Losses?: number
  Ties?: number
  WinPercentage?: number
  DivisionWins?: number
  DivisionLosses?: number
  ConferenceWins?: number
  ConferenceLosses?: number
  TeamStatID?: number
  Games?: number
  FantasyPoints?: number
  PassingDropbacks?: number
  PassingInterceptions?: number
  PointsAllowed?: number
  InternalId?: string
  Updated?: string
  LineupConfirmed?: boolean
  LineupPublished?: boolean
  OffensiveCoordinator?: string
  DefensiveCoordinator?: string
  SpecialTeamsCoach?: string
  OffensiveScheme?: string
  DefensiveScheme?: string
  UpcomingSalary?: number
  PassingAttempts?: number
  PassingCompletions?: number
  PassingYards?: number
  PassingCompletionPercentage?: number
  PassingYardsPerAttempt?: number
  PassingYardsPerCompletion?: number
  PassingTouchdowns?: number
  PassingRating?: number
  PassingLong?: number
  PassingSacks?: number
  PassingSackYards?: number
  RushingAttempts?: number
  RushingYards?: number
  RushingYardsPerAttempt?: number
  RushingTouchdowns?: number
  RushingLong?: number
  PuntReturns?: number
  PuntReturnYards?: number
  PuntReturnYardsPerAttempt?: number
  PuntReturnTouchdowns?: number
  PuntReturnLong?: number
  KickReturns?: number
  KickReturnYards?: number
  KickReturnYardsPerAttempt?: number
  KickReturnTouchdowns?: number
  KickReturnLong?: number
  SoloTackles?: number
  AssistedTackles?: number
  Sacks?: number
  SackYards?: number
  PassesDefended?: number
  FumblesForced?: number
  FumblesRecovered?: number
  FumbleReturnYards?: number
  FumbleReturnTouchdowns?: number
  InterceptionReturnYards?: number
  InterceptionReturnTouchdowns?: number
  BlockedKicks?: number
  Punts?: number
  PuntYards?: number
  PuntAverage?: number
  FieldGoalsAttempted?: number
  FieldGoalsMade?: number
  FieldGoalsLongestMade?: number
  ExtraPointsMade?: number
  TwoPointConversionPasses?: number
  TwoPointConversionRuns?: number
  TwoPointConversionReceptions?: number
  FantasyPointsAllowed?: number
  Fumbles?: number
  FumblesLost?: number
  TacklesForLoss?: number
  QuarterbackHits?: number
  OffensiveTouchdowns?: number
  DefensiveTouchdowns?: number
  SpecialTeamsTouchdowns?: number
  Touchdowns?: number
  GlobalTeamID?: number
  DraftKingsPosition?: string
  FanDuelPosition?: string
  FantasyDraftPosition?: string
  YahooPosition?: string
}


export interface NFLGame {
  GameKey?: string
  SeasonType?: number
  Season?: number
  Week?: number
  Date?: string
  AwayTeam?: string
  HomeTeam?: string
  Channel?: string
  PointSpread?: number
  OverUnder?: number
  Quarter?: string
  TimeRemaining?: string
  Possession?: string
  Down?: number
  Distance?: number
  YardLine?: number
  YardLineTerritory?: string
  RedZone?: string
  AwayScoreQuarter1?: number
  AwayScoreQuarter2?: number
  AwayScoreQuarter3?: number
  AwayScoreQuarter4?: number
  AwayScoreOvertime?: number
  HomeScoreQuarter1?: number
  HomeScoreQuarter2?: number
  HomeScoreQuarter3?: number
  HomeScoreQuarter4?: number
  HomeScoreOvertime?: number
  AwayTimeouts?: number
  HomeTimeouts?: number
  AwayScore?: number
  HomeScore?: number
  IsOver?: boolean
  IsInProgress?: boolean
  HasStarted?: boolean
  IsOvertime?: boolean
  DownAndDistance?: string
  QuarterDescription?: string
  StadiumID?: number
  LastUpdated?: string
  GeoLat?: number
  GeoLong?: number
  ForecastTempLow?: number
  ForecastTempHigh?: number
  ForecastDescription?: string
  ForecastWindChill?: number
  ForecastWindSpeed?: number
  AwayTeamMoneyLine?: number
  HomeTeamMoneyLine?: number
  Canceled?: boolean
  Closed?: boolean
  LastPlay?: string
  Day?: string
  DateTime?: string
  AwayTeamID?: number
  HomeTeamID?: number
  GlobalGameID?: number
  GlobalAwayTeamID?: number
  GlobalHomeTeamID?: number
  PointSpreadAwayTeamMoneyLine?: number
  PointSpreadHomeTeamMoneyLine?: number
  ScoreID?: number
  Status?: string
  GameEndDateTime?: string
  HomeRotationNumber?: number
  AwayRotationNumber?: number
  NeutralVenue?: boolean
  OverPayout?: number
  UnderPayout?: number
  HomeTimeoutsUsed?: number
  AwayTimeoutsUsed?: number
  HomeTimeoutsRemaining?: number
  AwayTimeoutsRemaining?: number
  IsClosed?: boolean
}
