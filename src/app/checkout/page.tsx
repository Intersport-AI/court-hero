'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { createPayment, getPaymentStatus } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const registrationId = searchParams?.get('registration_id');
  const amount = parseInt(searchParams?.get('amount') || '0');
  const planName = searchParams?.get('plan') || 'Tournament Registration';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  useEffect(() => {
    if (!user || !registrationId) {
      router.push('/dashboard');
      return;
    }

    const initPayment = async () => {
      try {
        setLoading(true);
        const data = await createPayment(registrationId, amount);
        if (data.success) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || 'Failed to initialize payment');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [user, registrationId, amount, router]);

  const handlePayment = async () => {
    // In a real implementation, this would use Stripe.js to handle the payment
    // For now, simulating successful payment
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentStatus('success');
      setTimeout(() => {
        router.push('/dashboard?payment=success');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-2xl mx-auto pt-12 px-6 pb-12 min-h-screen">
        {paymentStatus === 'success' ? (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-12 text-center">
            <div className="text-[64px] mb-4">✅</div>
            <h1 className="text-white text-[32px] font-bold mb-2">Payment Successful!</h1>
            <p className="text-[#8B9DB8] mb-8">Your registration is confirmed. Redirecting...</p>
          </div>
        ) : (
          <>
            <h1 className="text-white text-[36px] font-bold mb-2">Checkout</h1>
            <p className="text-[#8B9DB8] mb-8">Complete your registration</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-8">
                {error}
              </div>
            )}

            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6">
              {/* Order Summary */}
              <div className="border-b border-white/[0.06] pb-6">
                <h2 className="text-white font-bold mb-4">Order Summary</h2>
                <div className="flex justify-between mb-3">
                  <span className="text-[#8B9DB8]">{planName}</span>
                  <span className="text-white font-medium">${(amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-white/[0.06] pt-3 mt-3">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-[#00F260] font-bold text-[20px]">${(amount / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Card Info */}
              <div>
                <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">Card Number</label>
                <div className="relative">
                  <input type="text" placeholder="1234 5678 9012 3456"
                    className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white placeholder-[#4B5563] outline-none focus:border-[#00F260]/40 text-[16px]"
                    disabled={loading} />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B9DB8]">💳</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">Expiry</label>
                  <input type="text" placeholder="MM/YY"
                    className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white placeholder-[#4B5563] outline-none focus:border-[#00F260]/40"
                    disabled={loading} />
                </div>
                <div>
                  <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">CVC</label>
                  <input type="text" placeholder="123"
                    className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white placeholder-[#4B5563] outline-none focus:border-[#00F260]/40"
                    disabled={loading} />
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none"
                />
              </div>

              {/* Payment Button */}
              <button onClick={handlePayment} disabled={loading}
                className="w-full bg-[#00F260] text-black py-5 rounded-2xl font-bold text-[17px] hover:bg-[#00D954] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
              </button>

              {/* Security */}
              <p className="text-[#64748B] text-[12px] text-center">
                🔒 Secured by Stripe • Your payment information is encrypted
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C0F14] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F260]"></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
