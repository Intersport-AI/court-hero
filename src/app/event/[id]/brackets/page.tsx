'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';

interface Match {
  id: string;
  round: number;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export default function BracketsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [format, setFormat] = useState('single-elim');
  const [rounds, setRounds] = useState<Match[][]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    // Mock bracket data
    const mockBrackets: Match[][] = [
      [
        { id: '1', round: 1, team1: 'Smith / Jones', team2: 'Chen / Lee', score1: 11, score2: 8, status: 'completed' },
        { id: '2', round: 1, team1: 'Davis / Brown', team2: 'Wilson / Taylor', score1: 11, score2: 9, status: 'completed' },
        { id: '3', round: 1, team1: 'Garcia / Martinez', team2: 'Anderson / Thomas', score1: 0, score2: 0, status: 'pending' },
        { id: '4', round: 1, team1: 'Jackson / White', team2: 'Harris / Martin', score1: 0, score2: 0, status: 'pending' },
      ],
      [
        { id: '5', round: 2, team1: 'Smith / Jones', team2: 'Davis / Brown', score1: 9, score2: 11, status: 'in-progress' },
        { id: '6', round: 2, team1: 'TBD', team2: 'TBD', score1: 0, score2: 0, status: 'pending' },
      ],
      [
        { id: '7', round: 3, team1: 'TBD', team2: 'TBD', score1: 0, score2: 0, status: 'pending' },
      ],
    ];
    setRounds(mockBrackets);
  }, [format]);

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-7xl mx-auto pt-8 px-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-[40px] font-bold">Tournament Bracket</h1>
          <select value={format} onChange={(e) => setFormat(e.target.value)}
            className="bg-[#111827] border border-white/[0.08] text-white px-4 py-2 rounded-lg outline-none">
            <option value="single-elim">Single Elimination</option>
            <option value="double-elim">Double Elimination</option>
            <option value="round-robin">Round Robin</option>
          </select>
        </div>

        <div className="overflow-x-auto pb-6">
          <div className="inline-flex gap-8 min-w-full">
            {rounds.map((round, roundIdx) => (
              <div key={roundIdx} className="flex-shrink-0">
                <h2 className="text-white text-[13px] font-bold mb-4 text-center">
                  {roundIdx === 0 ? 'Round 1' : roundIdx === rounds.length - 1 ? 'Finals' : `Round ${roundIdx + 1}`}
                </h2>

                <div className="space-y-6" style={{ minHeight: `${Math.pow(2, roundIdx) * 120}px` }}>
                  {round.map((match, matchIdx) => (
                    <button
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className={`w-64 p-4 rounded-xl border transition-all text-left ${
                        selectedMatch?.id === match.id
                          ? 'bg-[#00F260]/10 border-[#00F260]/30'
                          : 'bg-[#111827]/40 border-white/[0.06] hover:border-white/[0.1]'
                      }`}>
                      {/* Team 1 */}
                      <div className={`pb-2 mb-2 border-b border-white/[0.06] ${
                        match.score1 > match.score2 ? 'text-[#00F260]' : 'text-[#B8C4D4]'
                      }`}>
                        <p className="text-[13px] font-bold truncate">{match.team1}</p>
                        <p className="text-[16px] font-bold">{match.score1}</p>
                      </div>

                      {/* Team 2 */}
                      <div className={match.score2 > match.score1 ? 'text-[#00F260]' : 'text-[#B8C4D4]'}>
                        <p className="text-[13px] font-bold truncate">{match.team2}</p>
                        <p className="text-[16px] font-bold">{match.score2}</p>
                      </div>

                      {/* Status */}
                      <div className="mt-3 pt-3 border-t border-white/[0.06] text-[11px]">
                        {match.status === 'completed' && <span className="text-[#00F260]">✓ Completed</span>}
                        {match.status === 'in-progress' && <span className="text-[#FFB800]">⏱ In Progress</span>}
                        {match.status === 'pending' && <span className="text-[#8B9DB8]">⏳ Pending</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Match Detail */}
        {selectedMatch && (
          <div className="mt-12 bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8">
            <h2 className="text-white text-[20px] font-bold mb-6">Match Details</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-[#8B9DB8] text-[13px] mb-2">Team 1</p>
                <p className="text-white text-[18px] font-bold">{selectedMatch.team1}</p>
                <p className="text-[#00F260] text-[32px] font-bold mt-4">{selectedMatch.score1}</p>
              </div>
              <div>
                <p className="text-[#8B9DB8] text-[13px] mb-2">Team 2</p>
                <p className="text-white text-[18px] font-bold">{selectedMatch.team2}</p>
                <p className="text-[#FFB800] text-[32px] font-bold mt-4">{selectedMatch.score2}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <p className="text-[#8B9DB8] text-[13px] mb-2">Status</p>
              <p className="text-white font-bold">{selectedMatch.status.charAt(0).toUpperCase() + selectedMatch.status.slice(1)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
