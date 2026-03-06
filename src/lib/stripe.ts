import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover' as const,
});

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });

    return { success: true, paymentIntent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      return { success: true, paymentIntent };
    }

    return { success: false, error: 'Payment not completed' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createRefund(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });

    return { success: true, refund };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function calculatePrice(
  basePrice: number,
  earlyBirdPrice?: number,
  earlyBirdUntil?: Date,
  lateSurchargePrice?: number,
  lateSurchargeAfter?: Date
): number {
  const now = new Date();

  if (earlyBirdPrice && earlyBirdUntil && now < earlyBirdUntil) {
    return earlyBirdPrice;
  }

  if (lateSurchargePrice && lateSurchargeAfter && now > lateSurchargeAfter) {
    return basePrice + lateSurchargePrice;
  }

  return basePrice;
}
