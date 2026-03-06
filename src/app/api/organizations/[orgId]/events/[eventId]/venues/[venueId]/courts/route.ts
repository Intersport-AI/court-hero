import { NextRequest, NextResponse } from 'next/server';
import { requireAuthorization } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/organizations/[orgId]/events/[eventId]/venues/[venueId]/courts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string; venueId: string }> }
) {
  const { orgId, eventId, venueId } = await params;
  const auth = await requireAuthorization(request, { orgId });

  if (!auth.valid) return auth.response;

  try {
    const { data: courts, error } = await supabase
      .from('courts')
      .select('*')
      .eq('venue_id', venueId)
      .eq('event_id', eventId)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, courts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/organizations/[orgId]/events/[eventId]/venues/[venueId]/courts
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string; venueId: string }> }
) {
  const { orgId, eventId, venueId } = await params;
  const auth = await requireAuthorization(request, {
    roles: ['event_director', 'org_owner'],
    orgId,
  });

  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    const {
      name,
      surface_type = 'outdoor',
      is_featured = false,
      is_streaming = false,
      availability_window_start,
      availability_window_end,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const courtId = uuid();

    const { data: court, error } = await supabase
      .from('courts')
      .insert({
        id: courtId,
        venue_id: venueId,
        event_id: eventId,
        org_id: orgId,
        name,
        surface_type,
        is_featured,
        is_streaming,
        availability_window_start,
        availability_window_end,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, court },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
