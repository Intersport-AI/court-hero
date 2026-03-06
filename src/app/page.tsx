import Link from 'next/link';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="text-center mb-16">
          {/* Tagline */}
          <div className="inline-block mb-8">
            <div className="px-4 py-2 rounded-full border border-[#00F260]/40">
              <p className="text-[#00F260] text-[12px] font-bold uppercase tracking-widest">THE #1 PICKLEBALL EVENT TOOL</p>
            </div>
          </div>

          <h1 className="text-white text-[40px] sm:text-[56px] md:text-[68px] lg:text-[80px] font-black leading-tight mb-6 tracking-tight">
            Run Your Court<br className="block" />
            <span className="text-[#00F260]">Like a Hero</span>
          </h1>

          <p className="text-[#8B9DB8] text-[16px] sm:text-[18px] max-w-2xl mx-auto mb-10 leading-relaxed">
            Create a bracket in seconds. Players score from their phones. <span className="text-white font-semibold">Leaderboard updates live.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
            <Link href="/signup"
              className="bg-[#00F260] text-black px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-[#00E24E] transition-all shadow-lg hover:shadow-xl hover:shadow-[#00F260]/30">
              Create Your First Event — Free →
            </Link>
            <Link href="/discover"
              className="border-2 border-[#00F260]/40 text-white px-8 py-4 rounded-2xl font-semibold text-[16px] hover:border-[#00F260]/80 hover:bg-white/[0.05] transition-all">
              See How It Works ↓
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 px-4 sm:px-0 mt-20">
          <div className="text-center">
            <p className="text-[#00F260] text-[48px] font-bold">5,800+</p>
            <p className="text-[#8B9DB8] text-[15px] mt-2">Players Registered</p>
          </div>
          <div className="text-center">
            <p className="text-[#00F260] text-[48px] font-bold">142</p>
            <p className="text-[#8B9DB8] text-[15px] mt-2">Active Tournaments</p>
          </div>
          <div className="text-center">
            <p className="text-[#00F260] text-[48px] font-bold">$142K+</p>
            <p className="text-[#8B9DB8] text-[15px] mt-2">Total Prize Pools</p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-32">
          <h2 className="text-white text-[40px] sm:text-[48px] font-bold text-center mb-16">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
            {[
              { icon: '⚡', title: 'Quick Setup', desc: 'Create a tournament in under 2 minutes' },
              { icon: '🏆', title: 'All Formats', desc: 'Round Robin, Single/Double Elim, Pool Play' },
              { icon: '📊', title: 'Live Scoring', desc: 'Real-time bracket updates & leaderboards' },
              { icon: '🎯', title: 'Smart Scheduling', desc: 'AI-powered match scheduling engine' },
              { icon: '💰', title: 'Payments', desc: 'Stripe integration for player fees' },
              { icon: '📱', title: 'Mobile Ready', desc: 'Works on phones, tablets, & desktops' },
              { icon: '📈', title: 'Analytics', desc: 'Detailed reports & player statistics' },
              { icon: '🤝', title: 'DUPR Ready', desc: 'Auto-submit results to DUPR' },
              { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade security & encryption' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-[#111827]/50 border border-white/[0.08] rounded-2xl p-6 hover:border-[#00F260]/30 transition-all">
                <p className="text-[32px] mb-3">{feature.icon}</p>
                <h3 className="text-white font-bold text-[16px] mb-2">{feature.title}</h3>
                <p className="text-[#8B9DB8] text-[14px]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-32">
          <h2 className="text-white text-[40px] sm:text-[48px] font-bold text-center mb-16">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
            <div className="bg-[#111827]/50 border border-white/[0.08] rounded-2xl p-8">
              <h3 className="text-white font-bold text-[20px] mb-2">Community</h3>
              <p className="text-[#8B9DB8] text-[14px] mb-6">Perfect for trying it out</p>
              <p className="text-[#00F260] text-[36px] font-bold mb-6">Free</p>
              <ul className="space-y-2 text-[#8B9DB8] text-[14px] mb-6">
                <li>✓ Up to 64 players</li>
                <li>✓ All formats</li>
                <li>✓ Basic scoring</li>
              </ul>
              <Link href="/signup" className="w-full bg-white/[0.08] text-white px-4 py-3 rounded-lg font-bold hover:bg-white/[0.12] transition-all block text-center">
                Get Started
              </Link>
            </div>

            <div className="bg-[#00F260]/10 border-2 border-[#00F260] rounded-2xl p-8 relative">
              <span className="absolute top-4 right-4 bg-[#00F260] text-black text-[11px] font-bold px-3 py-1 rounded-full">POPULAR</span>
              <h3 className="text-white font-bold text-[20px] mb-2">Club</h3>
              <p className="text-[#8B9DB8] text-[14px] mb-6">For clubs and organizers</p>
              <p className="text-[#00F260] text-[36px] font-bold mb-1">$49<span className="text-[14px]">/mo</span></p>
              <p className="text-[#8B9DB8] text-[12px] mb-6">+ $1.50/player</p>
              <ul className="space-y-2 text-[#8B9DB8] text-[14px] mb-6">
                <li>✓ Unlimited events</li>
                <li>✓ Up to 256 players</li>
                <li>✓ All formats</li>
                <li>✓ Live scoring</li>
              </ul>
              <Link href="/signup" className="w-full bg-[#00F260] text-black px-4 py-3 rounded-lg font-bold hover:bg-[#00E24E] transition-all block text-center">
                Start Free Trial
              </Link>
            </div>

            <div className="bg-[#111827]/50 border border-white/[0.08] rounded-2xl p-8">
              <h3 className="text-white font-bold text-[20px] mb-2">Enterprise</h3>
              <p className="text-[#8B9DB8] text-[14px] mb-6">For large venues & leagues</p>
              <p className="text-[#00F260] text-[36px] font-bold mb-6">Custom</p>
              <ul className="space-y-2 text-[#8B9DB8] text-[14px] mb-6">
                <li>✓ Everything in Club</li>
                <li>✓ Unlimited scale</li>
                <li>✓ Custom integrations</li>
              </ul>
              <Link href="/contact" className="w-full bg-white/[0.08] text-white px-4 py-3 rounded-lg font-bold hover:bg-white/[0.12] transition-all block text-center">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#111827]/50 border border-[#00F260]/20 rounded-2xl p-12 text-center mx-4 sm:mx-0 mb-20">
          <h2 className="text-white text-[32px] sm:text-[40px] font-bold mb-4">Ready to run better tournaments?</h2>
          <p className="text-[#8B9DB8] text-[16px] mb-8 max-w-2xl mx-auto">Start for free today. No credit card required.</p>
          <Link href="/signup"
            className="inline-block bg-[#00F260] text-black px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-[#00E24E] transition-all shadow-lg hover:shadow-xl hover:shadow-[#00F260]/30">
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-[#8B9DB8] text-[14px]">
                <li><Link href="/discover" className="hover:text-[#00F260]">Browse Events</Link></li>
                <li><Link href="/pricing-2" className="hover:text-[#00F260]">Pricing</Link></li>
                <li><Link href="/help" className="hover:text-[#00F260]">Help</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-[#8B9DB8] text-[14px]">
                <li><Link href="/contact" className="hover:text-[#00F260]">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-[#00F260]">Terms</Link></li>
                <li><Link href="/terms" className="hover:text-[#00F260]">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-[#8B9DB8] text-[14px]">
                <li><Link href="/terms" className="hover:text-[#00F260]">Terms</Link></li>
                <li><a href="mailto:legal@courthero.app" className="hover:text-[#00F260]">Legal</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Connect</h3>
              <ul className="space-y-2 text-[#8B9DB8] text-[14px]">
                <li><a href="#" className="hover:text-[#00F260]">Twitter</a></li>
                <li><a href="#" className="hover:text-[#00F260]">LinkedIn</a></li>
                <li><a href="mailto:hello@courthero.app" className="hover:text-[#00F260]">Email</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 text-center">
            <p className="text-[#8B9DB8] text-[13px]">
              © 2026 Court Hero. The pickleball tournament platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
