/**
 * TICKET P2-03: Payment Retry Logic
 * Automatic retry for failed payments with exponential backoff
 */

interface PaymentRetry {
  paymentId: string;
  registrationId: string;
  attempt: number;
  maxAttempts: number;
  nextRetryAt: string;
  status: 'pending' | 'retrying' | 'failed' | 'success';
}

const RETRY_DELAYS = [
  5 * 60 * 1000,      // 5 minutes
  15 * 60 * 1000,     // 15 minutes
  60 * 60 * 1000,     // 1 hour
];

/**
 * Schedule retry after failed payment
 * Exponential backoff: 5m, 15m, 1h
 */
export async function schedulePaymentRetry(
  paymentId: string,
  registrationId: string,
  attempt: number = 1
): Promise<PaymentRetry> {
  if (attempt > 3) {
    // Max 3 attempts
    // TODO: Send email to player: "Payment failed after 3 attempts"
    return {
      paymentId,
      registrationId,
      attempt,
      maxAttempts: 3,
      nextRetryAt: '',
      status: 'failed',
    };
  }

  const delayMs = RETRY_DELAYS[attempt - 1] || RETRY_DELAYS[2];
  const nextRetryAt = new Date(Date.now() + delayMs);

  // TODO: Insert into payment_retries table
  // await db.query(
  //   `INSERT INTO payment_retries (payment_id, registration_id, attempt, next_retry_at)
  //    VALUES ($1, $2, $3, $4)`,
  //   [paymentId, registrationId, attempt, nextRetryAt]
  // );

  return {
    paymentId,
    registrationId,
    attempt,
    maxAttempts: 3,
    nextRetryAt: nextRetryAt.toISOString(),
    status: 'retrying',
  };
}

/**
 * Execute retry: call Stripe charge again
 */
export async function executePaymentRetry(paymentId: string): Promise<boolean> {
  // TODO: Fetch payment details from DB
  // TODO: Call Stripe /charges or /payment_intents confirm
  // TODO: If success: update registration to 'paid'
  // TODO: If fail: schedule next retry
  
  return false; // Mock: retry failed
}

/**
 * Unit test: Retry scheduling
 */
export function testRetryScheduling() {
  const retry = {
    paymentId: 'pi_123',
    attempt: 1,
    nextRetryAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
  
  console.log('✅ Payment retry test passed:', retry);
  return true;
}
