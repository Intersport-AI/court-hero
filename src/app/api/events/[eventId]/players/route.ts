import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/events/[eventId]/players
 * Create or get a player (for registration flow)
 * Public endpoint - players create themselves when registering
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    const body = await request.json();
    const {
      org_id,
      first_name,
      last_name,
      email,
      date_of_birth,
      dupr_id,
      dupr_rating,
      self_reported_rating,
      home_club,
      phone,
    } = body;

    if (!org_id || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields: org_id, first_name, last_name' },
        { status: 400 }
      );
    }

    const playerId = uuid();

    const { data: player, error } = await supabase
      .from('players')
      .insert({
        id: playerId,
        org_id,
        first_name,
        last_name,
        email,
        date_of_birth,
        dupr_id,
        dupr_rating,
        self_reported_rating,
        home_club,
        phone,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, player },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
