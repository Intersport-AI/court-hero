import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/events/[eventId]/divisions/[divisionId]/registrations
 * Get all registrations for a division (public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; divisionId: string }> }
) {
  const { eventId, divisionId } = await params;

  try {
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(
        `*,
        player:players(id, first_name, last_name, dupr_rating, self_reported_rating),
        partner:players!registrations_partner_id_fkey(id, first_name, last_name)`
      )
      .eq('event_id', eventId)
      .eq('division_id', divisionId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, registrations }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/events/[eventId]/divisions/[divisionId]/registrations
 * Register a player in a division (public - no auth required for player join)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; divisionId: string }> }
) {
  const { eventId, divisionId } = await params;

  try {
    const body = await request.json();
    const { org_id, player_id, partner_id, price_paid_cents } = body;

    if (!org_id || !player_id) {
      return NextResponse.json(
        { error: 'Missing required fields: org_id, player_id' },
        { status: 400 }
      );
    }

    // Get division capacity
    const { data: division, error: divError } = await supabase
      .from('divisions')
      .select('capacity')
      .eq('id', divisionId)
      .single();

    if (divError || !division) {
      return NextResponse.json({ error: 'Division not found' }, { status: 404 });
    }

    // Count current registrations (confirmed only)
    const { data: existingRegs, error: countError } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('division_id', divisionId)
      .eq('status', 'confirmed');

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const confirmedCount = existingRegs?.length || 0;
    const status = division.capacity && confirmedCount >= division.capacity ? 'waitlisted' : 'confirmed';

    const registrationId = uuid();

    const { data: registration, error } = await supabase
      .from('registrations')
      .insert({
        id: registrationId,
        event_id: eventId,
        division_id: divisionId,
        org_id,
        player_id,
        partner_id,
        status,
        price_paid_cents,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, registration, status },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
