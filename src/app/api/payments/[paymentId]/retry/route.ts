import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { schedulePaymentRetry } from '@/lib/payment-retry';

/**
 * TICKET P2-03: Payment Retry Endpoint
 * POST /api/payments/{paymentId}/retry
 * Manual retry trigger for failed payment
 */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  try {
    const authResult = await requireAuth(req);
    if (!authResult.valid) {
      return authResult.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Verify payment belongs to authenticated user
    // TODO: Check if payment is in failed state
    // TODO: Get registration ID from payment record

    const registrationId = 'reg_001'; // Mock

    // Schedule retry
    const retry = await schedulePaymentRetry(paymentId, registrationId, 1);

    if (retry.status === 'failed') {
      return NextResponse.json(
        { error: 'Max retries exceeded. Contact support.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      retry,
      message: `Payment retry scheduled for ${retry.nextRetryAt}`,
    });
  } catch (error: any) {
    console.error('Payment retry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
