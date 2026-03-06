import { Player, Match } from './types';

export function validateScore(
  score1: number,
  score2: number,
  gameTo: number,
  winBy2: boolean
): { valid: boolean; error?: string } {
  if (score1 < 0 || score2 < 0) return { valid: false, error: 'Scores cannot be negative' };
  if (!Number.isInteger(score1) || !Number.isInteger(score2)) return { valid: false, error: 'Scores must be whole numbers' };
  if (score1 === score2) return { valid: false, error: 'Scores cannot be tied' };

  const high = Math.max(score1, score2);
  const low = Math.min(score1, score2);

  if (winBy2) {
    if (high < gameTo) return { valid: false, error: `Winner must reach at least ${gameTo}` };
    if (high === gameTo && low > gameTo - 2) return { valid: false, error: `Must win by 2` };
    if (high > gameTo && high - low !== 2) return { valid: false, error: `Must win by exactly 2 past ${gameTo}` };
  } else {
    if (high !== gameTo) return { valid: false, error: `Winner score must be exactly ${gameTo}` };
    if (low >= gameTo) return { valid: false, error: `Loser score must be less than ${gameTo}` };
  }

  return { valid: true };
}

export interface StandingsEntry {
  playerId: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  headToHead: Map<string, number>;
}

export function calculateStandings(players: Player[], matches: Match[]): StandingsEntry[] {
  const map = new Map<string, StandingsEntry>();
  players.forEach(p => {
    map.set(p.id, {
      playerId: p.id,
      wins: 0, losses: 0,
      pointsFor: 0, pointsAgainst: 0, pointDiff: 0,
      headToHead: new Map(),
    });
  });

  matches.filter(m => m.confirmed).forEach(m => {
    const isTeam1Winner = m.winner && m.team1.every(id => m.winner!.includes(id));
    const winners = isTeam1Winner ? m.team1 : m.team2;
    const losers = isTeam1Winner ? m.team2 : m.team1;
    const wScore = isTeam1Winner ? m.score1! : m.score2!;
    const lScore = isTeam1Winner ? m.score2! : m.score1!;

    winners.forEach(wId => {
      const entry = map.get(wId);
      if (entry) {
        entry.wins++;
        entry.pointsFor += wScore;
        entry.pointsAgainst += lScore;
        entry.pointDiff = entry.pointsFor - entry.pointsAgainst;
        losers.forEach(lId => entry.headToHead.set(lId, (entry.headToHead.get(lId) || 0) + 1));
      }
    });

    losers.forEach(lId => {
      const entry = map.get(lId);
      if (entry) {
        entry.losses++;
        entry.pointsFor += lScore;
        entry.pointsAgainst += wScore;
        entry.pointDiff = entry.pointsFor - entry.pointsAgainst;
        winners.forEach(wId => entry.headToHead.set(wId, (entry.headToHead.get(wId) || 0) - 1));
      }
    });
  });

  const standings = Array.from(map.values());
  standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const h2h = a.headToHead.get(b.playerId);
    if (h2h !== undefined && h2h !== 0) return h2h > 0 ? -1 : 1;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    return b.pointsFor - a.pointsFor;
  });

  return standings;
}
