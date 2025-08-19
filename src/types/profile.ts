export interface PredictionEnriched {
  // From predictions table
  id: string
  user_id: string
  game_id: string
  predicted_home_score: number
  predicted_away_score: number
  user_configuration: Record<string, any> | null
  was_accurate: boolean | null
  error_margin: number | null
  created_at: string

  // From teams table (home team)
  home_team_name: string
  home_team_abbr: string
  home_team_logo: string | null

  // From teams table (away team)
  away_team_name: string
  away_team_abbr: string
  away_team_logo: string | null

  // From games table
  season_year: number
  week_name: string
  home_score: number | null
  away_score: number | null
  box_home: string | null
  box_away: string | null
}

export interface BoxScore {
  q1: number
  q2: number
  q3: number
  q4: number
  ot?: number
}
