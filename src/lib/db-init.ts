import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Initialize database schema on app startup
 * Creates users table if it doesn't exist
 */
export async function initializeDatabase() {
  try {
    // Check if users table exists by trying to query it
    const { error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Database schema already initialized (users table exists)');
      return true;
    }

    // Users table doesn't exist - we need to create it
    // Since we can't execute raw SQL through the REST API, we'll log instructions
    console.warn('⚠️  Users table not found in database');
    console.warn('Please create it manually in Supabase dashboard using this SQL:');
    console.warn(`
    CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      org_id UUID,
      role TEXT DEFAULT 'player' CHECK (role IN ('platform_admin', 'org_owner', 'event_director', 'staff', 'referee', 'player')),
      first_name TEXT,
      last_name TEXT,
      mfa_enabled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
    CREATE INDEX IF NOT EXISTS idx_users_org_id ON public.users(org_id);

    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    CREATE POLICY users_insert_signup ON public.users FOR INSERT WITH CHECK (true);
    CREATE POLICY users_select_any ON public.users FOR SELECT USING (true);
    CREATE POLICY users_update_own ON public.users FOR UPDATE USING (true);

    GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
    `);

    return false;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

// Initialize on module load
initializeDatabase().catch(console.error);
