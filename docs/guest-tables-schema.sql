-- Guest functionality database tables
-- These need to be created in Supabase with RLS enabled and no public policies
-- Only service role should have access to these tables

-- Guest sessions table to track device usage
CREATE TABLE public.guest_sessions (
    device_id TEXT PRIMARY KEY,
    credits_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guest predictions table to store predictions by device
CREATE TABLE public.guest_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    predicted_home_score INTEGER NOT NULL,
    predicted_away_score INTEGER NOT NULL,
    confidence INTEGER,
    user_configuration JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(device_id, game_id)
);

-- Enable Row Level Security
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_predictions ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role can access these tables
-- This ensures guest data is only accessible through our API routes

-- Indexes for better performance
CREATE INDEX idx_guest_sessions_device_id ON public.guest_sessions(device_id);
CREATE INDEX idx_guest_predictions_device_game ON public.guest_predictions(device_id, game_id);
CREATE INDEX idx_guest_predictions_device_id ON public.guest_predictions(device_id);
CREATE INDEX idx_guest_predictions_game_id ON public.guest_predictions(game_id);
