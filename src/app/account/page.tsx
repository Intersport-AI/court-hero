'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { user, signout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignout = async () => {
    await signout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-3xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-8">Account Settings</h1>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/[0.06] mb-8">
          {['profile', 'organization', 'notifications', 'billing'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-4 font-medium transition-all capitalize ${
                tab === t
                  ? 'text-[#00F260] border-b-2 border-[#00F260]'
                  : 'text-[#8B9DB8] hover:text-white'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {saved && (
          <div className="bg-[#00F260]/10 border border-[#00F260]/20 text-[#00F260] rounded-xl p-4 mb-6">
            ✓ Changes saved successfully
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6">
            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40" />
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Email</label>
              <input type="email" value={email} disabled
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-[#8B9DB8] outline-none cursor-not-allowed" />
              <p className="text-[#64748B] text-[12px] mt-2">Email cannot be changed</p>
            </div>

            <button onClick={handleSave}
              className="w-full bg-[#00F260] text-black py-4 rounded-xl font-bold hover:bg-[#00D954] transition-all">
              Save Profile
            </button>
          </div>
        )}

        {/* Organization Tab */}
        {tab === 'organization' && (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6">
            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Organization Name</label>
              <input type="text" value={user?.first_name || ''} disabled
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-[#8B9DB8] outline-none cursor-not-allowed" />
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Organization ID</label>
              <input type="text" value={user?.org_id || ''} disabled
                className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-[#8B9DB8] font-mono text-[12px] outline-none cursor-not-allowed" />
            </div>

            <div>
              <label className="text-[#B8C4D4] text-[13px] font-medium block mb-2">Plan</label>
              <div className="px-4 py-4 bg-[#0A0D12] rounded-xl">
                <p className="text-[#00F260] font-bold">Club Plan</p>
                <p className="text-[#8B9DB8] text-[12px] mt-1">$49/month • Renews Mar 27</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-4">
            {[
              { label: 'Event reminders', desc: 'Get notified 24h before tournament' },
              { label: 'Match assignments', desc: 'Notify players when their match is ready' },
              { label: 'Score updates', desc: 'Live notifications of match results' },
              { label: 'Registration emails', desc: 'Confirmation when players join' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0A0D12]/50 rounded-xl">
                <div>
                  <p className="text-white font-medium text-[14px]">{item.label}</p>
                  <p className="text-[#8B9DB8] text-[12px]">{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            ))}
          </div>
        )}

        {/* Billing Tab */}
        {tab === 'billing' && (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6">
            <div className="border-b border-white/[0.06] pb-6">
              <h2 className="text-white font-bold mb-4">Current Plan</h2>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white text-[18px] font-bold">Club Plan</p>
                  <p className="text-[#8B9DB8] text-[14px] mt-1">$49 per month</p>
                </div>
                <button className="text-[#00F260] font-bold hover:text-[#00D954]">Manage Billing</button>
              </div>
            </div>

            <div>
              <h2 className="text-white font-bold mb-4">Payment Method</h2>
              <div className="bg-[#0A0D12]/50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-white">💳 Visa ending in 4242</span>
                <button className="text-[#8B9DB8] hover:text-white text-[13px] font-bold">Update</button>
              </div>
            </div>

            <div>
              <h2 className="text-white font-bold mb-4">Billing History</h2>
              <div className="space-y-2">
                {[
                  { date: 'Feb 27, 2026', amount: '$49.00', status: 'Paid' },
                  { date: 'Jan 27, 2026', amount: '$49.00', status: 'Paid' },
                ].map((invoice, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#0A0D12]/50 rounded-lg text-[13px]">
                    <span className="text-[#8B9DB8]">{invoice.date}</span>
                    <span className="text-white font-bold">{invoice.amount}</span>
                    <span className="text-[#00F260]">{invoice.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <button onClick={handleSignout}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-400 py-4 rounded-xl font-bold hover:bg-red-500/20 transition-all">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
