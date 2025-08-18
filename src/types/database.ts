export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      headshots: {
        Row: {
          player_id: number
          name: string
          team_id: number | null
          team: string | null
          position: string
          preferred_hosted_headshot_url: string
          hosted_headshot_with_background_url: string
          hosted_headshot_no_background_url: string
          updated_at: string
        }
        Insert: {
          player_id: number
          name: string
          team_id?: number | null
          team?: string | null
          position: string
          preferred_hosted_headshot_url: string
          hosted_headshot_with_background_url: string
          hosted_headshot_no_background_url: string
          updated_at?: string
        }
        Update: {
          player_id?: number
          name?: string
          team_id?: number | null
          team?: string | null
          position?: string
          preferred_hosted_headshot_url?: string
          hosted_headshot_with_background_url?: string
          hosted_headshot_no_background_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          abbreviation: string
          conference: "AFC" | "NFC"
          division: "East" | "North" | "South" | "West"
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
        }
        Insert: {
          id?: string
          name: string
          abbreviation: string
          conference: "AFC" | "NFC"
          division: "East" | "North" | "South" | "West"
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
        }
        Update: {
          id?: string
          name?: string
          abbreviation?: string
          conference?: "AFC" | "NFC"
          division?: "East" | "North" | "South" | "West"
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
        }
        Relationships: []
      }
      espn_games: {
        Row: {
          game_id: string
          season_year: number
          season_type: number
          week_num: number
          week_name: string
          date_local: string
          time_local: string
          datetime_utc: string
          away_team: string
          away_abbr: string
          away_id: number
          away_display_name: string
          home_team: string
          home_abbr: string
          home_id: number
          home_display_name: string
          away_score: number | null
          home_score: number | null
          period: string | null
          display_clock: string | null
          situation: string | null
          possession_team: string | null
          game_status: string
          final_score: string | null
          total_points: number | null
          over_under: number | null
          odds: string | null
          favored_team: string | null
          spread: number | null
          favored_team_cover: boolean | null
          box_home: string | null
          box_away: string | null
          game_winner: string | null
          game_loser: string | null
          game_final_over: number | null
          game_final_under: number | null
          broadcasts: string | null
          home_total_yards: number | null
          away_total_yards: number | null
          freeze_odds: boolean
          updated_at: string
        }
        Insert: {
          game_id: string
          season_year: number
          season_type: number
          week_num: number
          week_name: string
          date_local: string
          time_local: string
          datetime_utc: string
          away_team: string
          away_abbr: string
          away_id: number
          away_display_name: string
          home_team: string
          home_abbr: string
          home_id: number
          home_display_name: string
          away_score?: number | null
          home_score?: number | null
          period?: string | null
          display_clock?: string | null
          situation?: string | null
          possession_team?: string | null
          game_status: string
          final_score?: string | null
          total_points?: number | null
          over_under?: number | null
          odds?: string | null
          favored_team?: string | null
          spread?: number | null
          favored_team_cover?: boolean | null
          box_home?: string | null
          box_away?: string | null
          game_winner?: string | null
          game_loser?: string | null
          game_final_over?: number | null
          game_final_under?: number | null
          broadcasts?: string | null
          home_total_yards?: number | null
          away_total_yards?: number | null
          freeze_odds?: boolean
          updated_at?: string
        }
        Update: {
          game_id?: string
          season_year?: number
          season_type?: number
          week_num?: number
          week_name?: string
          date_local?: string
          time_local?: string
          datetime_utc?: string
          away_team?: string
          away_abbr?: string
          away_id?: number
          away_display_name?: string
          home_team?: string
          home_abbr?: string
          home_id?: number
          home_display_name?: string
          away_score?: number | null
          home_score?: number | null
          period?: string | null
          display_clock?: string | null
          situation?: string | null
          possession_team?: string | null
          game_status?: string
          final_score?: string | null
          total_points?: number | null
          over_under?: number | null
          odds?: string | null
          favored_team?: string | null
          spread?: number | null
          favored_team_cover?: boolean | null
          box_home?: string | null
          box_away?: string | null
          game_winner?: string | null
          game_loser?: string | null
          game_final_over?: number | null
          game_final_under?: number | null
          broadcasts?: string | null
          home_total_yards?: number | null
          away_total_yards?: number | null
          freeze_odds?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      season_stats: {
        Row: {
          id: string
          team_id: string
          Year: number | null
          Yards_per_Game: number | null
          "Yards_per_Game_(Last_3)": number | null
          "Yards_per_Game_(Last_1)": number | null
          "Yards_per_Game_(Home)": number | null
          "Yards_per_Game_(Away)": number | null
          Points_Per_Game: number | null
          "Points_Per_Game_(Last_3)": number | null
          "Points_Per_Game_(Last_1)": number | null
          "Points_Per_Game_(Home)": number | null
          "Points_Per_Game_(Away)": number | null
          Touchdowns_per_Game: number | null
          Touchdowns_per_Game_Last_3: number | null
          Touchdowns_per_Game_Last_1: number | null
          Touchdowns_per_Game_Home: number | null
          Touchdowns_per_Game_Away: number | null
          Passing_Yards_Per_Game: number | null
          Passing_Yards_Per_Game_Last_3: number | null
          Passing_Yards_Per_Game_Last_1: number | null
          Passing_Yards_Per_Game_Home: number | null
          Passing_Yards_Per_Game_Away: number | null
          Rushing_Yards_Per_Game_: number | null
          Rushing_Yards_Per_Game_Last_3: number | null
          Rushing_Yards_Per_Game_Last_1: number | null
          Rushing_Yards_Per_Game_Home: number | null
          Rushing_Yards_Per_Game_Away: number | null
          Red_Zone_Scores_Per_Game_TD_only: number | null
          Red_Zone_Scores_Per_Game_TD_only_Last_3: number | null
          Red_Zone_Scores_Per_Game_TD_only_Last_1: number | null
          Red_Zone_Scores_Per_Game_TD_only_Home: number | null
          Red_Zone_Scores_Per_Game_TD_only_Away: number | null
          Opponent_Yards_per_Game: number | null
          Opponent_Yards_per_Game_Last_3: number | null
          Opponent_Yards_per_Game_Last_1: number | null
          Opponent_Yards_per_Game_Home: number | null
          Opponent_Yards_per_Game_Away: number | null
          Opponent_Points_per_Game: number | null
          Opponent_Points_per_Game_Last_3: number | null
          Opponent_Points_per_Game_Last_1: number | null
          Opponent_Points_per_Game_Home: number | null
          Opponent_Points_per_Game_Away: number | null
          Opponent_Passing_Yards_per_Game: number | null
          Opponent_Passing_Yards_per_Game_Last_3: number | null
          Opponent_Passing_Yards_per_Game_Last_1: number | null
          Opponent_Passing_Yards_per_Game_Home: number | null
          Opponent_Passing_Yards_per_Game_Away: number | null
          Opponent_Rushing_Yards_per_Game: number | null
          Opponent_Rushing_Yards_per_Game_Last_3: number | null
          Opponent_Rushing_Yards_per_Game_Last_1: number | null
          Opponent_Rushing_Yards_per_Game_Home: number | null
          Opponent_Rushing_Yards_per_Game_Away: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Last_3: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Last_1: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Home: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Away: number | null
          Average_Scoring_Margin: number | null
          Average_Scoring_Margin_Last_3: number | null
          Average_Scoring_Margin_Last_1: number | null
          Average_Scoring_Margin_Home: number | null
          Average_Scoring_Margin_Away: number | null
          Yards_Per_Point: number | null
          Yards_Per_Point_Last_3: number | null
          Yards_Per_Point_Last_1: number | null
          Yards_Per_Point_Home: number | null
          Yards_Per_Point_Away: number | null
          fpi: number | null
          fpi_off: number | null
          fpi_def: number | null
        }
        Insert: {
          id?: string
          team_id: string
          Year?: number | null
          Yards_per_Game?: number | null
          Yards_per_Game_Last_3?: number | null
          Yards_per_Game_Last_1?: number | null
          Yards_per_Game_Home?: number | null
          Yards_per_Game_Away?: number | null
          Points_Per_Game?: number | null
          Points_Per_Game_Last_3?: number | null
          Points_Per_Game_Last_1?: number | null
          Points_Per_Game_Home?: number | null
          Points_Per_Game_Away?: number | null
          Touchdowns_per_Game?: number | null
          Touchdowns_per_Game_Last_3?: number | null
          Touchdowns_per_Game_Last_1?: number | null
          Touchdowns_per_Game_Home?: number | null
          Touchdowns_per_Game_Away?: number | null
          Passing_Yards_Per_Game?: number | null
          Passing_Yards_Per_Game_Last_3?: number | null
          Passing_Yards_Per_Game_Last_1?: number | null
          Passing_Yards_Per_Game_Home?: number | null
          Passing_Yards_Per_Game_Away?: number | null
          Rushing_Yards_Per_Game_?: number | null
          Rushing_Yards_Per_Game_Last_3?: number | null
          Rushing_Yards_Per_Game_Last_1?: number | null
          Rushing_Yards_Per_Game_Home?: number | null
          Rushing_Yards_Per_Game_Away?: number | null
          Red_Zone_Scores_Per_Game_TD_only?: number | null
          Red_Zone_Scores_Per_Game_TD_only_Last_3?: number | null
          Red_Zone_Scores_Per_Game_TD_only_Last_1?: number | null
          Red_Zone_Scores_Per_Game_TD_only_Home?: number | null
          Red_Zone_Scores_Per_Game_TD_only_Away?: number | null
          Opponent_Yards_per_Game?: number | null
          Opponent_Yards_per_Game_Last_3?: number | null
          Opponent_Yards_per_Game_Last_1?: number | null
          Opponent_Yards_per_Game_Home?: number | null
          Opponent_Yards_per_Game_Away?: number | null
          Opponent_Points_per_Game?: number | null
          Opponent_Points_per_Game_Last_3?: number | null
          Opponent_Points_per_Game_Last_1?: number | null
          Opponent_Points_per_Game_Home?: number | null
          Opponent_Points_per_Game_Away?: number | null
          Opponent_Passing_Yards_per_Game?: number | null
          Opponent_Passing_Yards_per_Game_Last_3?: number | null
          Opponent_Passing_Yards_per_Game_Last_1?: number | null
          Opponent_Passing_Yards_per_Game_Home?: number | null
          Opponent_Passing_Yards_per_Game_Away?: number | null
          Opponent_Rushing_Yards_per_Game?: number | null
          Opponent_Rushing_Yards_per_Game_Last_3?: number | null
          Opponent_Rushing_Yards_per_Game_Last_1?: number | null
          Opponent_Rushing_Yards_per_Game_Home?: number | null
          Opponent_Rushing_Yards_per_Game_Away?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Last_3?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Last_1?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Home?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Away?: number | null
          Average_Scoring_Margin?: number | null
          Average_Scoring_Margin_Last_3?: number | null
          Average_Scoring_Margin_Last_1?: number | null
          Average_Scoring_Margin_Home?: number | null
          Average_Scoring_Margin_Away?: number | null
          Yards_Per_Point?: number | null
          Yards_Per_Point_Last_3?: number | null
          Yards_Per_Point_Last_1?: number | null
          Yards_Per_Point_Home?: number | null
          Yards_Per_Point_Away?: number | null
          fpi?: number | null
          fpi_off?: number | null
          fpi_def?: number | null
        }
        Update: {
          id?: string
          team_id?: string
          Year?: number | null
          Yards_per_Game?: number | null
          Yards_per_Game_Last_3?: number | null
          Yards_per_Game_Last_1?: number | null
          Yards_per_Game_Home?: number | null
          Yards_per_Game_Away?: number | null
          Points_Per_Game?: number | null
          Points_Per_Game_Last_3?: number | null
          Points_Per_Game_Last_1?: number | null
          Points_Per_Game_Home?: number | null
          Points_Per_Game_Away?: number | null
          Touchdowns_per_Game?: number | null
          Touchdowns_per_Game_Last_3?: number | null
          Touchdowns_per_Game_Last_1?: number | null
          Touchdowns_per_Game_Home?: number | null
          Touchdowns_per_Game_Away?: number | null
          Passing_Yards_Per_Game?: number | null
          Passing_Yards_Per_Game_Last_3?: number | null
          Passing_Yards_Per_Game_Last_1?: number | null
          Passing_Yards_Per_Game_Home?: number | null
          Passing_Yards_Per_Game_Away?: number | null
          Rushing_Yards_Per_Game_?: number | null
          Rushing_Yards_Per_Game_Last_3?: number | null
          Rushing_Yards_Per_Game_Last_1?: number | null
          Rushing_Yards_Per_Game_Home?: number | null
          Rushing_Yards_Per_Game_Away?: number | null
          Red_Zone_Scores_Per_Game_TD_only?: number | null
          Red_Zone_Scores_Per_Game_TD_only_Last_3?: number | null
          Red_Zone_Scores_Per_Game_TD_only_Last_1?: number | null
          Red_Zone_Scores_Per_Game_TD_only_Home?: number | null
          Red_Zone_Scores_Per_Game_TD_only_Away?: number | null
          Opponent_Yards_per_Game?: number | null
          Opponent_Yards_per_Game_Last_3?: number | null
          Opponent_Yards_per_Game_Last_1?: number | null
          Opponent_Yards_per_Game_Home?: number | null
          Opponent_Yards_per_Game_Away?: number | null
          Opponent_Points_per_Game?: number | null
          Opponent_Points_per_Game_Last_3?: number | null
          Opponent_Points_per_Game_Last_1?: number | null
          Opponent_Points_per_Game_Home?: number | null
          Opponent_Points_per_Game_Away?: number | null
          Opponent_Passing_Yards_per_Game?: number | null
          Opponent_Passing_Yards_per_Game_Last_3?: number | null
          Opponent_Passing_Yards_per_Game_Last_1?: number | null
          Opponent_Passing_Yards_per_Game_Home?: number | null
          Opponent_Passing_Yards_per_Game_Away?: number | null
          Opponent_Rushing_Yards_per_Game?: number | null
          Opponent_Rushing_Yards_per_Game_Last_3?: number | null
          Opponent_Rushing_Yards_per_Game_Last_1?: number | null
          Opponent_Rushing_Yards_per_Game_Home?: number | null
          Opponent_Rushing_Yards_per_Game_Away?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Last_3?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Last_1?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Home?: number | null
          Opponent_Red_Zone_Scores_per_Game_TDs_only_Away?: number | null
          Average_Scoring_Margin?: number | null
          Average_Scoring_Margin_Last_3?: number | null
          Average_Scoring_Margin_Last_1?: number | null
          Average_Scoring_Margin_Home?: number | null
          Average_Scoring_Margin_Away?: number | null
          Yards_Per_Point?: number | null
          Yards_Per_Point_Last_3?: number | null
          Yards_Per_Point_Last_1?: number | null
          Yards_Per_Point_Home?: number | null
          Yards_Per_Point_Away?: number | null
          fpi?: number | null
          fpi_off?: number | null
          fpi_def?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "season_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
