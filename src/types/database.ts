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
      season_stats: {
        Row: {
          id: string
          team_id: string
          Year: number | null
          Yards_per_Game: number | null
          Yards_per_Game_Last_3: number | null
          Yards_per_Game_Last_1: number | null
          Yards_per_Game_Home: number | null
          Yards_per_Game_Away: number | null
          Points_Per_Game: number | null
          Points_Per_Game_Last_3: number | null
          Points_Per_Game_Last_1: number | null
          Points_Per_Game_Home: number | null
          Points_Per_Game_Away: number | null
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
