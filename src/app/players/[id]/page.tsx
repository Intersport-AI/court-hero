'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = params.id as string;
  const [tab, setTab] = useState('overview');

  const playerData = {
    name: 'Sarah Johnson',
    rating: 3.8,
    level: 'Intermediate',
    joinDate: 'Jan 2024',
    tournaments: 12,
    matches: 38,
    wins: 24,
    losses: 14,
    winPercentage: 63,
  };

  const recentMatches = [
    { date: 'Feb 26', opponent: 'vs. Smith / Jones', result: 'Won 11-8, 11-7', tournament: 'Summer Championship' },
    { date: 'Feb 22', opponent: 'vs. Chen / Lee', result: 'Lost 8-11, 6-11', tournament: 'Downtown Cup' },
    { date: 'Feb 18', opponent: 'vs. Davis / Brown', result: 'Won 11-9, 11-6', tournament: 'Winter Open' },
  ];

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-6xl mx-auto pt-8 px-6 pb-12">
        {/* Player Header */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-white text-[40px] font-bold">{playerData.name}</h1>
              <p className="text-[#8B9DB8] mt-2">Joined {playerData.joinDate}</p>
            </div>
            <div className="text-right">
              <div className="text-[48px] font-bold text-[#00F260]">{playerData.rating}</div>
              <p className="text-[#8B9DB8] text-[14px]">DUPR Rating</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">LEVEL</p>
              <p className="text-white font-bold text-[18px]">{playerData.level}</p>
            </div>
            <div>
              <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">TOURNAMENTS</p>
              <p className="text-white font-bold text-[18px]">{playerData.tournaments}</p>
            </div>
            <div>
              <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">RECORD</p>
              <p className="text-white font-bold text-[18px]">{playerData.wins}-{playerData.losses}</p>
            </div>
            <div>
              <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">WIN %</p>
              <p className="text-[#00F260] font-bold text-[18px]">{playerData.winPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/[0.06] mb-8">
          {['overview', 'matches', 'stats'].map((t) => (
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

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Matches */}
              <div>
                <h2 className="text-white text-[20px] font-bold mb-4">Recent Matches</h2>
                <div className="space-y-3">
                  {recentMatches.map((match, idx) => (
                    <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-bold text-[14px]">{match.opponent}</p>
                          <p className="text-[#8B9DB8] text-[12px]">{match.tournament}</p>
                        </div>
                        <span className={`text-[12px] font-bold px-3 py-1 rounded ${
                          match.result.includes('Won')
                            ? 'bg-[#00F260]/10 text-[#00F260]'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {match.result.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[#8B9DB8] text-[13px]">{match.result}</p>
                      <p className="text-[#64748B] text-[12px] mt-2">{match.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8B9DB8]">Total Matches</span>
                    <span className="text-white font-bold">{playerData.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B9DB8]">Matches Won</span>
                    <span className="text-[#00F260] font-bold">{playerData.wins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B9DB8]">Matches Lost</span>
                    <span className="text-red-400 font-bold">{playerData.losses}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button className="w-full bg-[#00F260] text-black py-3 rounded-lg font-bold hover:bg-[#00D954] transition-all">
                  Invite to Tournament
                </button>
                <button className="w-full border border-[#00F260]/30 text-[#00F260] py-3 rounded-lg font-bold hover:bg-[#00F260]/5 transition-all">
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {tab === 'matches' && (
          <div className="text-center py-12">
            <p className="text-[#8B9DB8]">Detailed match history coming soon</p>
          </div>
        )}

        {/* Stats Tab */}
        {tab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Avg Points For', value: '10.5' },
              { label: 'Avg Points Against', value: '8.2' },
              { label: 'Longest Win Streak', value: '5' },
              { label: 'Best Tournament Finish', value: '1st Place' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
                <p className="text-[#8B9DB8] text-[13px] font-medium mb-2">{stat.label}</p>
                <p className="text-white text-[32px] font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
