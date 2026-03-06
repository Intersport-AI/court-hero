import { NextRequest, NextResponse } from 'next/server';
import { requireAuthorization } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/organizations/[orgId]/events/[eventId]/divisions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
  const { orgId, eventId } = await params;
  const auth = await requireAuthorization(request, { orgId });

  if (!auth.valid) return auth.response;

  try {
    const { data: divisions, error } = await supabase
      .from('divisions')
      .select('*')
      .eq('event_id', eventId)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, divisions }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/organizations/[orgId]/events/[eventId]/divisions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
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
      format,
      gender,
      age_min,
      age_max,
      skill_min,
      skill_max,
      capacity,
      pricing_base_cents,
    } = body;

    if (!name || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: name, format' },
        { status: 400 }
      );
    }

    const divisionId = uuid();

    const { data: division, error } = await supabase
      .from('divisions')
      .insert({
        id: divisionId,
        event_id: eventId,
        org_id: orgId,
        name,
        format,
        gender,
        age_min,
        age_max,
        skill_min,
        skill_max,
        capacity,
        pricing_base_cents,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, division },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
