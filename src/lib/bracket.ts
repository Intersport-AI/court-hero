import { Player, Round, Match } from './types';
import { generateId } from './utils';

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function generateSeeds(size: number): number[] {
  if (size === 1) return [0];
  const half = generateSeeds(size / 2);
  return half.flatMap((s) => [s, size - 1 - s]);
}

export function generateSingleElim(players: Player[]): Round[] {
  const n = players.length;
  if (n < 2) return [];

  const size = nextPowerOf2(n);
  const seeds = generateSeeds(size);
  const sorted = [...players].sort((a, b) => b.rating - a.rating);

  // First round with byes
  const rounds: Round[] = [];
  const firstRoundMatches: Match[] = [];
  const byes: string[] = [];
  let court = 1;

  for (let i = 0; i < size; i += 2) {
    const s1 = seeds[i];
    const s2 = seeds[i + 1];
    const p1 = s1 < n ? sorted[s1] : null;
    const p2 = s2 < n ? sorted[s2] : null;

    if (!p1 && !p2) continue;
    if (!p2) {
      byes.push(p1!.id);
      continue;
    }
    if (!p1) {
      byes.push(p2.id);
      continue;
    }

    firstRoundMatches.push({
      id: generateId(),
      court: court++,
      team1: [p1.id],
      team2: [p2.id],
      score1: null,
      score2: null,
      submittedBy1: null,
      submittedBy2: null,
      confirmed: false,
      winner: null,
    });
  }

  rounds.push({ id: generateId(), number: 1, matches: firstRoundMatches, byes });

  // Placeholder rounds
  let matchesInRound = Math.ceil((firstRoundMatches.length + byes.length) / 2);
  let roundNum = 2;
  while (matchesInRound >= 1) {
    const matches: Match[] = [];
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: generateId(),
        court: i + 1,
        team1: [],
        team2: [],
        score1: null,
        score2: null,
        submittedBy1: null,
        submittedBy2: null,
        confirmed: false,
        winner: null,
      });
    }
    rounds.push({ id: generateId(), number: roundNum++, matches, byes: [] });
    if (matchesInRound === 1) break;
    matchesInRound = Math.ceil(matchesInRound / 2);
  }

  return rounds;
}

export function generateDoubleElim(players: Player[]): Round[] {
  // Start with single elim winners bracket, losers bracket generated as matches complete
  const winnersRounds = generateSingleElim(players);
  // Mark as double elim by adding extra placeholder rounds for losers bracket
  const totalRounds = winnersRounds.length * 2 + 1;
  const rounds = [...winnersRounds];

  for (let i = winnersRounds.length + 1; i <= totalRounds; i++) {
    rounds.push({ id: generateId(), number: i, matches: [], byes: [] });
  }

  return rounds;
}
