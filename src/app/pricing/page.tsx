'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />

      <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        {/* Section header */}
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-[#00F260] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] mb-5">
            Pricing
          </p>
          <h1 className="text-[36px] sm:text-[48px] md:text-[56px] font-black text-white tracking-[-0.03em] leading-[1.1] mb-5">
            Simple Pricing
          </h1>
          <p className="text-[18px] sm:text-[20px] text-[#94A3B8] font-light max-w-[600px] mx-auto">
            Start free for the first 50 organizers. No credit card required.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
          {/* Organizer Plan */}
          <div className="bg-[#1A1F27]/50 border border-[#00F260]/20 rounded-2xl p-8">
            <h3 className="text-white text-[24px] font-bold mb-4">Organizer</h3>
            <p className="text-[#8B9DB8] text-[14px] mb-6">Manage your pickleball club</p>
            <p className="text-[#00F260] text-[48px] font-bold mb-6">$99<span className="text-[18px] text-[#8B9DB8]">/month</span></p>
            
            <ul className="space-y-3 mb-8">
              <li className="text-[#8B9DB8] text-[14px]">✓ Unlimited games</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Skill level matching</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Live leaderboards</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Player RSVP system</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ SMS reminders (24h before)</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Revenue dashboard</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Email support</li>
            </ul>
            
            <Link href="/signup" className="w-full block text-center bg-[#00F260] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#00E24E] transition-all">
              Start Free
            </Link>
            
            <p className="text-center text-[#8B9DB8] text-[12px] mt-4">Free for first 50 organizers</p>
          </div>

          {/* Plus Plan */}
          <div className="bg-[#1A1F27]/50 border border-[#00F260]/40 rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-8 inline-block bg-[#00F260]/20 text-[#00F260] px-3 py-1 rounded-full text-[12px] font-bold">
              EARLY ACCESS
            </div>
            
            <h3 className="text-white text-[24px] font-bold mb-4">Plus</h3>
            <p className="text-[#8B9DB8] text-[14px] mb-6">Everything + advanced features</p>
            <p className="text-[#00F260] text-[48px] font-bold mb-6">$249<span className="text-[18px] text-[#8B9DB8]">/month</span></p>
            
            <ul className="space-y-3 mb-8">
              <li className="text-[#8B9DB8] text-[14px]">✓ Everything in Organizer</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Payment collection ($2/player)</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Advanced analytics & reports</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Bulk player import</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Custom branding</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ API access</li>
              <li className="text-[#8B9DB8] text-[14px]">✓ Priority support</li>
            </ul>
            
            <Link href="/signup" className="w-full block text-center bg-[#00F260] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#00E24E] transition-all">
              Request Access
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-[700px] mx-auto mt-20">
          <h2 className="text-white text-[32px] font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-white text-[16px] font-bold mb-2">Can I cancel anytime?</h4>
              <p className="text-[#8B9DB8] text-[14px]">Yes. No long-term contracts. Cancel anytime with one click.</p>
            </div>
            
            <div>
              <h4 className="text-white text-[16px] font-bold mb-2">Is there a free trial?</h4>
              <p className="text-[#8B9DB8] text-[14px]">Yes. First 50 organizers get unlimited free access. After that, start with the free tier or upgrade anytime.</p>
            </div>
            
            <div>
              <h4 className="text-white text-[16px] font-bold mb-2">What does the $2/player fee mean?</h4>
              <p className="text-[#8B9DB8] text-[14px]">With Plus, you can charge players $10 per game. We take $2, you keep $8. Plus organizers also get payment processing support.</p>
            </div>
            
            <div>
              <h4 className="text-white text-[16px] font-bold mb-2">Can I upgrade or downgrade?</h4>
              <p className="text-[#8B9DB8] text-[14px]">Yes. Change your plan anytime. Upgrading charges the prorated difference, downgrading credits the prorated amount.</p>
            </div>
            
            <div>
              <h4 className="text-white text-[16px] font-bold mb-2">Do you offer discounts?</h4>
              <p className="text-[#8B9DB8] text-[14px]">Yes. Annual plans get 2 months free (pay for 10, get 12). Contact hello@courthero.app for volume discounts.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h3 className="text-white text-[28px] font-bold mb-4">Ready to get started?</h3>
          <p className="text-[#8B9DB8] text-[16px] mb-8">Join hundreds of pickleball organizers.</p>
          <Link href="/signup" className="inline-block bg-[#00F260] text-black px-8 py-4 rounded-2xl font-bold text-[16px] hover:bg-[#00E24E] transition-all shadow-lg hover:shadow-xl hover:shadow-[#00F260]/30">
            Create Your Club Now →
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
