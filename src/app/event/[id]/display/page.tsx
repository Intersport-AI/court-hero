'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function CourtDisplayPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeMatches, setActiveMatches] = useState([
    { court: 'Court 1', team1: 'Smith / Jones', team2: 'Chen / Lee', score1: 9, score2: 7, status: 'in-progress' },
    { court: 'Court 2', team1: 'Davis / Brown', team2: 'Wilson / Taylor', score1: 5, score2: 11, status: 'in-progress' },
    { court: 'Court 3', team1: 'Garcia / Martinez', team2: 'Anderson / Thomas', score1: 0, score2: 0, status: 'pending' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0C0F14] flex flex-col">
      {/* Header - Minimal */}
      <div className="bg-[#111827] border-b-2 border-[#00F260] px-12 py-8 flex items-center justify-between">
        <h1 className="text-[#00F260] text-[48px] font-bold">🏓 COURT HERO LIVE</h1>
        <div className="text-right">
          <p className="text-white text-[32px] font-bold">{currentTime.toLocaleTimeString()}</p>
          <p className="text-[#8B9DB8]">Summer Championship 2026</p>
        </div>
      </div>

      {/* Main Content - Full Size Match Display */}
      <div className="flex-1 p-12 overflow-auto">
        {activeMatches.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#8B9DB8] text-[48px]">No Active Matches</p>
              <p className="text-[#64748B] text-[24px] mt-4">Waiting for next match...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {activeMatches.map((match, idx) => (
              <div key={idx} className={`rounded-3xl p-8 border-4 ${
                match.status === 'in-progress'
                  ? 'bg-gradient-to-br from-[#00F260]/10 to-transparent border-[#00F260]'
                  : 'bg-[#111827]/40 border-white/[0.06]'
              }`}>
                {/* Court Name */}
                <p className="text-[#8B9DB8] text-[20px] font-bold text-center mb-6">{match.court}</p>

                {/* Teams */}
                <div className="space-y-8 mb-12">
                  {/* Team 1 */}
                  <div>
                    <p className="text-white text-[32px] font-bold text-center mb-3">{match.team1}</p>
                    <div className="bg-[#0A0D12] rounded-2xl px-6 py-8 border border-white/[0.08]">
                      <p className="text-[#00F260] text-[96px] font-bold text-center">{match.score1}</p>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <p className="text-[#8B9DB8] text-[24px] font-bold">VS</p>
                  </div>

                  {/* Team 2 */}
                  <div>
                    <p className="text-white text-[32px] font-bold text-center mb-3">{match.team2}</p>
                    <div className="bg-[#0A0D12] rounded-2xl px-6 py-8 border border-white/[0.08]">
                      <p className="text-[#FFB800] text-[96px] font-bold text-center">{match.score2}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="text-center">
                  {match.status === 'in-progress' && (
                    <div>
                      <span className="inline-block w-4 h-4 rounded-full bg-[#00F260] animate-pulse mr-2"></span>
                      <span className="text-[#00F260] text-[20px] font-bold">LIVE</span>
                    </div>
                  )}
                  {match.status === 'pending' && (
                    <p className="text-[#FFB800] text-[20px] font-bold">⏳ PENDING</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Ticker */}
      <div className="bg-[#111827] border-t-2 border-[#00F260] px-12 py-6">
        <div className="overflow-x-auto">
          <p className="text-[#00F260] text-[18px] font-bold whitespace-nowrap inline-block animate-scroll">
            🏓 Next Match: Garcia / Martinez vs Anderson / Thomas at 2:30 PM on Court 3 • Check-in ends at 2:25 PM
          </p>
        </div>
      </div>
    </div>
  );
}
