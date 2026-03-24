import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/games - List all games or games for a club
export async function GET(req: NextRequest) {
  try {
    const clubId = req.nextUrl.searchParams.get('club_id');
    
    let query = supabase
      .from('games')
      .select('*')
      .order('scheduled_time', { ascending: true });
    
    if (clubId) {
      query = query.eq('club_id', clubId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/games - Create a new game
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { club_id, organizer_id, title, scheduled_time, location, capacity, entry_fee } = body;

    if (!club_id || !organizer_id || !title || !scheduled_time) {
      return NextResponse.json({ 
        error: 'Missing required fields: club_id, organizer_id, title, scheduled_time' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('games')
      .insert([
        {
          club_id,
          organizer_id,
          title,
          scheduled_time,
          location,
          capacity: capacity || 16,
          entry_fee: entry_fee || 10.00,
          status: 'scheduled'
        }
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
