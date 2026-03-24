import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/clubs - List all clubs
export async function GET(req: NextRequest) {
  try {
    const organizerId = req.nextUrl.searchParams.get('organizer_id');
    
    let query = supabase.from('clubs').select('*');
    
    if (organizerId) {
      query = query.eq('organizer_id', organizerId);
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

// POST /api/clubs - Create a new club
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, organizer_id, location, description } = body;

    if (!name || !organizer_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, organizer_id' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clubs')
      .insert([
        {
          name,
          organizer_id,
          location,
          description,
          player_count: 0
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
