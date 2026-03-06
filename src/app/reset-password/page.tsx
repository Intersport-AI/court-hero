'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryToken = new URLSearchParams(window.location.search).get('token');
      setToken(queryToken);
      setStep(queryToken ? 'reset' : 'request');
    }
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setMessage('Check your email for a password reset link');
      setLoading(false);
    }, 1000);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setMessage('Password reset successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-md mx-auto pt-20 px-6">
        <h1 className="text-white text-[32px] font-bold mb-2 text-center">Reset Password</h1>
        <p className="text-[#8B9DB8] text-center mb-8">Recover access to your account</p>

        {message && (
          <div className={`rounded-xl p-4 mb-6 ${
            message.includes('successfully')
              ? 'bg-[#00F260]/10 border border-[#00F260]/20 text-[#00F260]'
              : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
          }`}>
            {message}
          </div>
        )}

        {step === 'request' ? (
          /* Request Reset */
          <form onSubmit={handleRequest} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6">
            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
            </div>

            <p className="text-[#8B9DB8] text-[13px]">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <button type="submit" disabled={loading}
              className="w-full bg-[#00F260] text-black py-4 rounded-xl font-bold hover:bg-[#00D954] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <p className="text-[#8B9DB8] text-[13px]">
                Remember your password?{' '}
                <Link href="/login" className="text-[#00F260] font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        ) : (
          /* Reset Form */
          <form onSubmit={handleReset} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6">
            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
              <p className="text-[#64748B] text-[12px] mt-2">At least 8 characters, mix of letters and numbers</p>
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#00F260] text-black py-4 rounded-xl font-bold hover:bg-[#00D954] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
