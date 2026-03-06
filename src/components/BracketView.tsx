'use client';
import { Round, Match, Player } from '@/lib/types';

interface BracketViewProps {
  rounds: Round[];
  players: Player[];
}

function getPlayerName(id: string, players: Player[]): string {
  return players.find(p => p.id === id)?.name ?? 'TBD';
}

function teamLabel(ids: string[], players: Player[]): string {
  return ids.map(id => getPlayerName(id, players)).join(' & ');
}

export default function BracketView({ rounds, players }: BracketViewProps) {
  if (rounds.length === 0) return <p className="text-[#94A3B8] text-sm">No bracket generated yet.</p>;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {rounds.map((round, ri) => (
          <div key={ri} className="flex flex-col gap-4 min-w-[220px]">
            <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider text-center">
              {ri === rounds.length - 1 ? 'Final' : ri === rounds.length - 2 ? 'Semifinal' : `Round ${round.number}`}
            </h4>
            <div className="flex flex-col justify-around flex-1 gap-4" style={{ paddingTop: `${ri * 28}px` }}>
              {round.matches.map((match) => (
                <BracketMatch key={match.id} match={match} players={players} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketMatch({ match, players }: { match: Match; players: Player[] }) {
  const t1Won = match.winner && match.team1.every(id => match.winner!.includes(id));
  const t2Won = match.winner && match.team2.every(id => match.winner!.includes(id));

  return (
    <div className="border border-[#1E293B] rounded-lg overflow-hidden bg-[#111827]">
      <div className={`flex items-center justify-between px-3 py-2 border-b border-[#1E293B] ${t1Won ? 'bg-[#00F260]/10' : ''}`}>
        <span className={`text-xs font-semibold truncate max-w-[150px] ${t1Won ? 'text-[#00F260]' : 'text-white'}`}>
          {match.team1.length > 0 ? teamLabel(match.team1, players) : 'TBD'}
        </span>
        <span className={`text-sm font-bold tabular-nums ${t1Won ? 'text-[#00F260]' : 'text-white'}`}>
          {match.score1 !== null ? match.score1 : '-'}
        </span>
      </div>
      <div className={`flex items-center justify-between px-3 py-2 ${t2Won ? 'bg-[#00F260]/10' : ''}`}>
        <span className={`text-xs font-semibold truncate max-w-[150px] ${t2Won ? 'text-[#00F260]' : 'text-white'}`}>
          {match.team2.length > 0 ? teamLabel(match.team2, players) : 'TBD'}
        </span>
        <span className={`text-sm font-bold tabular-nums ${t2Won ? 'text-[#00F260]' : 'text-white'}`}>
          {match.score2 !== null ? match.score2 : '-'}
        </span>
      </div>
    </div>
  );
}
