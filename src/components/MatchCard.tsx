'use client';
import { Match, Player } from '@/lib/types';

interface MatchCardProps {
  match: Match;
  players: Player[];
  currentPlayerId?: string;
  onScoreClick?: () => void;
}

function getPlayerName(id: string, players: Player[]): string {
  return players.find(p => p.id === id)?.name ?? 'Unknown';
}

export default function MatchCard({ match, players, currentPlayerId, onScoreClick }: MatchCardProps) {
  const isMyMatch = currentPlayerId && (match.team1.includes(currentPlayerId) || match.team2.includes(currentPlayerId));
  const needsScore = !match.confirmed && isMyMatch;

  return (
    <div className={`rounded-xl p-4 border ${
      isMyMatch ? 'border-[#00F260]/50 bg-[#00F260]/5' : 'border-[#1E293B] bg-[#111827]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#94A3B8] uppercase">Court {match.court}</span>
        {match.confirmed && <span className="text-xs text-[#00F260]">✓ Final</span>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{match.team1.map(id => getPlayerName(id, players)).join(' & ')}</p>
        </div>
        <div className="px-3 text-center">
          {match.score1 !== null && match.score2 !== null ? (
            <span className="text-lg font-bold text-white tabular-nums">{match.score1} - {match.score2}</span>
          ) : (
            <span className="text-sm text-[#64748B]">vs</span>
          )}
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm font-semibold text-white">{match.team2.map(id => getPlayerName(id, players)).join(' & ')}</p>
        </div>
      </div>

      {needsScore && onScoreClick && (
        <button
          onClick={onScoreClick}
          className="mt-3 w-full bg-[#00F260] text-black py-2 rounded-lg font-bold text-sm hover:bg-[#00D954] transition active:scale-[0.98]"
        >
          Submit Score
        </button>
      )}
    </div>
  );
}
