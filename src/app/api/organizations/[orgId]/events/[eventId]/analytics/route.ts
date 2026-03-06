import { NextRequest, NextResponse } from 'next/server';
import { requireAuthorization } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/organizations/[orgId]/events/[eventId]/analytics
 * Get event registration and financial analytics
 */
export async function GET(
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
    // Get event details
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    // Get all divisions for this event
    const { data: divisions } = await supabase
      .from('divisions')
      .select('*')
      .eq('event_id', eventId);

    if (!divisions) {
      return NextResponse.json({ success: true, analytics: { divisions: [] } });
    }

    // For each division, get registration stats
    const analyticsPromises = divisions.map(async (division) => {
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .eq('division_id', division.id);

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('registration_id', registrations?.map(r => r.id) || []);

      const totalRevenue = (payments || []).reduce((sum, p) => {
        if (p.status === 'succeeded' || p.status === 'completed') {
          return sum + (p.amount_cents || 0);
        }
        return sum;
      }, 0);

      const totalRefunded = (payments || []).reduce((sum, p) => {
        return sum + (p.refund_amount_cents || 0);
      }, 0);

      const confirmedCount = (registrations || []).filter(r => r.status === 'confirmed').length;
      const waitlistedCount = (registrations || []).filter(r => r.status === 'waitlisted').length;

      return {
        divisionId: division.id,
        divisionName: division.name,
        capacity: division.capacity,
        totalRegistrations: registrations?.length || 0,
        confirmedCount,
        waitlistedCount,
        totalRevenuecents: totalRevenue,
        totalRefundedCents: totalRefunded,
        netRevenuecents: totalRevenue - totalRefunded,
      };
    });

    const divisionalAnalytics = await Promise.all(analyticsPromises);

    const totals = {
      totalRegistrations: divisionalAnalytics.reduce((sum, d) => sum + d.totalRegistrations, 0),
      totalConfirmed: divisionalAnalytics.reduce((sum, d) => sum + d.confirmedCount, 0),
      totalWaitlisted: divisionalAnalytics.reduce((sum, d) => sum + d.waitlistedCount, 0),
      totalRevenuecents: divisionalAnalytics.reduce((sum, d) => sum + d.totalRevenuecents, 0),
      totalRefundedCents: divisionalAnalytics.reduce((sum, d) => sum + d.totalRefundedCents, 0),
      netRevenuecents: divisionalAnalytics.reduce((sum, d) => sum + d.netRevenuecents, 0),
    };

    return NextResponse.json(
      {
        success: true,
        analytics: {
          event,
          divisions: divisionalAnalytics,
          totals,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
