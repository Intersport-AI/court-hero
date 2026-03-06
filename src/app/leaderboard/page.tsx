'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface LeaderboardEntry {
  rank: number;
  name: string;
  rating: number;
  tournaments: number;
  wins: number;
  losses: number;
  winPercent: number;
  trend: 'up' | 'down' | 'stable';
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState('alltime');
  const [division, setDivision] = useState('all');

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Sarah Johnson', rating: 4.5, tournaments: 28, wins: 85, losses: 22, winPercent: 79, trend: 'up' },
    { rank: 2, name: 'Mike Chen', rating: 4.3, tournaments: 26, wins: 78, losses: 28, winPercent: 74, trend: 'up' },
    { rank: 3, name: 'Jessica Davis', rating: 4.1, tournaments: 24, wins: 70, losses: 32, winPercent: 69, trend: 'stable' },
    { rank: 4, name: 'Robert Wilson', rating: 3.9, tournaments: 22, wins: 62, losses: 38, winPercent: 62, trend: 'down' },
    { rank: 5, name: 'Amanda Martinez', rating: 3.8, tournaments: 20, wins: 58, losses: 42, winPercent: 58, trend: 'up' },
    { rank: 6, name: 'James Taylor', rating: 3.7, tournaments: 19, wins: 54, losses: 46, winPercent: 54, trend: 'stable' },
  ];

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-6xl mx-auto pt-8 px-6 pb-12">
        <div className="mb-8">
          <h1 className="text-white text-[40px] font-bold mb-2">Global Leaderboard</h1>
          <p className="text-[#8B9DB8]">Top players on Court Hero</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
            className="bg-[#111827] border border-white/[0.06] text-white px-4 py-2 rounded-lg outline-none">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="alltime">All Time</option>
          </select>

          <select value={division} onChange={(e) => setDivision(e.target.value)}
            className="bg-[#111827] border border-white/[0.06] text-white px-4 py-2 rounded-lg outline-none">
            <option value="all">All Divisions</option>
            <option value="open">Open</option>
            <option value="women">Women</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-8 py-6 bg-[#0A0D12]/50 border-b border-white/[0.06] font-bold text-[13px] text-[#8B9DB8]">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2 text-right">Rating</div>
            <div className="col-span-2 text-right">Record</div>
            <div className="col-span-3 text-right">Win %</div>
          </div>

          {leaderboard.map((entry, idx) => (
            <Link key={idx} href={`/players/${entry.name.toLowerCase().replace(' ', '-')}`}
              className={`grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/[0.06] hover:bg-[#0A0D12]/20 transition-all items-center ${
                idx < 3 ? 'bg-[#0A0D12]/30' : ''
              }`}>
              <div className="col-span-1">
                <span className={`text-[20px] font-bold ${
                  idx === 0 ? 'text-[#FFB800]' :
                  idx === 1 ? 'text-[#C0C0C0]' :
                  idx === 2 ? 'text-[#CD7F32]' :
                  'text-[#8B9DB8]'
                }`}>
                  {entry.rank}
                </span>
              </div>
              <div className="col-span-4">
                <p className="text-white font-bold text-[15px]">{entry.name}</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-[#00F260] font-bold text-[15px]">{entry.rating}</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-[#8B9DB8]">{entry.wins}–{entry.losses}</p>
              </div>
              <div className="col-span-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[#FFB800] font-bold">{entry.winPercent}%</span>
                  {entry.trend === 'up' && <span className="text-[#00F260] text-[12px]">↑</span>}
                  {entry.trend === 'down' && <span className="text-red-400 text-[12px]">↓</span>}
                  {entry.trend === 'stable' && <span className="text-[#8B9DB8] text-[12px]">→</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* About Section */}
        <div className="mt-12 bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8">
          <h2 className="text-white text-[20px] font-bold mb-4">About the Leaderboard</h2>
          <p className="text-[#8B9DB8] text-[14px] leading-relaxed">
            The global leaderboard ranks players based on their tournament performance on Court Hero.
            Rankings are calculated using wins, losses, tournament count, and DUPR rating.
            Players must have participated in at least 5 tournaments to appear on the leaderboard.
          </p>
        </div>
      </div>
    </div>
  );
}
