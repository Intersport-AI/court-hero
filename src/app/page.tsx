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
              <p className="text-[#00F260] text-[12px] font-bold uppercase tracking-widest">PICKLEBALL CLUB ORGANIZER</p>
            </div>
          </div>

          <h1 className="text-white text-[40px] sm:text-[56px] md:text-[68px] lg:text-[80px] font-black leading-tight mb-6 tracking-tight">
            Organize Your<br className="block" />
            <span className="text-[#00F260]">Pickleball Club</span>
          </h1>

          <p className="text-[#8B9DB8] text-[16px] sm:text-[18px] max-w-2xl mx-auto mb-10 leading-relaxed">
            One-click RSVPs. Automatic skill matching. Real-time leaderboards. Players organize themselves.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
            <Link href="/signup"
              className="bg-[#00F260] text-black px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-[#00E24E] transition-all shadow-lg hover:shadow-xl hover:shadow-[#00F260]/30">
              Create Your Club — Free for First 50 →
            </Link>
            <Link href="/discover"
              className="border-2 border-[#00F260]/40 text-white px-8 py-4 rounded-2xl font-semibold text-[16px] hover:border-[#00F260]/80 hover:bg-white/[0.05] transition-all">
              See How It Works ↓
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 px-4 sm:px-0 mt-20">
          <div className="bg-[#1A1F27]/50 border border-[#00F260]/20 rounded-2xl p-8">
            <div className="text-[#00F260] text-[32px] mb-4">📋</div>
            <h3 className="text-white text-[18px] font-bold mb-3">Easy RSVPs</h3>
            <p className="text-[#8B9DB8] text-[14px]">Players RSVP in 10 seconds. Automatic reminders 24h before. Never wonder who's playing.</p>
          </div>

          <div className="bg-[#1A1F27]/50 border border-[#00F260]/20 rounded-2xl p-8">
            <div className="text-[#00F260] text-[32px] mb-4">⚖️</div>
            <h3 className="text-white text-[18px] font-bold mb-3">Skill Matching</h3>
            <p className="text-[#8B9DB8] text-[14px]">AI generates fair teams based on skill levels. Everyone plays balanced, competitive games.</p>
          </div>

          <div className="bg-[#1A1F27]/50 border border-[#00F260]/20 rounded-2xl p-8">
            <div className="text-[#00F260] text-[32px] mb-4">🏆</div>
            <h3 className="text-white text-[18px] font-bold mb-3">Live Leaderboards</h3>
            <p className="text-[#8B9DB8] text-[14px]">Track wins, losses, and rankings. Build healthy competition and community engagement.</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mb-32 px-4 sm:px-0">
          <h2 className="text-white text-[36px] font-bold text-center mb-16">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00F260] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-[18px]">1</span>
              </div>
              <div>
                <h3 className="text-white text-[18px] font-bold mb-2">Create Your Club</h3>
                <p className="text-[#8B9DB8]">Set your skill levels, location, and regular game times.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00F260] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-[18px]">2</span>
              </div>
              <div>
                <h3 className="text-white text-[18px] font-bold mb-2">Schedule Games</h3>
                <p className="text-[#8B9DB8]">Create weekly games. We handle the reminders and notifications.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00F260] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-[18px]">3</span>
              </div>
              <div>
                <h3 className="text-white text-[18px] font-bold mb-2">Players RSVP</h3>
                <p className="text-[#8B9DB8]">Players confirm attendance. We match them by skill level automatically.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-[#00F260] rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-[18px]">4</span>
              </div>
              <div>
                <h3 className="text-white text-[18px] font-bold mb-2">Track Results</h3>
                <p className="text-[#8B9DB8]">Record winners. Leaderboard updates live. Community engagement grows.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="max-w-3xl mx-auto mb-32 px-4 sm:px-0">
          <h2 className="text-white text-[36px] font-bold text-center mb-16">Simple Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1A1F27]/50 border border-[#00F260]/20 rounded-2xl p-8">
              <h3 className="text-white text-[24px] font-bold mb-4">Organizer</h3>
              <p className="text-[#8B9DB8] text-[14px] mb-6">Manage your pickleball club</p>
              <p className="text-[#00F260] text-[32px] font-bold mb-6">$99<span className="text-[16px] text-[#8B9DB8]">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="text-[#8B9DB8] text-[14px]">✓ Unlimited games</li>
                <li className="text-[#8B9DB8] text-[14px]">✓ Skill matching</li>
                <li className="text-[#8B9DB8] text-[14px]">✓ Leaderboards</li>
                <li className="text-[#8B9DB8] text-[14px]">✓ SMS reminders</li>
                <li className="text-[#8B9DB8] text-[14px]">✓ Revenue dashboard</li>
              </ul>
              <Link href="/signup" className="w-full block text-center bg-[#00F260] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#00E24E] transition-all">
                Start Free
              </Link>
            </div>

            <div className="bg-[#1A1F27]/50 border border-[#00F260]/40 rounded-2xl p-8">
              <div className="inline-block bg-[#00F260]/20 text-[#00F260] px-3 py-1 rounded-full text-[12px] font-bold mb-4">EARLY ACCESS</div>
              <h3 className="text-white text-[24px] font-bold mb-4">Plus</h3>
              <p className="text-[#8B9DB8] text-[14px] mb-6">Everything + advanced features</p>
              <p className="text-[#00F260] text-[32px] font-bold mb-6">$249<span className="text-[16px] text-[#8B9DB8]">/month</span></p>
              <ul className="space-y-3 mb-8">
                <li className="text-[#8B9DB8] text-[14px]">✓ Everything in Organizer</li>
                <li className="text-[#8B9DB8] text-[14px]">✓ Payment collection ($2/player)</li>
                <li className="text-[#8B9DB8] text-[14px]">✓ Advanced analytics</li>
                <li className="text-[#8B9DB8] text-[14px]">✓ Integration support</li>
                <li className="text-[#8B9DB8] text-[14px]">✓ Priority support</li>
              </ul>
              <Link href="/signup" className="w-full block text-center bg-[#00F260] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#00E24E] transition-all">
                Request Access
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center px-4 sm:px-0">
          <h2 className="text-white text-[36px] font-bold mb-6">Ready to Organize Like a Hero?</h2>
          <p className="text-[#8B9DB8] text-[16px] mb-8 max-w-2xl mx-auto">Join 100+ pickleball organizers. Free for first 50.</p>
          <Link href="/signup"
            className="inline-block bg-[#00F260] text-black px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-[#00E24E] transition-all shadow-lg hover:shadow-xl hover:shadow-[#00F260]/30">
            Create Your Club Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
// Build: 1774329258
