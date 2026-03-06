'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { signin, error: authError, clearError } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    
    if (!email || !password) {
      return;
    }

    setLoading(true);
    const success = await signin(email, password);
    setLoading(false);
    
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-[440px] mx-auto pt-[140px] px-6">
        <div className="bg-[#111827]/60 border border-white/[0.06] rounded-3xl p-8 sm:p-10 backdrop-blur-xl">
          <h1 className="text-white text-[32px] font-bold mb-2 tracking-tight">Welcome back</h1>
          <p className="text-[#8B9DB8] text-[15px] mb-8">Sign in to manage your tournaments</p>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[14px] rounded-xl px-4 py-3 mb-6">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Email</label>
              <input
                ref={emailRef}
                type="email"
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white placeholder-[#4B5563] focus:border-[#00F260]/40 focus:ring-1 focus:ring-[#00F260]/20 outline-none transition-all text-[15px]"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Password</label>
              <input
                ref={passwordRef}
                type="password"
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white placeholder-[#4B5563] focus:border-[#00F260]/40 focus:ring-1 focus:ring-[#00F260]/20 outline-none transition-all text-[15px]"
                placeholder="Your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00F260] text-black py-5 rounded-2xl font-bold text-[17px] hover:bg-[#00D954] transition-all duration-200 active:scale-[0.97] shadow-[0_0_40px_rgba(0,242,96,0.15)] mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-[#64748B] text-[14px] text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#00F260] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
