'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';

interface Match {
  id: string;
  court: string;
  team1: string;
  team2: string;
  status: 'pending' | 'in-progress' | 'completed';
  score1: number;
  score2: number;
}

export default function CommandCenterPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [matches, setMatches] = useState<Match[]>([]);
  const [autoStart, setAutoStart] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Mock matches
    setMatches([
      { id: '1', court: 'Court 1', team1: 'Smith / Jones', team2: 'Chen / Lee', status: 'in-progress', score1: 8, score2: 6 },
      { id: '2', court: 'Court 2', team1: 'Davis / Brown', team2: 'Wilson / Taylor', status: 'in-progress', score1: 5, score2: 9 },
      { id: '3', court: 'Court 3', team1: 'Garcia / Martinez', team2: 'Anderson / Thomas', status: 'pending', score1: 0, score2: 0 },
      { id: '4', court: 'Court 4', team1: 'Jackson / White', team2: 'Harris / Martin', status: 'pending', score1: 0, score2: 0 },
      { id: '5', court: 'Court 5', team1: 'Thompson / Garcia', team2: 'Martinez / Rodriguez', status: 'completed', score1: 11, score2: 8 },
    ]);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [eventId]);

  const inProgressCount = matches.filter(m => m.status === 'in-progress').length;
  const completedCount = matches.filter(m => m.status === 'completed').length;
  const pendingCount = matches.filter(m => m.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-7xl mx-auto pt-8 px-6 pb-12">
        {/* Header with Live Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-[40px] font-bold">Command Center</h1>
            <p className="text-[#8B9DB8] mt-1">Real-time tournament control</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-[#00F260] animate-pulse"></span>
              <span className="text-[#00F260] font-bold">LIVE</span>
            </div>
            <p className="text-[#8B9DB8] text-[13px]">{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">IN PROGRESS</p>
            <p className="text-[#00F260] text-[40px] font-bold">{inProgressCount}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">COMPLETED</p>
            <p className="text-[#0AE87F] text-[40px] font-bold">{completedCount}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">PENDING</p>
            <p className="text-[#FFB800] text-[40px] font-bold">{pendingCount}</p>
          </div>
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 text-center">
            <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">TOTAL MATCHES</p>
            <p className="text-white text-[40px] font-bold">{matches.length}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input type="checkbox" checked={autoStart} onChange={(e) => setAutoStart(e.target.checked)}
              className="w-4 h-4" />
            <label className="text-white font-medium">Auto-start matches when ready</label>
          </div>
          <div className="flex gap-3">
            <button className="bg-[#00F260]/10 text-[#00F260] px-6 py-2 rounded-lg font-bold hover:bg-[#00F260]/20 transition-all">
              Pause All
            </button>
            <button className="bg-red-500/10 text-red-400 px-6 py-2 rounded-lg font-bold hover:bg-red-500/20 transition-all">
              Emergency Stop
            </button>
          </div>
        </div>

        {/* Match Grid */}
        <div className="space-y-4">
          <h2 className="text-white text-[18px] font-bold">Match Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {matches.map((match) => (
              <div key={match.id}
                className={`rounded-2xl p-6 border transition-all ${
                  match.status === 'in-progress'
                    ? 'bg-[#00F260]/5 border-[#00F260]/20'
                    : match.status === 'completed'
                    ? 'bg-[#0A0D12]/50 border-white/[0.06]'
                    : 'bg-[#111827]/40 border-white/[0.06]'
                }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[#8B9DB8] text-[12px] font-medium mb-1">{match.court}</p>
                    <h3 className="text-white font-bold text-[15px]">{match.team1}</h3>
                    <p className="text-white font-bold text-[15px]">vs {match.team2}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[28px] font-bold text-white">
                      {match.score1}-{match.score2}
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold mt-2 ${
                      match.status === 'in-progress' ? 'bg-[#00F260]/10 text-[#00F260]' :
                      match.status === 'completed' ? 'bg-[#0AE87F]/10 text-[#0AE87F]' :
                      'bg-[#FFB800]/10 text-[#FFB800]'
                    }`}>
                      {match.status === 'in-progress' && '⏱ Playing'}
                      {match.status === 'completed' && '✓ Done'}
                      {match.status === 'pending' && '⏳ Pending'}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                {match.status === 'pending' && (
                  <button className="w-full bg-[#00F260] text-black py-2 rounded-lg font-bold text-[13px] hover:bg-[#00D954] transition-all">
                    Start Match
                  </button>
                )}
                {match.status === 'in-progress' && (
                  <button className="w-full bg-[#FFB800] text-black py-2 rounded-lg font-bold text-[13px] hover:bg-[#FFA500] transition-all">
                    Finish Match
                  </button>
                )}
                {match.status === 'completed' && (
                  <button className="w-full bg-white/[0.05] text-[#8B9DB8] py-2 rounded-lg font-bold text-[13px] hover:bg-white/[0.1] transition-all">
                    View Details
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
