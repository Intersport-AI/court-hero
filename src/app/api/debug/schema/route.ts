import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const results: any = {};

  // Test players table
  const { data: playersData, error: playersError, count: playersCount } = await supabase
    .from('players')
    .select('*', { count: 'exact' })
    .limit(1);

  results.players = {
    exists: !playersError,
    error: playersError?.message || null,
    count: playersCount || 0,
    sample: playersData?.[0] || null,
  };

  // Test users table
  const { data: usersData, error: usersError, count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .limit(1);

  results.users = {
    exists: !usersError,
    error: usersError?.message || null,
    count: usersCount || 0,
    sample: usersData?.[0] || null,
  };

  return NextResponse.json(results);
}
