'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Code must be 6 digits');
      return;
    }
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setVerified(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }, 1000);
  };

  const handleResend = async () => {
    setResendCooldown(60);
    // Simulate API call to resend email
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-md mx-auto pt-20 px-6">
        {verified ? (
          /* Success State */
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-12 text-center">
            <div className="text-[64px] mb-4">✓</div>
            <h1 className="text-white text-[32px] font-bold mb-2">Email Verified!</h1>
            <p className="text-[#8B9DB8] mb-8">Your email has been verified. Redirecting...</p>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F260]"></div>
          </div>
        ) : (
          <>
            <h1 className="text-white text-[32px] font-bold mb-2 text-center">Verify Your Email</h1>
            <p className="text-[#8B9DB8] text-center mb-8">
              We sent a 6-digit code to your email address
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6">
              <div>
                <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Verification Code</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white text-center text-[32px] font-bold outline-none focus:border-[#00F260]/40 tracking-widest"
                />
              </div>

              <button type="submit" disabled={loading || code.length !== 6}
                className="w-full bg-[#00F260] text-black py-4 rounded-xl font-bold hover:bg-[#00D954] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-[#8B9DB8] text-[13px] mb-4">Didn't receive the code?</p>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-[#00F260] font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>

            <div className="mt-8 p-4 bg-[#00F260]/5 rounded-xl">
              <p className="text-[#8B9DB8] text-[12px] text-center">
                Check your spam folder if you don't see the email
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
