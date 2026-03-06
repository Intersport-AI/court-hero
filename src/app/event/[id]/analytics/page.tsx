'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';

interface Player {
  rank: number;
  name: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  winPercent: string;
}

export default function AnalyticsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [tab, setTab] = useState('standings');
  const [standings, setStandings] = useState<Player[]>([]);

  useEffect(() => {
    // Mock standings data
    const mockStandings: Player[] = [
      { rank: 1, name: 'Smith / Jones', wins: 5, losses: 0, pointsFor: 55, pointsAgainst: 28, winPercent: '100%' },
      { rank: 2, name: 'Chen / Lee', wins: 4, losses: 1, pointsFor: 52, pointsAgainst: 35, winPercent: '80%' },
      { rank: 3, name: 'Davis / Brown', wins: 3, losses: 2, pointsFor: 48, pointsAgainst: 42, winPercent: '60%' },
      { rank: 4, name: 'Wilson / Taylor', wins: 2, losses: 3, pointsFor: 44, pointsAgainst: 48, winPercent: '40%' },
      { rank: 5, name: 'Garcia / Martinez', wins: 1, losses: 4, pointsFor: 32, pointsAgainst: 52, winPercent: '20%' },
      { rank: 6, name: 'Anderson / Thomas', wins: 0, losses: 5, pointsFor: 18, pointsAgainst: 60, winPercent: '0%' },
    ];
    setStandings(mockStandings);
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-7xl mx-auto pt-8 px-6 pb-12">
        <h1 className="text-white text-[40px] font-bold mb-8">Analytics & Standings</h1>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/[0.06] mb-8">
          {['standings', 'stats', 'head-to-head'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-4 font-medium transition-all ${
                tab === t
                  ? 'text-[#00F260] border-b-2 border-[#00F260]'
                  : 'text-[#8B9DB8] hover:text-white'
              }`}>
              {t === 'standings' && 'Standings'}
              {t === 'stats' && 'Statistics'}
              {t === 'head-to-head' && 'Head-to-Head'}
            </button>
          ))}
        </div>

        {/* Standings Table */}
        {tab === 'standings' && (
          <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-8 py-6 bg-[#0A0D12]/50 border-b border-white/[0.06] font-bold text-[13px] text-[#8B9DB8]">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Team</div>
              <div className="col-span-2 text-right">Record</div>
              <div className="col-span-2 text-right">PF/PA</div>
              <div className="col-span-3 text-right">Win %</div>
            </div>

            {standings.map((player, idx) => (
              <div key={idx}
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
                    {player.rank}
                  </span>
                </div>
                <div className="col-span-4">
                  <p className="text-white font-bold text-[15px]">{player.name}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-[#00F260] font-bold text-[15px]">{player.wins}–{player.losses}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-[#8B9DB8] text-[15px]">{player.pointsFor}/{player.pointsAgainst}</p>
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-[#FFB800] font-bold">{player.winPercent}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {tab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Total Matches', value: '15', icon: '🏓' },
              { label: 'Avg Points/Match', value: '20.2', icon: '📊' },
              { label: 'Highest Score', value: 'Smith/Jones (11)', icon: '🏆' },
              { label: 'Teams Participated', value: '6', icon: '👥' },
              { label: 'Matches Today', value: '8', icon: '⏱️' },
              { label: 'Average Court Time', value: '28 min', icon: '⏰' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[#8B9DB8] text-[13px] font-medium">{stat.label}</p>
                  <span className="text-[20px]">{stat.icon}</span>
                </div>
                <p className="text-white text-[32px] font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Head-to-Head */}
        {tab === 'head-to-head' && (
          <div className="space-y-4">
            {standings.slice(0, 3).map((team, idx) => (
              <div key={idx} className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">{team.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { vs: standings[(idx + 1) % standings.length]?.name, result: 'Won 11-8' },
                    { vs: standings[(idx + 2) % standings.length]?.name, result: 'Won 11-9' },
                  ].map((match, i) => (
                    <div key={i} className="bg-[#0A0D12]/50 rounded-lg p-3">
                      <p className="text-[#8B9DB8] text-[12px] mb-2">vs {match.vs}</p>
                      <p className="text-[#00F260] font-bold text-[13px]">{match.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
