'use client';
import { useState } from 'react';

interface Match {
  id: string;
  round: number;
  position: number;
  team1?: string;
  team2?: string;
  score1?: number;
  score2?: number;
  winner?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface BracketData {
  format: string;
  rounds: number;
  matches: Match[];
  teams: string[];
}

export function BracketViewer({ bracket }: { bracket: BracketData }) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scale, setScale] = useState(100);

  const getMatchColor = (match: Match) => {
    switch (match.status) {
      case 'completed':
        return 'bg-[#0AE87F]/10 border-[#0AE87F]/40';
      case 'in_progress':
        return 'bg-[#00F260]/10 border-[#00F260]/40';
      default:
        return 'bg-[#111827]/40 border-white/[0.06]';
    }
  };

  const matchesByRound = bracket.matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  return (
    <div className="space-y-6">
      {/* Zoom Controls */}
      <div className="flex items-center gap-4 bg-[#111827]/40 border border-white/[0.06] rounded-xl p-4 w-fit">
        <button onClick={() => setScale(Math.max(50, scale - 10))}
          className="text-[#8B9DB8] hover:text-white transition-all">
          −
        </button>
        <span className="text-[#B8C4D4] text-[14px] font-medium w-12 text-center">{scale}%</span>
        <button onClick={() => setScale(Math.min(150, scale + 10))}
          className="text-[#8B9DB8] hover:text-white transition-all">
          +
        </button>
      </div>

      {/* Bracket Visualization */}
      <div className="overflow-x-auto bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8 min-h-[600px]"
        style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top left' }}>
        <div className="flex gap-12">
          {Array.from({ length: bracket.rounds }).map((_, roundIdx) => (
            <div key={roundIdx} className="flex flex-col justify-center gap-4 min-w-[250px]">
              <h3 className="text-[#8B9DB8] text-[12px] font-bold mb-4 uppercase">
                {roundIdx === 0 ? 'Round 1' : roundIdx === bracket.rounds - 1 ? 'Finals' : `Round ${roundIdx + 1}`}
              </h3>

              {(matchesByRound[roundIdx] || []).map((match) => (
                <div key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${getMatchColor(match)}`}>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-[13px] ${
                      match.winner === match.team1 ? 'text-[#00F260] font-bold' : 'text-[#B8C4D4]'
                    }`}>
                      <span>{match.team1 || '(TBD)'}</span>
                      {match.score1 !== undefined && (
                        <span className="font-bold ml-auto">{match.score1}</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 text-[13px] ${
                      match.winner === match.team2 ? 'text-[#00F260] font-bold' : 'text-[#B8C4D4]'
                    }`}>
                      <span>{match.team2 || '(TBD)'}</span>
                      {match.score2 !== undefined && (
                        <span className="font-bold ml-auto">{match.score2}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMatch(null)}>
          <div className="bg-[#0C0F14] border border-white/[0.06] rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white text-[24px] font-bold mb-4">Match Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">Status</p>
                <p className="text-white font-bold capitalize">{selectedMatch.status.replace('_', ' ')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">Team 1</p>
                  <p className="text-white">{selectedMatch.team1 || '(TBD)'}</p>
                </div>
                <div>
                  <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">Team 2</p>
                  <p className="text-white">{selectedMatch.team2 || '(TBD)'}</p>
                </div>
              </div>
              {selectedMatch.score1 !== undefined && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">Score 1</p>
                    <p className="text-[#00F260] text-[20px] font-bold">{selectedMatch.score1}</p>
                  </div>
                  <div>
                    <p className="text-[#8B9DB8] text-[12px] font-medium mb-2">Score 2</p>
                    <p className="text-[#00F260] text-[20px] font-bold">{selectedMatch.score2}</p>
                  </div>
                </div>
              )}
              <button onClick={() => setSelectedMatch(null)}
                className="w-full bg-[#00F260] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#00D954] transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
