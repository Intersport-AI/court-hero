import { NextRequest, NextResponse } from 'next/server';
import { requireAuthorization } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/organizations/[orgId]/events
 * List all events for an organization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const auth = await requireAuthorization(request, { orgId });

  if (!auth.valid) return auth.response;

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, events }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/organizations/[orgId]/events
 * Create a new event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const auth = await requireAuthorization(request, {
    roles: ['event_director', 'org_owner'],
    orgId,
  });

  if (!auth.valid) return auth.response;

  try {
    const body = await request.json();
    const {
      name,
      description,
      start_date,
      end_date,
      timezone = 'America/Chicago',
      config = {},
    } = body;

    if (!name || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields: name, start_date, end_date' },
        { status: 400 }
      );
    }

    const eventId = uuid();

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        id: eventId,
        org_id: orgId,
        name,
        description,
        start_date,
        end_date,
        timezone,
        config,
        created_by: auth.user!.id,
        status: 'setup',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, event },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
