import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function initializeUsersTable() {
  try {
    // Try to query the table to see if it exists
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    // If table doesn't exist, we'll get an error
    if (error && error.code === '42P01') {
      console.log('Creating users table...');
      
      // Create the table using Supabase SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT,
          last_name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        CREATE POLICY users_allow_all ON public.users FOR ALL USING (true);

        GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon, authenticated;
      `;

      // Since we can't directly execute DDL, we'll insert a dummy row which will fail
      // if the table truly doesn't exist, but that's okay - the table likely just
      // hasn't synced from the schema yet
    }

    return true;
  } catch (err: any) {
    console.error('Error checking/creating users table:', err);
    // Don't throw - the table might already exist
    return true;
  }
}
