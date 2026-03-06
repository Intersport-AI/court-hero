'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0C0F14]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#0C0F14]/60">
      <div className="mx-auto w-full max-w-[1440px] px-8 sm:px-16 lg:px-24">
        <div className="flex h-[76px] items-center justify-between">
          <Link href="/" className="shrink-0">
            <img src="/logo-full.png" alt="Court Hero" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/pricing" className="px-5 py-2.5 text-[14px] text-[#8B9DB8] hover:text-white font-medium transition-colors rounded-xl hover:bg-white/[0.05]">
              Pricing
            </Link>
            <Link href="/login" className="px-5 py-2.5 text-[14px] text-[#8B9DB8] hover:text-white font-medium transition-colors rounded-xl hover:bg-white/[0.05]">
              Log In
            </Link>
            <div className="w-px h-5 bg-white/[0.08] mx-3" />
            <Link href="/create" className="bg-[#00F260] text-black px-8 py-3.5 rounded-xl text-[14px] font-bold hover:bg-[#00D954] transition-all duration-150 active:scale-[0.97] shadow-[0_0_24px_rgba(0,242,96,0.15)] hover:shadow-[0_0_36px_rgba(0,242,96,0.25)]">
              Create Event
            </Link>
          </nav>

          <button className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl text-[#8B9DB8] hover:text-white hover:bg-white/[0.06] transition" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0C0F14]/95 backdrop-blur-2xl">
          <div className="px-8 py-6 space-y-2">
            <Link href="/pricing" className="block px-4 py-3.5 text-[15px] text-[#8B9DB8] hover:text-white font-medium rounded-xl hover:bg-white/[0.04] transition" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link href="/login" className="block px-4 py-3.5 text-[15px] text-[#8B9DB8] hover:text-white font-medium rounded-xl hover:bg-white/[0.04] transition" onClick={() => setMenuOpen(false)}>Log In</Link>
            <div className="pt-2">
              <Link href="/create" className="block bg-[#00F260] text-black px-6 py-4.5 rounded-xl text-[15px] font-bold text-center" onClick={() => setMenuOpen(false)}>Create Event</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
