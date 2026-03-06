'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function MyDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Mock data
  const upcomingMatches = [
    {
      id: 1,
      event: 'Summer Championship 2026',
      opponent: 'vs. Smith / Jones',
      time: 'Tomorrow at 2:00 PM',
      court: 'Court 3',
    },
    {
      id: 2,
      event: 'Downtown Cup',
      opponent: 'vs. Chen / Lee',
      time: 'Mar 1 at 10:00 AM',
      court: 'Court 1',
    },
  ];

  const recentResults = [
    {
      id: 1,
      event: 'Winter Open 2026',
      opponent: 'vs. Davis / Brown',
      score: 'Won 11-8, 11-7',
      date: 'Feb 22',
    },
    {
      id: 2,
      event: 'Club Championship',
      opponent: 'vs. Wilson / Taylor',
      score: 'Lost 8-11, 6-11',
      date: 'Feb 15',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-4xl mx-auto pt-12 px-6 pb-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-white text-[40px] font-bold">
            {user?.first_name || 'My'} Dashboard
          </h1>
          <p className="text-[#8B9DB8] mt-2">Track your matches and results</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/[0.06] mb-8">
          {['upcoming', 'results', 'events'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-4 font-medium transition-all ${
                tab === t
                  ? 'text-[#00F260] border-b-2 border-[#00F260]'
                  : 'text-[#8B9DB8] hover:text-white'
              }`}>
              {t === 'upcoming' && 'Upcoming Matches'}
              {t === 'results' && 'Recent Results'}
              {t === 'events' && 'My Events'}
            </button>
          ))}
        </div>

        {/* Upcoming Matches */}
        {tab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingMatches.length === 0 ? (
              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-12 text-center">
                <p className="text-[#8B9DB8]">No upcoming matches. Find a tournament to join!</p>
              </div>
            ) : (
              upcomingMatches.map((match) => (
                <div key={match.id} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 hover:border-[#00F260]/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-[16px] mb-1">{match.opponent}</h3>
                      <p className="text-[#8B9DB8] text-[14px] mb-3">{match.event}</p>
                      <div className="flex gap-4 text-[#64748B] text-[13px]">
                        <span>🕐 {match.time}</span>
                        <span>🏐 {match.court}</span>
                      </div>
                    </div>
                    <button className="bg-[#00F260] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#00D954] transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Recent Results */}
        {tab === 'results' && (
          <div className="space-y-4">
            {recentResults.length === 0 ? (
              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-12 text-center">
                <p className="text-[#8B9DB8]">No results yet. Join a tournament to get started!</p>
              </div>
            ) : (
              recentResults.map((result) => (
                <div key={result.id} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-[16px] mb-1">{result.opponent}</h3>
                      <p className="text-[#8B9DB8] text-[14px] mb-2">{result.event}</p>
                      <p className="text-[#00F260] font-medium text-[14px]">{result.score}</p>
                    </div>
                    <p className="text-[#64748B] text-[13px]">{result.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* My Events */}
        {tab === 'events' && (
          <div className="text-center py-12">
            <p className="text-[#8B9DB8] mb-6">You haven't registered for any events yet</p>
            <button onClick={() => router.push('/discover')}
              className="bg-[#00F260] text-black px-8 py-4 rounded-xl font-bold hover:bg-[#00D954] transition-all">
              Browse Tournaments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
