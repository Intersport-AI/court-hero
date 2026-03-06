import { NextRequest, NextResponse } from 'next/server';
import { requireAuthorization } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/organizations/[orgId]/events/[eventId]/reports/financial
 * Generate financial report for an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
  const { orgId, eventId } = await params;

  const auth = await requireAuthorization(request, {
    roles: ['org_owner', 'event_director'],
    orgId,
  });

  if (!auth.valid) return auth.response;

  try {
    // Get event
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    // Get all divisions
    const { data: divisions } = await supabase
      .from('divisions')
      .select('*')
      .eq('event_id', eventId);

    if (!divisions) {
      return NextResponse.json({
        success: true,
        report: { divisions: [], totals: {} },
      });
    }

    // For each division, get registration and payment data
    const divisionReports = await Promise.all(
      divisions.map(async (div) => {
        const { data: registrations } = await supabase
          .from('registrations')
          .select('*')
          .eq('division_id', div.id);

        const { data: payments } = await supabase
          .from('payments')
          .select('*')
          .in(
            'registration_id',
            registrations?.map(r => r.id) || []
          );

        const totalRevenueCents = (payments || [])
          .filter(p => p.status === 'succeeded' || p.status === 'completed')
          .reduce((sum, p) => sum + (p.amount_cents || 0), 0);

        const totalRefundedCents = (payments || [])
          .reduce((sum, p) => sum + (p.refund_amount_cents || 0), 0);

        const netRevenueCents = totalRevenueCents - totalRefundedCents;

        return {
          divisionId: div.id,
          divisionName: div.name,
          registrations: registrations?.length || 0,
          basePriceCents: div.pricing_base_cents,
          totalRevenueCents,
          totalRefundedCents,
          netRevenueCents,
          averageRevenueCents:
            (registrations?.length || 0) > 0
              ? Math.round(netRevenueCents / (registrations?.length || 1))
              : 0,
        };
      })
    );

    // Calculate totals
    const totals: Record<string, number> = {
      totalRegistrations: divisionReports.reduce((sum, d) => sum + d.registrations, 0),
      totalRevenueCents: divisionReports.reduce((sum, d) => sum + d.totalRevenueCents, 0),
      totalRefundedCents: divisionReports.reduce((sum, d) => sum + d.totalRefundedCents, 0),
      netRevenueCents: divisionReports.reduce((sum, d) => sum + d.netRevenueCents, 0),
    };

    // Add platform fee (2% + $0.30 per transaction for Stripe)
    const platformFeeCents = Math.round(
      totals.totalRevenueCents * 0.02 + totals.totalRegistrations * 30
    );

    totals.platformFeeCents = platformFeeCents;
    totals.organizerNetCents = totals.netRevenueCents - platformFeeCents;

    return NextResponse.json(
      {
        success: true,
        report: {
          event: {
            id: event.id,
            name: event.name,
            start_date: event.start_date,
            end_date: event.end_date,
          },
          divisions: divisionReports,
          totals: {
            totalRegistrations: totals.totalRegistrations,
            totalRevenueDollars: (totals.totalRevenueCents / 100).toFixed(2),
            totalRefundedDollars: (totals.totalRefundedCents / 100).toFixed(2),
            netRevenueDollars: (totals.netRevenueCents / 100).toFixed(2),
            platformFeeDollars: (totals.platformFeeCents / 100).toFixed(2),
            organizerNetDollars: (totals.organizerNetCents / 100).toFixed(2),
          },
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
