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
      profiles: {
        Row: {
          id: string
          free_credits_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          free_credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          free_credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          price_id: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          price_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          price_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          game_id: string
          predicted_home_score: number
          predicted_away_score: number
          confidence: number | null
          user_configuration: Json | null
          was_accurate: boolean | null
          error_margin: number | null
          settled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          predicted_home_score: number
          predicted_away_score: number
          confidence?: number | null
          user_configuration?: Json | null
          was_accurate?: boolean | null
          error_margin?: number | null
          settled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          predicted_home_score?: number
          predicted_away_score?: number
          confidence?: number | null
          user_configuration?: Json | null
          was_accurate?: boolean | null
          error_margin?: number | null
          settled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
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
      me_billing: {
        Row: {
          user_id: string
          free_credits_remaining: number
          sub_status: Database["public"]["Enums"]["subscription_status"] | null
        }
        Relationships: []
      }
      my_predictions_enriched: {
        Row: {
          id: string
          user_id: string
          game_id: string
          predicted_home_score: number
          predicted_away_score: number
          user_configuration: Json | null
          was_accurate: boolean | null
          error_margin: number | null
          created_at: string
          home_team_name: string
          home_team_abbr: string
          home_team_logo: string | null
          away_team_name: string
          away_team_abbr: string
          away_team_logo: string | null
          season_year: number
          week_name: string
          home_score: number | null
          away_score: number | null
          box_home: string | null
          box_away: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_or_update_prediction: {
        Args: {
          p_game_id: string
          p_predicted_home_score: number
          p_predicted_away_score: number
          p_confidence: number
          p_user_configuration: Json
        }
        Returns: Database["public"]["Tables"]["predictions"]["Row"]
      }
    }
    Enums: {
      subscription_status: "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid" | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
