'use client';
import { useState } from 'react';
import Header from '@/components/Header';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I create a tournament?",
      a: "Go to the Dashboard and click '+ New Event'. You'll be guided through a 3-step form: basic info, venues/courts, and divisions. Takes about 2 minutes!"
    },
    {
      q: "What tournament formats are supported?",
      a: "We support all major formats: Round Robin, Single Elimination, Double Elimination, Pool Play, and Mixer/Social. Pick the format that fits your event."
    },
    {
      q: "Can I edit an event after creating it?",
      a: "Yes! Go to your event's Settings tab. You can edit name, status, scoring format, divisions, and more. Some changes can't be made after brackets are generated."
    },
    {
      q: "How does live scoring work?",
      a: "Use the Live Scoring page during your tournament. Referees enter scores using the mobile-friendly interface. Updates broadcast to all connected devices in real-time."
    },
    {
      q: "Can I access Court Hero on mobile?",
      a: "Yes! Court Hero is fully responsive. The Referee interface is especially optimized for phones. We're also building native iOS/Android apps."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards, debit cards, and ACH transfers. Payments are processed securely via Stripe."
    },
    {
      q: "How are results reported to DUPR?",
      a: "After your tournament, results automatically submit to DUPR. Players see their updated ratings within 24 hours. You can also manually submit results."
    },
    {
      q: "Is there a free trial?",
      a: "Yes! Community plan is free forever with up to 32 players per event. Club plan includes a 14-day free trial. No credit card required."
    },
    {
      q: "How do I get support?",
      a: "Email support@courthero.app or use the live chat. For Enterprise customers, you get dedicated support. We're usually respond within 1 hour."
    },
  ];

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-3xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-2">Help & FAQ</h1>
        <p className="text-[#8B9DB8] mb-12">Answers to common questions</p>

        {/* Contact Support */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-12">
          <h2 className="text-white text-[20px] font-bold mb-4">Need Help?</h2>
          <p className="text-[#8B9DB8] mb-6">Can't find your answer? We're here to help.</p>
          <div className="flex gap-4">
            <a href="mailto:support@courthero.app"
              className="bg-[#00F260] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00D954] transition-all">
              📧 Email Support
            </a>
            <button className="border border-[#00F260]/30 text-[#00F260] px-6 py-3 rounded-lg font-bold hover:bg-[#00F260]/5 transition-all">
              💬 Live Chat
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <button key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full text-left p-6 bg-[#111827]/40 border border-white/[0.06] rounded-2xl hover:border-white/[0.1] transition-all">
              <div className="flex items-start justify-between">
                <h3 className="text-white font-bold text-[16px] flex-1">{faq.q}</h3>
                <span className={`text-[#00F260] text-[20px] flex-shrink-0 ml-4 transition-transform ${
                  openFaq === idx ? 'rotate-180' : ''
                }`}>
                  ▼
                </span>
              </div>
              
              {openFaq === idx && (
                <p className="text-[#8B9DB8] mt-4">{faq.a}</p>
              )}
            </button>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-12 bg-[#00F260]/5 border border-[#00F260]/20 rounded-2xl p-8">
          <h2 className="text-white text-[20px] font-bold mb-4">💡 Pro Tips</h2>
          <ul className="space-y-3 text-[#B8C4D4]">
            <li>✓ Use the Live Scoring page for real-time tournament updates</li>
            <li>✓ Enable notifications so players know match assignments</li>
            <li>✓ Export reports as CSV for record-keeping</li>
            <li>✓ Test with a practice tournament first</li>
            <li>✓ Upgrade to Club plan for unlimited players and matches</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
