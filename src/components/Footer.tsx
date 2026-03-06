import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 lg:px-16 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="space-y-3">
            <div>
              <img src="/logo-full.png" alt="Court Hero" className="h-7 w-auto object-contain" />
            </div>
            <p className="text-sm text-[#64748B] max-w-[260px] leading-relaxed">
              The easiest way to organize and run pickleball events.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Product</p>
              <nav className="flex flex-col gap-3">
                <Link href="/create" className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors">Create Event</Link>
                <Link href="/pricing" className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors">Pricing</Link>
                <Link href="/login" className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors">Log In</Link>
              </nav>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Support</p>
              <nav className="flex flex-col gap-3">
                <a href="mailto:hello@courthero.app" className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors">Contact</a>
                <a href="mailto:hello@courthero.app" className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors">hello@courthero.app</a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#3E4A5C]">© 2026 Court Hero. All rights reserved.</p>
          <p className="text-xs text-[#3E4A5C]">Made for the pickleball community 🥒</p>
        </div>
      </div>
    </footer>
  );
}
