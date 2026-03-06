'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { searchEvents } from '@/lib/api-client';

export default function EventPlayPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [tab, setTab] = useState('join');
  const [playerName, setPlayerName] = useState('');
  const [playerRating, setPlayerRating] = useState('3.5');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call API to register player
      setJoined(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-2xl mx-auto pt-12 px-6 pb-12">
        {!joined ? (
          <>
            <h1 className="text-white text-[36px] font-bold mb-2">Join Tournament</h1>
            <p className="text-[#8B9DB8] mb-8">Enter your details to register</p>

            <form onSubmit={handleJoin} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 space-y-6">
              <div>
                <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">Your Name</label>
                <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40 text-[15px]"
                  placeholder="First Last" required />
              </div>

              <div>
                <label className="text-[#B8C4D4] text-[14px] font-medium block mb-2">Skill Level (DUPR Rating)</label>
                <select value={playerRating} onChange={(e) => setPlayerRating(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/[0.08] rounded-xl px-4 py-4 text-white outline-none focus:border-[#00F260]/40 text-[15px]">
                  {[...Array(35)].map((_, i) => {
                    const rating = 1.0 + i * 0.5;
                    return <option key={rating} value={rating}>{rating.toFixed(1)}</option>;
                  })}
                </select>
                <p className="text-[#64748B] text-[13px] mt-1">Beginner: 1-2 | Intermediate: 3-4 | Advanced: 5-6 | Elite: 6+</p>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#00F260] text-black px-6 py-5 rounded-2xl font-bold text-[16px] hover:bg-[#00D954] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {loading ? 'Joining...' : 'Join Tournament'}
              </button>

              <p className="text-[#64748B] text-[13px] text-center">
                By joining, you agree to have your stats and results shared
              </p>
            </form>
          </>
        ) : (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-12 text-center">
            <div className="text-[64px] mb-4">✅</div>
            <h2 className="text-white text-[24px] font-bold mb-2">Welcome, {playerName}!</h2>
            <p className="text-[#8B9DB8] mb-8">You're registered for this tournament.</p>
            <p className="text-[#8B9DB8]">Watch this space for your match assignment and live scoring updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
