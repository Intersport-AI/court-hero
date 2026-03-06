import { NextRequest, NextResponse } from 'next/server';
import { requireAuthorization } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RouteParams {
  params: Promise<{
    orgId: string;
    eventId: string;
  }>;
}

/**
 * GET /api/organizations/[orgId]/events/[eventId]
 * Get a single event
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { orgId, eventId } = await params;
  const auth = await requireAuthorization(request, { orgId });

  if (!auth.valid) return auth.response;

  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('org_id', orgId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/organizations/[orgId]/events/[eventId]
 * Update an event
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { orgId, eventId } = await params;
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
      timezone,
      status,
      config,
    } = body;

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (start_date) updates.start_date = start_date;
    if (end_date) updates.end_date = end_date;
    if (timezone) updates.timezone = timezone;
    if (status) updates.status = status;
    if (config) updates.config = config;

    const { data: event, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations/[orgId]/events/[eventId]
 * Delete an event
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { orgId, eventId } = await params;
  const auth = await requireAuthorization(request, {
    roles: ['org_owner'],
    orgId,
  });

  if (!auth.valid) return auth.response;

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('org_id', orgId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Event deleted' },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
