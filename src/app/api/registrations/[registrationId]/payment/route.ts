import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPaymentIntent, confirmPaymentIntent } from '@/lib/stripe';
import { v4 as uuid } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/registrations/[registrationId]/payment
 * Create a payment intent for a registration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  const { registrationId } = await params;

  try {
    const body = await request.json();
    const { amount_cents } = body;

    if (!amount_cents || amount_cents <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create Stripe payment intent
    const stripeResult = await createPaymentIntent(amount_cents, 'usd', {
      registrationId,
    });

    if (!stripeResult.success) {
      return NextResponse.json({ error: stripeResult.error }, { status: 500 });
    }

    const paymentIntent = stripeResult.paymentIntent!;

    // Record payment in database
    const paymentId = uuid();
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        id: paymentId,
        registration_id: registrationId,
        stripe_payment_intent_id: paymentIntent.id,
        amount_cents,
        currency: 'USD',
        status: paymentIntent.status,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        payment,
        clientSecret: paymentIntent.client_secret,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/registrations/[registrationId]/payment
 * Get payment status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  const { registrationId } = await params;

  try {
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('registration_id', registrationId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Confirm status with Stripe
    if (payment.stripe_payment_intent_id) {
      const stripeResult = await confirmPaymentIntent(payment.stripe_payment_intent_id);

      if (stripeResult.success && stripeResult.paymentIntent) {
        const paymentIntent = stripeResult.paymentIntent;

        // Update status in database if changed
        if (paymentIntent.status !== payment.status) {
          await supabase
            .from('payments')
            .update({ status: paymentIntent.status })
            .eq('id', payment.id);

          payment.status = paymentIntent.status;
        }
      }
    }

    return NextResponse.json({ success: true, payment }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
