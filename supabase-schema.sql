-- Court Hero Database Schema
-- Run this in the Supabase SQL Editor after project creation

-- Events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TIMESTAMPTZ,
  format TEXT NOT NULL CHECK (format IN ('round-robin', 'single-elim', 'double-elim', 'king-of-court', 'mixer')),
  courts INTEGER NOT NULL DEFAULT 2,
  game_to INTEGER NOT NULL DEFAULT 11,
  win_by_2 BOOLEAN NOT NULL DEFAULT true,
  organizer_id TEXT,
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'paused', 'completed')),
  current_round INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  rating NUMERIC(3,1) NOT NULL DEFAULT 3.5,
  internal_rating INTEGER NOT NULL DEFAULT 1200,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  points_for INTEGER NOT NULL DEFAULT 0,
  points_against INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_event ON players(event_id);

-- Rounds table
CREATE TABLE rounds (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  byes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rounds_event ON rounds(event_id);

-- Matches table
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team1 TEXT[] NOT NULL,
  team2 TEXT[] NOT NULL,
  score1 INTEGER,
  score2 INTEGER,
  winner TEXT[],
  court INTEGER NOT NULL DEFAULT 1,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_matches_round ON matches(round_id);
CREATE INDEX idx_matches_event ON matches(event_id);

-- Organizers table
CREATE TABLE organizers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  events_created INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

-- Public read access for events, players, rounds, matches (needed for player join links)
CREATE POLICY "Events are publicly readable" ON events FOR SELECT USING (true);
CREATE POLICY "Events are insertable" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Events are updatable" ON events FOR UPDATE USING (true);

CREATE POLICY "Players are publicly readable" ON players FOR SELECT USING (true);
CREATE POLICY "Players are insertable" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Players are updatable" ON players FOR UPDATE USING (true);

CREATE POLICY "Rounds are publicly readable" ON rounds FOR SELECT USING (true);
CREATE POLICY "Rounds are insertable" ON rounds FOR INSERT WITH CHECK (true);

CREATE POLICY "Matches are publicly readable" ON matches FOR SELECT USING (true);
CREATE POLICY "Matches are insertable" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Matches are updatable" ON matches FOR UPDATE USING (true);

CREATE POLICY "Organizers are insertable" ON organizers FOR INSERT WITH CHECK (true);
CREATE POLICY "Organizers can read own" ON organizers FOR SELECT USING (true);

-- Enable realtime for live leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
