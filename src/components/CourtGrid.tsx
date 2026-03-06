'use client';
import { Match, Player } from '@/lib/types';

interface CourtGridProps {
  matches: Match[];
  players: Player[];
  currentPlayerId?: string;
}

function getPlayerName(id: string, players: Player[]): string {
  return players.find(p => p.id === id)?.name ?? 'Unknown';
}

function teamNames(ids: string[], players: Player[]): string {
  return ids.map(id => getPlayerName(id, players)).join(' & ');
}

export default function CourtGrid({ matches, players, currentPlayerId }: CourtGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {matches.map(match => {
        const isMyMatch = currentPlayerId && (match.team1.includes(currentPlayerId) || match.team2.includes(currentPlayerId));
        const isComplete = match.confirmed;

        return (
          <div
            key={match.id}
            className={`rounded-xl p-4 border transition-all ${
              isMyMatch ? 'border-[#00F260]/50 bg-[#00F260]/5' :
              isComplete ? 'border-[#1E293B] bg-[#111827]/50' :
              'border-[#1E293B] bg-[#111827]'
            }`}
          >
            {/* Court label */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Court {match.court}</span>
              {isComplete ? (
                <span className="text-xs bg-[#00F260]/15 text-[#00F260] px-2 py-0.5 rounded-full font-semibold">Complete</span>
              ) : (
                <span className="text-xs bg-[#FFB800]/15 text-[#FFB800] px-2 py-0.5 rounded-full font-semibold">Live</span>
              )}
            </div>

            {/* Matchup */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${match.winner && match.team1.every(id => match.winner!.includes(id)) ? 'text-[#00F260]' : 'text-white'}`}>
                  {teamNames(match.team1, players)}
                </span>
                {match.score1 !== null && (
                  <span className="text-lg font-bold text-white tabular-nums">{match.score1}</span>
                )}
              </div>
              <div className="text-center text-[#64748B] text-xs">vs</div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${match.winner && match.team2.every(id => match.winner!.includes(id)) ? 'text-[#00F260]' : 'text-white'}`}>
                  {teamNames(match.team2, players)}
                </span>
                {match.score2 !== null && (
                  <span className="text-lg font-bold text-white tabular-nums">{match.score2}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
