'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingCard from '@/components/PricingCard';

export default function Pricing() {
  const handleSelect = (plan: string) => {
    if (plan === 'facility') {
      window.location.href = 'mailto:hello@courthero.app?subject=Facility%20License%20Inquiry';
    } else {
      window.location.href = '/create';
    }
  };

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
          <p className="text-[18px] sm:text-[20px] text-[#94A3B8] font-light max-w-[400px] mx-auto">
            Start free. Pay when you&apos;re ready.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-[1200px] mx-auto">
          <PricingCard
            title="Community"
            price="$0"
            period="mo"
            features={[
              'Perfect for casual events',
              'Up to 64 players per event',
              '$2.50 per player registration',
              'All 5 tournament formats',
              'Live scoring & leaderboards',
              'Basic analytics',
              'Community support',
            ]}
            cta="Start Free"
            onSelect={() => handleSelect('community')}
          />
          <PricingCard
            title="Club"
            price="$49"
            period="mo"
            features={[
              'For club directors',
              'Up to 256 players per event',
              '$1.50 per player registration',
              'All tournament formats',
              'Live scoring & real-time updates',
              'Player database & history',
              'Event templates',
              'Email support',
            ]}
            cta="Start Free Trial"
            onSelect={() => handleSelect('club')}
          />
          <PricingCard
            title="Pro"
            price="$199"
            period="mo"
            features={[
              'For professional operators',
              'Up to 2,000 players per event',
              '$1.00 per player registration',
              'All tournament formats',
              'Real-time operations (Socket.IO)',
              'Advanced analytics & reports',
              'Event discovery listing',
              'Priority support',
              'API access',
            ]}
            cta="Start Free Trial"
            highlighted
            onSelect={() => handleSelect('pro')}
          />
          <PricingCard
            title="Enterprise"
            price="Custom"
            features={[
              'For large-scale operations',
              'Unlimited players',
              '$0.50-$0.75 per player',
              'Dedicated infrastructure',
              'White-label options',
              'Multi-organizer accounts',
              'Custom integrations',
              'Dedicated account manager',
              'SLA guarantee',
            ]}
            cta="Contact Sales"
            onSelect={() => handleSelect('enterprise')}
          />
        </div>

        {/* FAQ / Contact */}
        <div className="mt-20 sm:mt-28 text-center">
          <p className="text-[18px] text-[#94A3B8] mb-3">Questions?</p>
          <a href="mailto:hello@courthero.app" className="text-[#00F260] hover:underline text-[16px] font-medium">
            hello@courthero.app
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
