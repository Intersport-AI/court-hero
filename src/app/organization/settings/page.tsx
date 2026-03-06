'use client';
import { useState } from 'react';
import Header from '@/components/Header';

export default function OrgSettingsPage() {
  const [orgName, setOrgName] = useState('Chicago Pickleball Club');
  const [email, setEmail] = useState('admin@chicagopickleball.org');
  const [website, setWebsite] = useState('https://chicagopickleball.org');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-3xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-8">Organization Settings</h1>

        {saved && (
          <div className="bg-[#00F260]/10 border border-[#00F260]/20 text-[#00F260] rounded-xl p-4 mb-6">
            ✓ Settings saved successfully
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-6">
          <h2 className="text-white text-[18px] font-bold mb-6">Organization Profile</h2>
          <div className="space-y-6">
            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Organization Name</label>
              <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Contact Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
            </div>

            <button onClick={handleSave}
              className="w-full bg-[#00F260] text-black py-4 rounded-xl font-bold hover:bg-[#00D954] transition-all">
              Save Changes
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-6">
          <h2 className="text-white text-[18px] font-bold mb-6">Team Members</h2>
          <div className="space-y-3 mb-6">
            {[
              { name: 'You', email: 'admin@chicagopickleball.org', role: 'Owner' },
              { name: 'Sarah Johnson', email: 'sarah@chicagopickleball.org', role: 'Admin' },
              { name: 'Mike Chen', email: 'mike@chicagopickleball.org', role: 'Editor' },
            ].map((member, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0A0D12]/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-[#8B9DB8] text-[12px]">{member.email}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#00F260]/10 text-[#00F260] text-[12px] font-bold">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full border border-[#00F260]/30 text-[#00F260] py-3 rounded-xl font-bold hover:bg-[#00F260]/5 transition-all">
            + Invite Team Member
          </button>
        </div>

        {/* Integrations */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-6">
          <h2 className="text-white text-[18px] font-bold mb-6">Integrations</h2>
          <div className="space-y-3">
            {[
              { name: 'Stripe', status: 'Connected', desc: 'Payment processing' },
              { name: 'DUPR', status: 'Connected', desc: 'Rating submissions' },
              { name: 'Google Calendar', status: 'Not Connected', desc: 'Sync tournament dates' },
            ].map((int, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0A0D12]/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">{int.name}</p>
                  <p className="text-[#8B9DB8] text-[12px]">{int.desc}</p>
                </div>
                <button className={`px-4 py-2 rounded-lg font-bold text-[13px] transition-all ${
                  int.status === 'Connected'
                    ? 'bg-[#00F260]/10 text-[#00F260] hover:bg-[#00F260]/20'
                    : 'bg-white/[0.05] text-[#8B9DB8] hover:bg-white/[0.1]'
                }`}>
                  {int.status === 'Connected' ? '✓ Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Billing */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8">
          <h2 className="text-white text-[18px] font-bold mb-6">Billing</h2>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 bg-[#0A0D12]/50 rounded-xl">
              <div>
                <p className="text-white font-medium">Current Plan</p>
                <p className="text-[#8B9DB8] text-[12px]">Club Plan - $49/month</p>
              </div>
              <button className="text-[#00F260] font-bold text-[13px] hover:underline">
                Upgrade
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0A0D12]/50 rounded-xl">
              <div>
                <p className="text-white font-medium">Renewal Date</p>
                <p className="text-[#8B9DB8] text-[12px]">March 27, 2026</p>
              </div>
              <button className="text-[#8B9DB8] font-bold text-[13px] hover:text-white">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
