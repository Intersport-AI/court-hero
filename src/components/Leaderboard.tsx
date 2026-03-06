'use client';
import { Player, Match } from '@/lib/types';
import { calculateStandings } from '@/lib/scoring';

interface LeaderboardProps {
  players: Player[];
  matches: Match[];
  currentPlayerId?: string;
}

export default function Leaderboard({ players, matches, currentPlayerId }: LeaderboardProps) {
  const standings = calculateStandings(players, matches);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-[0.12em]">Leaderboard</h3>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
      <div className="space-y-2">
        {standings.map((entry, i) => {
          const player = players.find(p => p.id === entry.playerId);
          if (!player) return null;
          const isFirst = i === 0;
          const isCurrent = player.id === currentPlayerId;

          return (
            <div
              key={player.id}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                isFirst ? 'bg-[#FFB800]/[0.06] border border-[#FFB800]/20' :
                isCurrent ? 'bg-[#00F260]/[0.06] border border-[#00F260]/20' :
                'bg-[#111827]/70 border border-white/[0.06]'
              }`}
            >
              {/* Rank */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-extrabold shrink-0 ${
                isFirst ? 'bg-[#FFB800] text-black' :
                i === 1 ? 'bg-[#94A3B8] text-black' :
                i === 2 ? 'bg-[#CD7F32] text-black' :
                'bg-white/[0.06] text-[#94A3B8]'
              }`}>
                {i + 1}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`text-[15px] font-bold truncate ${isFirst ? 'text-[#FFB800]' : 'text-white'}`}>
                  {player.name}
                </p>
                <p className="text-[12px] text-[#64748B] mt-0.5">{player.rating.toFixed(1)}</p>
              </div>

              {/* Record */}
              <div className="text-right shrink-0">
                <p className="text-[16px] font-extrabold text-white tabular-nums">{entry.wins}-{entry.losses}</p>
                <p className={`text-[12px] tabular-nums font-semibold mt-0.5 ${
                  entry.pointDiff > 0 ? 'text-[#00F260]' : entry.pointDiff < 0 ? 'text-red-400' : 'text-[#64748B]'
                }`}>
                  {entry.pointDiff > 0 ? '+' : ''}{entry.pointDiff} pts
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
