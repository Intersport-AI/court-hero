import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize database schema on first run
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Try to query users table
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (!testError) {
      return NextResponse.json(
        { message: 'Schema already initialized', tables_exist: true },
        { status: 200 }
      );
    }

    // Users table doesn't exist, create it with raw SQL
    const sqlCreate = `
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

      DROP POLICY IF EXISTS users_read_own ON public.users;
      DROP POLICY IF EXISTS users_insert_signup ON public.users;
      DROP POLICY IF EXISTS users_update_own ON public.users;

      CREATE POLICY users_insert_signup ON public.users
        FOR INSERT WITH CHECK (true);

      CREATE POLICY users_select_own ON public.users
        FOR SELECT USING (true);

      CREATE POLICY users_update_own ON public.users
        FOR UPDATE USING (true);

      GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
    `;

    // Execute the SQL using a raw query through the admin client
    // Since we can't execute raw SQL directly, we'll use the RPC approach
    // For now, return instructions
    
    return NextResponse.json(
      {
        message: 'Users table needs to be created manually in Supabase dashboard',
        sql: sqlCreate,
        instructions: [
          '1. Go to https://app.supabase.com',
          '2. Select your project',
          '3. Click SQL Editor',
          '4. Paste the SQL above',
          '5. Click Execute',
          '6. Then call this endpoint again with schema created'
        ]
      },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
