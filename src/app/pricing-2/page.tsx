'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    id: 'community',
    name: 'Community',
    price: '$0/mo',
    period: '+ $2.50 per player',
    description: 'Perfect for casual events',
    features: [
      'Up to 64 players per event',
      'All 5 tournament formats',
      'Live scoring & leaderboards',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    id: 'club',
    name: 'Club',
    price: '$49/mo',
    period: '+ $1.50 per player',
    description: 'For club directors',
    features: [
      'Up to 256 players per event',
      'All tournament formats',
      'Live scoring & real-time updates',
      'Player database & history',
      'Event templates',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$199/mo',
    period: '+ $1.00 per player',
    description: 'For professional operators',
    features: [
      'Up to 2,000 players per event',
      'All tournament formats',
      'Real-time operations (Socket.IO)',
      'Advanced analytics & reports',
      'Event discovery listing',
      'Priority support',
      'API access',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '$0.50-$0.75 per player',
    description: 'For large-scale operations',
    features: [
      'Unlimited players',
      'Dedicated infrastructure',
      'White-label options',
      'Multi-organizer accounts',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      router.push('/signup');
      return;
    }

    if (planId === 'enterprise') {
      window.location.href = 'mailto:hello@courthero.app?subject=Enterprise%20Pricing%20Inquiry';
      return;
    }

    if (planId === 'community') {
      router.push('/dashboard');
      return;
    }

    // Club plan - start trial
    setLoading(true);
    try {
      // Would integrate with Stripe here
      // For now, just redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-7xl mx-auto pt-16 px-6 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-white text-[52px] font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-[#8B9DB8] text-[18px] max-w-2xl mx-auto">
            Choose the plan that works for your tournaments. No setup fees. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PLANS.map((plan) => (
            <div key={plan.id}
              className={`rounded-3xl transition-all ${
                plan.highlight
                  ? 'bg-gradient-to-b from-[#00F260]/10 to-transparent border-2 border-[#00F260] shadow-[0_0_40px_rgba(0,242,96,0.15)] scale-105'
                  : 'bg-[#111827]/40 border border-white/[0.06] hover:border-white/[0.1]'
              }`}>
              <div className="p-10">
                {plan.highlight && (
                  <span className="inline-block bg-[#00F260]/20 text-[#00F260] text-[12px] font-bold px-3 py-1 rounded-full mb-4">
                    MOST POPULAR
                  </span>
                )}
                
                <h3 className="text-white text-[24px] font-bold mb-2">{plan.name}</h3>
                <p className="text-[#8B9DB8] text-[14px] mb-6">{plan.description}</p>

                <div className="mb-8">
                  <div className="text-white text-[48px] font-bold">
                    {plan.price}
                    {plan.period && <span className="text-[16px] text-[#8B9DB8] font-normal">{plan.period}</span>}
                  </div>
                </div>

                <button onClick={() => handleSelectPlan(plan.id)} disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-[16px] mb-8 transition-all ${
                    plan.highlight
                      ? 'bg-[#00F260] text-black hover:bg-[#00D954]'
                      : 'bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.10]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {loading ? 'Loading...' : plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[#8B9DB8] text-[14px]">
                      <span className="text-[#00F260] font-bold mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-white text-[32px] font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I upgrade or downgrade anytime?',
                a: 'Yes, you can change your plan anytime. Changes take effect at the next billing cycle.',
              },
              {
                q: 'Do you offer a free trial?',
                a: 'Club plans come with a 14-day free trial. No credit card required.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and ACH transfers for enterprise customers.',
              },
              {
                q: 'Is there a contract or lock-in period?',
                a: 'No. Monthly plans can be canceled anytime. Annual plans get a 20% discount.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-white font-bold mb-2">{faq.q}</h3>
                <p className="text-[#8B9DB8]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
