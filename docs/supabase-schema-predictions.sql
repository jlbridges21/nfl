-- Run in Supabase SQL editor after reviewing; ensure anon role has select/insert.
-- This creates the predictions table with RLS policies for storing prediction history

-- Create the predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    year int NOT NULL,
    home_team_id uuid NOT NULL,
    away_team_id uuid NOT NULL,
    home_score numeric NOT NULL,
    away_score numeric NOT NULL,
    spread numeric NOT NULL,           -- home minus away
    total numeric NOT NULL,
    win_prob_home numeric NOT NULL,    -- 0–1
    confidence numeric NOT NULL,       -- 0–1
    seed text NOT NULL,
    inputs jsonb NOT NULL,             -- { home: TeamStats, away: TeamStats, league: LeagueAvgs }
    contributions jsonb NOT NULL,      -- array of contribution items
    request_fingerprint text NULL,     -- hashed IP+UA for abuse control (no PII)
    
    -- Foreign key constraints
    CONSTRAINT fk_predictions_home_team FOREIGN KEY (home_team_id) REFERENCES public.teams(id),
    CONSTRAINT fk_predictions_away_team FOREIGN KEY (away_team_id) REFERENCES public.teams(id),
    
    -- Check constraints
    CONSTRAINT chk_predictions_different_teams CHECK (home_team_id <> away_team_id),
    CONSTRAINT chk_predictions_win_prob_range CHECK (win_prob_home >= 0 AND win_prob_home <= 1),
    CONSTRAINT chk_predictions_confidence_range CHECK (confidence >= 0 AND confidence <= 1),
    CONSTRAINT chk_predictions_scores_positive CHECK (home_score >= 0 AND away_score >= 0),
    CONSTRAINT chk_predictions_year_valid CHECK (year >= 2020 AND year <= 2030)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_predictions_recent 
    ON public.predictions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_predictions_matchup_year 
    ON public.predictions (home_team_id, away_team_id, year, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_predictions_year 
    ON public.predictions (year);

CREATE INDEX IF NOT EXISTS idx_predictions_fingerprint 
    ON public.predictions (request_fingerprint) 
    WHERE request_fingerprint IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS allow_anon_select ON public.predictions;
DROP POLICY IF EXISTS allow_anon_insert ON public.predictions;

-- Create RLS policies
-- Allow anonymous users to select all predictions
CREATE POLICY allow_anon_select ON public.predictions
    FOR SELECT
    USING (true);

-- Allow anonymous users to insert predictions with validation
CREATE POLICY allow_anon_insert ON public.predictions
    FOR INSERT
    WITH CHECK (
        home_team_id <> away_team_id 
        AND inputs IS NOT NULL 
        AND contributions IS NOT NULL
        AND year IS NOT NULL
        AND home_score IS NOT NULL
        AND away_score IS NOT NULL
        AND spread IS NOT NULL
        AND total IS NOT NULL
        AND win_prob_home IS NOT NULL
        AND confidence IS NOT NULL
        AND seed IS NOT NULL
    );

-- Grant necessary permissions to anon role
GRANT SELECT, INSERT ON public.predictions TO anon;
GRANT USAGE ON SEQUENCE predictions_id_seq TO anon;

-- Add helpful comments
COMMENT ON TABLE public.predictions IS 'Stores NFL game predictions with full context and metadata';
COMMENT ON COLUMN public.predictions.inputs IS 'Complete model inputs: { home: TeamStats, away: TeamStats, league: LeagueAvgs }';
COMMENT ON COLUMN public.predictions.contributions IS 'Array of contribution factors explaining the prediction';
COMMENT ON COLUMN public.predictions.request_fingerprint IS 'Non-PII hash for rate limiting (IP/16 + UA + day)';
COMMENT ON COLUMN public.predictions.spread IS 'Point spread: home_score - away_score';
COMMENT ON COLUMN public.predictions.win_prob_home IS 'Home team win probability (0.0 to 1.0)';
