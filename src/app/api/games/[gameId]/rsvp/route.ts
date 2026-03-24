import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const { data, error } = await supabase
      .from('game_rsvps')
      .select('*')
      .eq('game_id', gameId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const grouped = {
      yes: data.filter((r: any) => r.status === 'yes').length,
      maybe: data.filter((r: any) => r.status === 'maybe').length,
      no: data.filter((r: any) => r.status === 'no').length
    };

    return NextResponse.json({ data, summary: grouped, total: data.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const body = await req.json();
    const { player_id, status } = body;

    if (!player_id || !status || !['yes', 'maybe', 'no'].includes(status)) {
      return NextResponse.json({ 
        error: 'Missing or invalid fields: player_id, status (yes|maybe|no)' 
      }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('game_rsvps')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_id', player_id)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from('game_rsvps')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('game_id', gameId)
        .eq('player_id', player_id)
        .select();
    } else {
      result = await supabase
        .from('game_rsvps')
        .insert([
          {
            game_id: gameId,
            player_id,
            status,
            payment_status: 'pending'
          }
        ])
        .select();
    }

    const { data, error } = result;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data?.[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
