import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createPickleballSchema() {
  console.log('🚀 Creating Pickleball Club Organizer schema...');

  try {
    // 1. Create clubs table
    const { error: clubsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.clubs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          organizer_id UUID NOT NULL,
          location TEXT,
          skill_levels TEXT[] DEFAULT ARRAY['2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'],
          player_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    }).catch(err => ({ error: err }));

    if (!clubsError) console.log('✅ clubs table created');

    // 2. Create games table
    const { error: gamesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.games (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          club_id UUID NOT NULL,
          organizer_id UUID NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
          location TEXT,
          capacity INTEGER NOT NULL DEFAULT 16,
          min_skill_level TEXT DEFAULT '2.0',
          max_skill_level TEXT DEFAULT '5.0',
          entry_fee DECIMAL(10, 2) DEFAULT 10.00,
          status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    }).catch(err => ({ error: err }));

    if (!gamesError) console.log('✅ games table created');

    // 3. Create game_rsvps table
    const { error: rsvpsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.game_rsvps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          game_id UUID NOT NULL,
          player_id UUID NOT NULL,
          status TEXT DEFAULT 'yes' CHECK (status IN ('yes', 'maybe', 'no')),
          payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
          stripe_charge_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(game_id, player_id)
        )
      `
    }).catch(err => ({ error: err }));

    if (!rsvpsError) console.log('✅ game_rsvps table created');

    // 4. Create leaderboards table
    const { error: leaderboardError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.leaderboards (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          club_id UUID NOT NULL,
          player_id UUID NOT NULL,
          rank INTEGER,
          games_played INTEGER DEFAULT 0,
          wins INTEGER DEFAULT 0,
          losses INTEGER DEFAULT 0,
          win_rate DECIMAL(5, 2) DEFAULT 0.00,
          skill_level TEXT,
          season TEXT DEFAULT 'current',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(club_id, player_id, season)
        )
      `
    }).catch(err => ({ error: err }));

    if (!leaderboardError) console.log('✅ leaderboards table created');

    console.log('\n✅ Schema creation complete!');
    return true;

  } catch (error) {
    console.error('❌ Schema creation error:', error);
    return false;
  }
}

// Run on module load
createPickleballSchema().catch(console.error);
