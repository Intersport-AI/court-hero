import { NextRequest, NextResponse } from 'next/server';
import { requireAuthorization } from '@/lib/middleware';
import { createClient } from '@supabase/supabase-js';
import { createRefund } from '@/lib/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/registrations/[registrationId]/refund
 * Process a refund (organizer only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  const { registrationId } = await params;

  const auth = await requireAuthorization(request, {
    roles: ['event_director', 'org_owner'],
  });

  if (!auth.valid) return auth.response;

  try {
    // Get registration and payment
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const { data: payment, error: payError } = await supabase
      .from('payments')
      .select('*')
      .eq('registration_id', registrationId)
      .single();

    if (payError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'succeeded' && payment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only refund completed payments' },
        { status: 400 }
      );
    }

    // Process Stripe refund
    const refundResult = await createRefund(payment.stripe_payment_intent_id);

    if (!refundResult.success) {
      return NextResponse.json({ error: refundResult.error }, { status: 500 });
    }

    const refund = refundResult.refund!;

    // Update payment record
    const refund_amount = refund?.amount || payment.amount_cents;
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refund_amount_cents: refund_amount,
      })
      .eq('id', payment.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Cancel registration
    await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', registrationId);

    return NextResponse.json(
      {
        success: true,
        message: 'Refund processed',
        refundAmount: refund_amount,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
