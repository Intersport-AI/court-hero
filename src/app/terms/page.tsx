'use client';
import { useState } from 'react';
import Header from '@/components/Header';

export default function TermsPage() {
  const [tab, setTab] = useState('terms');

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-4xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-8">Legal</h1>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/[0.06] mb-8">
          <button onClick={() => setTab('terms')}
            className={`pb-4 font-medium transition-all ${
              tab === 'terms'
                ? 'text-[#00F260] border-b-2 border-[#00F260]'
                : 'text-[#8B9DB8] hover:text-white'
            }`}>
            Terms of Service
          </button>
          <button onClick={() => setTab('privacy')}
            className={`pb-4 font-medium transition-all ${
              tab === 'privacy'
                ? 'text-[#00F260] border-b-2 border-[#00F260]'
                : 'text-[#8B9DB8] hover:text-white'
            }`}>
            Privacy Policy
          </button>
        </div>

        {/* Terms of Service */}
        {tab === 'terms' && (
          <div className="prose prose-invert max-w-none">
            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6 text-[#B8C4D4]">
              <p className="text-[#8B9DB8] text-[13px]">Last updated: February 27, 2026</p>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">1. Acceptance of Terms</h2>
                <p className="text-[14px] leading-relaxed">
                  By accessing and using Court Hero, you accept and agree to be bound by these Terms of Service.
                  If you do not agree, do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">2. Use of Service</h2>
                <p className="text-[14px] leading-relaxed mb-3">
                  Court Hero provides tournament management software. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-[14px]">
                  <li>Provide accurate information</li>
                  <li>Keep your account secure</li>
                  <li>Not misuse or abuse the platform</li>
                  <li>Comply with all applicable laws</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">3. Payment & Refunds</h2>
                <p className="text-[14px] leading-relaxed">
                  Subscription fees are charged monthly or annually. Refunds are provided within 14 days
                  of initial subscription. Event-specific fees are non-refundable once brackets are generated.
                </p>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">4. Data & Privacy</h2>
                <p className="text-[14px] leading-relaxed">
                  We collect and process data as described in our Privacy Policy. By using Court Hero,
                  you consent to data collection and processing.
                </p>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">5. Limitation of Liability</h2>
                <p className="text-[14px] leading-relaxed">
                  Court Hero is provided "as is" without warranty. We are not liable for any damages
                  arising from use of the service, including but not limited to tournament issues, data loss,
                  or service interruptions.
                </p>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">6. Termination</h2>
                <p className="text-[14px] leading-relaxed">
                  We reserve the right to terminate accounts that violate these terms. You may cancel
                  your subscription at any time from your account settings.
                </p>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">7. Contact</h2>
                <p className="text-[14px] leading-relaxed">
                  Questions? Contact us at <a href="mailto:legal@courthero.app" className="text-[#00F260] hover:underline">legal@courthero.app</a>
                </p>
              </section>
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        {tab === 'privacy' && (
          <div className="prose prose-invert max-w-none">
            <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6 text-[#B8C4D4]">
              <p className="text-[#8B9DB8] text-[13px]">Last updated: February 27, 2026</p>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">1. Information We Collect</h2>
                <p className="text-[14px] leading-relaxed mb-3">We collect:</p>
                <ul className="list-disc pl-6 space-y-2 text-[14px]">
                  <li>Account information (name, email, organization)</li>
                  <li>Event data (tournaments, players, scores)</li>
                  <li>Payment information (processed securely via Stripe)</li>
                  <li>Usage data (analytics, performance metrics)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">2. How We Use Your Data</h2>
                <p className="text-[14px] leading-relaxed">
                  Your data is used to provide and improve our service, process payments, send notifications,
                  and generate analytics. We do not sell your data to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">3. Data Security</h2>
                <p className="text-[14px] leading-relaxed">
                  We use industry-standard encryption and security measures to protect your data.
                  Passwords are hashed using bcrypt. Payment data is handled securely by Stripe.
                </p>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">4. Data Sharing</h2>
                <p className="text-[14px] leading-relaxed">
                  We share data only with service providers necessary to operate our platform (Stripe, AWS, etc.)
                  and when required by law. Tournament results may be submitted to DUPR with your consent.
                </p>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">5. Your Rights</h2>
                <p className="text-[14px] leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-[14px]">
                  <li>Access your data</li>
                  <li>Request data deletion</li>
                  <li>Export your data</li>
                  <li>Opt out of marketing emails</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">6. Cookies</h2>
                <p className="text-[14px] leading-relaxed">
                  We use cookies for authentication and analytics. You can disable cookies in your browser,
                  but some features may not work properly.
                </p>
              </section>

              <section>
                <h2 className="text-white text-[20px] font-bold mb-3">7. Contact</h2>
                <p className="text-[14px] leading-relaxed">
                  Privacy questions? Email <a href="mailto:privacy@courthero.app" className="text-[#00F260] hover:underline">privacy@courthero.app</a>
                </p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
