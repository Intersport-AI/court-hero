-- Court Hero V1 Database Schema
-- Multi-tenant, secure, production-ready
-- Run this in Supabase SQL Editor

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'platform_admin',
  'org_owner',
  'event_director',
  'staff',
  'referee',
  'player'
);

CREATE TYPE event_status AS ENUM ('setup', 'active', 'paused', 'completed');

CREATE TYPE format_type AS ENUM (
  'single-elim',
  'double-elim',
  'round-robin',
  'pool-play',
  'pool-play-elim'
);

CREATE TYPE division_gender AS ENUM ('men', 'women', 'mixed');

CREATE TYPE match_status AS ENUM ('scheduled', 'in-progress', 'completed', 'walkover', 'cancelled');

CREATE TYPE court_surface_type AS ENUM ('indoor', 'outdoor');

-- ============================================================================
-- ORGANIZATIONS & USERS
-- ============================================================================

CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  stripe_account_id TEXT,
  plan_tier TEXT DEFAULT 'community', -- community, club, pro, enterprise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_stripe ON organizations(stripe_account_id);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'player',
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT, -- For TOTP
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email) -- Email unique per org
);

CREATE INDEX idx_users_org_email ON users(org_id, email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- EVENTS
-- ============================================================================

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  status event_status DEFAULT 'setup',
  config JSONB DEFAULT '{}', -- Flexible config: logo, branding, custom rules, etc.
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_org ON events(org_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date ON events(start_date, end_date);

-- ============================================================================
-- VENUES & COURTS
-- ============================================================================

CREATE TABLE venues (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_venues_event ON venues(event_id);
CREATE INDEX idx_venues_org ON venues(org_id);

CREATE TABLE courts (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Court 1", "Court A", etc.
  surface_type court_surface_type DEFAULT 'outdoor',
  is_featured BOOLEAN DEFAULT false, -- Featured for streaming
  is_streaming BOOLEAN DEFAULT false, -- Can be livestreamed
  availability_window_start TIME, -- e.g., 08:00
  availability_window_end TIME, -- e.g., 17:00
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courts_venue ON courts(venue_id);
CREATE INDEX idx_courts_event ON courts(event_id);
CREATE INDEX idx_courts_org ON courts(org_id);

-- ============================================================================
-- DIVISIONS
-- ============================================================================

CREATE TABLE divisions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format format_type NOT NULL,
  gender division_gender,
  age_min INTEGER,
  age_max INTEGER,
  skill_min NUMERIC(2, 1), -- DUPR rating range
  skill_max NUMERIC(2, 1),
  capacity INTEGER,
  pricing_base_cents INTEGER, -- Base price in cents ($19 = 1900)
  pricing_early_bird_cents INTEGER,
  pricing_early_bird_until TIMESTAMPTZ,
  pricing_late_surcharge_cents INTEGER,
  pricing_late_surcharge_after TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_divisions_event ON divisions(event_id);
CREATE INDEX idx_divisions_org ON divisions(org_id);
CREATE INDEX idx_divisions_format ON divisions(format);

-- ============================================================================
-- REGISTRATIONS & PLAYERS
-- ============================================================================

CREATE TABLE players (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  dupr_id TEXT, -- From DUPR API
  dupr_rating NUMERIC(3, 1),
  self_reported_rating NUMERIC(2, 1), -- If no DUPR
  home_club TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_org ON players(org_id);
CREATE INDEX idx_players_user ON players(user_id);
CREATE INDEX idx_players_dupr ON players(dupr_id);

CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  division_id TEXT NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  partner_id TEXT REFERENCES players(id) ON DELETE SET NULL, -- For doubles
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, waitlisted, cancelled
  price_paid_cents INTEGER, -- Actual price paid in cents
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_division ON registrations(division_id);
CREATE INDEX idx_registrations_org ON registrations(org_id);
CREATE INDEX idx_registrations_player ON registrations(player_id);
CREATE INDEX idx_registrations_status ON registrations(status);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  refund_amount_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_registration ON payments(registration_id);
CREATE INDEX idx_payments_org ON payments(org_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);

-- ============================================================================
-- BRACKETS & MATCHES
-- ============================================================================

CREATE TABLE brackets (
  id TEXT PRIMARY KEY,
  division_id TEXT NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bracket_type TEXT NOT NULL, -- 'main', 'consolation', 'pool_1', etc.
  seeding JSONB, -- Seed placement info
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brackets_division ON brackets(division_id);
CREATE INDEX idx_brackets_event ON brackets(event_id);
CREATE INDEX idx_brackets_org ON brackets(org_id);

CREATE TABLE rounds (
  id TEXT PRIMARY KEY,
  bracket_id TEXT NOT NULL REFERENCES brackets(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  scheduled_start_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rounds_bracket ON rounds(bracket_id);
CREATE INDEX idx_rounds_event ON rounds(event_id);
CREATE INDEX idx_rounds_org ON rounds(org_id);

CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  bracket_id TEXT NOT NULL REFERENCES brackets(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  court_id TEXT REFERENCES courts(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMPTZ,
  status match_status DEFAULT 'scheduled',
  team1_player_ids TEXT[] NOT NULL, -- Array of player IDs
  team2_player_ids TEXT[] NOT NULL,
  team1_score_game1 INTEGER,
  team2_score_game1 INTEGER,
  team1_score_game2 INTEGER,
  team2_score_game2 INTEGER,
  team1_score_game3 INTEGER,
  team2_score_game3 INTEGER,
  winner_player_ids TEXT[], -- Array of player IDs who won
  referee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matches_round ON matches(round_id);
CREATE INDEX idx_matches_bracket ON matches(bracket_id);
CREATE INDEX idx_matches_event ON matches(event_id);
CREATE INDEX idx_matches_org ON matches(org_id);
CREATE INDEX idx_matches_court ON matches(court_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_scheduled_time ON matches(scheduled_time);

-- ============================================================================
-- ROW LEVEL SECURITY (Multi-Tenancy)
-- ============================================================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Organizations: users can only see their own org (except platform admins)
CREATE POLICY "users_see_own_org" ON organizations FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT id FROM users WHERE org_id = organizations.id
    )
    OR
    (SELECT role FROM users WHERE id = auth.uid()::text LIMIT 1) = 'platform_admin'
  );

-- Users: can only see users in their org (except platform admins)
CREATE POLICY "users_see_own_org_users" ON users FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
    OR
    (SELECT role FROM users WHERE id = auth.uid()::text LIMIT 1) = 'platform_admin'
  );

-- Events: can only see events in their org
CREATE POLICY "users_see_own_org_events" ON events FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- Venues: can only see venues in their org
CREATE POLICY "users_see_own_org_venues" ON venues FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- Courts: can only see courts in their org
CREATE POLICY "users_see_own_org_courts" ON courts FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- Divisions: can only see divisions in their org
CREATE POLICY "users_see_own_org_divisions" ON divisions FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- Players: can only see players in their org
CREATE POLICY "users_see_own_org_players" ON players FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- Registrations: can only see registrations in their org
CREATE POLICY "users_see_own_org_registrations" ON registrations FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- Payments: can only see payments in their org
CREATE POLICY "users_see_own_org_payments" ON payments FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- Brackets: can only see brackets in their org
CREATE POLICY "users_see_own_org_brackets" ON brackets FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- Rounds: can only see rounds in their org
CREATE POLICY "users_see_own_org_rounds" ON rounds FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- Matches: can only see matches in their org
CREATE POLICY "users_see_own_org_matches" ON matches FOR SELECT
  USING (
    org_id = (SELECT org_id FROM users WHERE id = auth.uid()::text)
  );

-- ============================================================================
-- MATERIALIZED VIEW FOR LEADERBOARD
-- ============================================================================

CREATE MATERIALIZED VIEW division_leaderboard AS
SELECT
  r.division_id,
  p.id as player_id,
  p.first_name,
  p.last_name,
  COUNT(CASE WHEN m.winner_player_ids @> ARRAY[p.id] THEN 1 END)::INTEGER as wins,
  COUNT(CASE WHEN m.status = 'completed' AND NOT (m.winner_player_ids @> ARRAY[p.id]) THEN 1 END)::INTEGER as losses,
  SUM(CASE 
    WHEN m.team1_player_ids @> ARRAY[p.id] THEN COALESCE(m.team1_score_game1, 0) + COALESCE(m.team1_score_game2, 0) + COALESCE(m.team1_score_game3, 0)
    WHEN m.team2_player_ids @> ARRAY[p.id] THEN COALESCE(m.team2_score_game1, 0) + COALESCE(m.team2_score_game2, 0) + COALESCE(m.team2_score_game3, 0)
  END)::INTEGER as points_for,
  SUM(CASE 
    WHEN m.team1_player_ids @> ARRAY[p.id] THEN COALESCE(m.team2_score_game1, 0) + COALESCE(m.team2_score_game2, 0) + COALESCE(m.team2_score_game3, 0)
    WHEN m.team2_player_ids @> ARRAY[p.id] THEN COALESCE(m.team1_score_game1, 0) + COALESCE(m.team1_score_game2, 0) + COALESCE(m.team1_score_game3, 0)
  END)::INTEGER as points_against
FROM registrations r
JOIN players p ON r.player_id = p.id
LEFT JOIN matches m ON (m.team1_player_ids @> ARRAY[p.id] OR m.team2_player_ids @> ARRAY[p.id])
GROUP BY r.division_id, p.id, p.first_name, p.last_name;

CREATE UNIQUE INDEX idx_leaderboard_division_player ON division_leaderboard(division_id, player_id);
