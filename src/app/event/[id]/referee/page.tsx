'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';

interface Match {
  id: string;
  team1: string;
  team2: string;
  court: string;
  status: 'pending' | 'in-progress' | 'completed';
  team1_score: number;
  team2_score: number;
}

export default function RefereePage() {
  const params = useParams();
  const eventId = params.id as string;
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  useEffect(() => {
    // Mock matches
    const mock: Match[] = [
      { id: '1', team1: 'Smith / Jones', team2: 'Chen / Lee', court: 'Court 1', status: 'in-progress', team1_score: 7, team2_score: 5 },
      { id: '2', team1: 'Davis / Brown', team2: 'Wilson / Taylor', court: 'Court 2', status: 'pending', team1_score: 0, team2_score: 0 },
      { id: '3', team1: 'Garcia / Martinez', team2: 'Anderson / Thomas', court: 'Court 3', status: 'pending', team1_score: 0, team2_score: 0 },
    ];
    setMatches(mock);
    setSelectedMatch(mock[0]);
  }, [eventId]);

  const updateScore = (team: 1 | 2, delta: number) => {
    if (!selectedMatch) return;
    const updated = { ...selectedMatch };
    if (team === 1) updated.team1_score = Math.max(0, updated.team1_score + delta);
    else updated.team2_score = Math.max(0, updated.team2_score + delta);

    setMatches(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMatch(updated);

    // Queue for offline support
    setOfflineQueue(prev => [...prev, { matchId: updated.id, score: updated, timestamp: new Date() }]);
  };

  return (
    <div className="min-h-screen bg-[#0C0F14] flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="bg-[#111827]/60 border-b border-white/[0.06] px-4 py-4 sticky top-0 z-10">
          <h1 className="text-white text-[20px] font-bold">Referee Mode</h1>
          <p className="text-[#8B9DB8] text-[12px] mt-1">{selectedMatch?.court}</p>
        </div>

        {/* Score Entry (Full Screen) */}
        {selectedMatch && (
          <div className="flex-1 flex flex-col p-4 justify-between">
            {/* Match Header */}
            <div className="text-center mb-8">
              <p className="text-[#8B9DB8] text-[13px] font-medium mb-2">MATCH IN PROGRESS</p>
              <p className="text-white text-[18px] font-bold">{selectedMatch.team1}</p>
              <p className="text-[#8B9DB8] text-[13px] mt-1">vs</p>
              <p className="text-white text-[18px] font-bold">{selectedMatch.team2}</p>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-3 gap-2 mb-12">
              {/* Team 1 */}
              <div>
                <p className="text-[#8B9DB8] text-[11px] text-center mb-2 font-medium">TEAM 1</p>
                <div className="bg-[#0A0D12] rounded-2xl p-6 border border-white/[0.08]">
                  <p className="text-[#00F260] text-[56px] font-bold text-center">{selectedMatch.team1_score}</p>
                </div>
              </div>

              <div className="flex items-end justify-center mb-4">
                <p className="text-[#8B9DB8] font-bold text-[18px]">VS</p>
              </div>

              <div>
                <p className="text-[#8B9DB8] text-[11px] text-center mb-2 font-medium">TEAM 2</p>
                <div className="bg-[#0A0D12] rounded-2xl p-6 border border-white/[0.08]">
                  <p className="text-[#FFB800] text-[56px] font-bold text-center">{selectedMatch.team2_score}</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Team 1 Controls */}
              <div className="flex gap-3">
                <button onClick={() => updateScore(1, -1)}
                  className="flex-1 bg-red-500/10 text-red-400 py-6 rounded-2xl font-bold text-[18px] hover:bg-red-500/20 transition-all active:scale-95">
                  − 1
                </button>
                <button onClick={() => updateScore(1, 1)}
                  className="flex-1 bg-[#00F260]/10 text-[#00F260] py-6 rounded-2xl font-bold text-[18px] hover:bg-[#00F260]/20 transition-all active:scale-95">
                  + 1
                </button>
              </div>

              {/* Team 2 Controls */}
              <div className="flex gap-3">
                <button onClick={() => updateScore(2, -1)}
                  className="flex-1 bg-red-500/10 text-red-400 py-6 rounded-2xl font-bold text-[18px] hover:bg-red-500/20 transition-all active:scale-95">
                  − 1
                </button>
                <button onClick={() => updateScore(2, 1)}
                  className="flex-1 bg-[#FFB800]/10 text-[#FFB800] py-6 rounded-2xl font-bold text-[18px] hover:bg-[#FFB800]/20 transition-all active:scale-95">
                  + 1
                </button>
              </div>

              {/* End Match */}
              <button className="w-full bg-[#00F260] text-black py-6 rounded-2xl font-bold text-[18px] hover:bg-[#00D954] transition-all active:scale-95">
                End Match
              </button>
            </div>

            {/* Offline Indicator */}
            {offlineQueue.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-[#FFB800] text-[12px]">📡 {offlineQueue.length} update(s) queued for sync</p>
              </div>
            )}
          </div>
        )}

        {/* Match List (Collapse/Expand) */}
        <div className="bg-[#111827]/60 border-t border-white/[0.06] px-4 py-4 max-h-32 overflow-y-auto">
          <p className="text-[#8B9DB8] text-[11px] font-bold mb-3">OTHER MATCHES</p>
          <div className="space-y-2">
            {matches.filter(m => m.id !== selectedMatch?.id).map((match) => (
              <button key={match.id} onClick={() => setSelectedMatch(match)}
                className="w-full text-left p-3 bg-[#0A0D12]/50 rounded-lg hover:bg-[#0A0D12] transition-all">
                <p className="text-white text-[12px] font-bold">{match.court}</p>
                <p className="text-[#8B9DB8] text-[11px]">{match.team1.substring(0, 15)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
