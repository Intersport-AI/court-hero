-- Court Hero Pivot to Pickleball Club Organizer
-- Migration: Add skill levels, match stats, and pickleball-specific tables

-- ============================================
-- 1. ALTER EXISTING TABLES
-- ============================================

-- Add skill_level to users/players
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT '3.0' CHECK (skill_level IN ('2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5+'));

-- ============================================
-- 2. CREATE CLUBS TABLE (pivot from organizations)
-- ============================================

CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    location TEXT,
    skill_levels TEXT[] DEFAULT ARRAY['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'],
    player_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clubs_organizer_id ON public.clubs(organizer_id);

-- ============================================
-- 3. CREATE GAMES TABLE (pivot from events)
-- ============================================

CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    capacity INTEGER NOT NULL DEFAULT 16,
    min_skill_level TEXT DEFAULT '2.0',
    max_skill_level TEXT DEFAULT '5.5+',
    entry_fee DECIMAL(10, 2) DEFAULT 10.00,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_club_id ON public.games(club_id);
CREATE INDEX IF NOT EXISTS idx_games_organizer_id ON public.games(organizer_id);
CREATE INDEX IF NOT EXISTS idx_games_scheduled_time ON public.games(scheduled_time);

-- ============================================
-- 4. CREATE GAME_RSVPS TABLE (pivot from registrations)
-- ============================================

CREATE TABLE IF NOT EXISTS public.game_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'yes' CHECK (status IN ('yes', 'maybe', 'no')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    stripe_charge_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_game_rsvps_game_id ON public.game_rsvps(game_id);
CREATE INDEX IF NOT EXISTS idx_game_rsvps_player_id ON public.game_rsvps(player_id);
CREATE INDEX IF NOT EXISTS idx_game_rsvps_status ON public.game_rsvps(status);

-- ============================================
-- 5. CREATE PLAYER_STATS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0.00,
    season TEXT DEFAULT 'current',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, club_id, season)
);

CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON public.player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_club_id ON public.player_stats(club_id);

-- ============================================
-- 6. CREATE GAME_RESULTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    team_a_players UUID[] NOT NULL,
    team_b_players UUID[] NOT NULL,
    winning_team TEXT NOT NULL CHECK (winning_team IN ('a', 'b')),
    team_a_score INTEGER,
    team_b_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_results_game_id ON public.game_results(game_id);

-- ============================================
-- 7. CREATE MATCH_PAIRINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.match_pairings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    team_a_players UUID[] NOT NULL,
    team_b_players UUID[] NOT NULL,
    skill_balanced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_pairings_game_id ON public.match_pairings(game_id);

-- ============================================
-- 8. CREATE LEADERBOARD TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rank INTEGER,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0.00,
    skill_level TEXT,
    season TEXT DEFAULT 'current',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, player_id, season)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_club_id ON public.leaderboards(club_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON public.leaderboards(rank);

-- ============================================
-- 9. CREATE CLUB_MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON public.club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_club_members_player_id ON public.club_members(player_id);

-- ============================================
-- 10. CREATE NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('rsvp_reminder', '24h_reminder', 'game_day', 'result_update', 'leaderboard_update')),
    message TEXT NOT NULL,
    notification_method TEXT DEFAULT 'sms' CHECK (notification_method IN ('sms', 'email', 'both')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_player_id ON public.notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_game_id ON public.notifications(game_id);

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow all operations (permissive for MVP)
-- These can be tightened in production
CREATE POLICY clubs_allow_all ON public.clubs FOR ALL USING (true);
CREATE POLICY games_allow_all ON public.games FOR ALL USING (true);
CREATE POLICY game_rsvps_allow_all ON public.game_rsvps FOR ALL USING (true);
CREATE POLICY player_stats_allow_all ON public.player_stats FOR ALL USING (true);
CREATE POLICY game_results_allow_all ON public.game_results FOR ALL USING (true);
CREATE POLICY match_pairings_allow_all ON public.match_pairings FOR ALL USING (true);
CREATE POLICY leaderboards_allow_all ON public.leaderboards FOR ALL USING (true);
CREATE POLICY club_members_allow_all ON public.club_members FOR ALL USING (true);
CREATE POLICY notifications_allow_all ON public.notifications FOR ALL USING (true);

-- ============================================
-- 12. GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clubs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_rsvps TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_stats TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_results TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_pairings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leaderboards TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_members TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO anon, authenticated;

-- ============================================
-- 13. CREATE FUNCTIONS
-- ============================================

-- Function to calculate win rate
CREATE OR REPLACE FUNCTION calculate_win_rate(wins INTEGER, losses INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    IF (wins + losses) = 0 THEN
        RETURN 0.00;
    END IF;
    RETURN ROUND((wins::DECIMAL / (wins + losses)) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update leaderboard after game result
CREATE OR REPLACE FUNCTION update_leaderboard_after_game()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats for all players in the game
    -- This will be called after game_results insert
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 14. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_leaderboards_skill_level ON public.leaderboards(skill_level);
CREATE INDEX IF NOT EXISTS idx_game_rsvps_payment_status ON public.game_rsvps(payment_status);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Success indicator
SELECT 'Pickleball Club Organizer schema created successfully' AS migration_status;
