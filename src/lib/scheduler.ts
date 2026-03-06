import { Player, Round, Match } from './types';
import { generateId } from './utils';

export function generateRoundRobin(players: Player[], courts: number): Round[] {
  const ids = players.map((p) => p.id);
  const n = ids.length;
  if (n < 2) return [];

  // Add bye player if odd
  const list = [...ids];
  if (list.length % 2 !== 0) list.push('BYE');
  const total = list.length;
  const numRounds = total - 1;
  const rounds: Round[] = [];

  // Circle method for round robin
  const fixed = list[0];
  const rotating = list.slice(1);

  for (let r = 0; r < numRounds; r++) {
    const current = [fixed, ...rotating];
    const matches: Match[] = [];
    const byes: string[] = [];
    let courtNum = 1;

    for (let i = 0; i < total / 2; i++) {
      const p1 = current[i];
      const p2 = current[total - 1 - i];

      if (p1 === 'BYE') { byes.push(p2); continue; }
      if (p2 === 'BYE') { byes.push(p1); continue; }

      if (courtNum <= courts) {
        matches.push({
          id: generateId(),
          court: courtNum,
          team1: [p1],
          team2: [p2],
          score1: null,
          score2: null,
          submittedBy1: null,
          submittedBy2: null,
          confirmed: false,
          winner: null,
        });
        courtNum++;
      }
    }

    rounds.push({ id: generateId(), number: r + 1, matches, byes });

    // Rotate
    const last = rotating.pop()!;
    rotating.unshift(last);
  }

  return rounds;
}

export function generateRoundRobinDoubles(players: Player[], courts: number): Round[] {
  // Simple doubles: pair players sequentially, rotate
  const ids = players.map((p) => p.id);
  if (ids.length < 4) return [];

  const rounds: Round[] = [];
  const shuffled = [...ids];
  const numRounds = Math.min(ids.length - 1, 10);

  for (let r = 0; r < numRounds; r++) {
    const matches: Match[] = [];
    const used = new Set<string>();
    let courtNum = 1;

    for (let i = 0; i < shuffled.length - 3 && courtNum <= courts; i += 4) {
      matches.push({
        id: generateId(),
        court: courtNum,
        team1: [shuffled[i], shuffled[i + 1]],
        team2: [shuffled[i + 2], shuffled[i + 3]],
        score1: null,
        score2: null,
        submittedBy1: null,
        submittedBy2: null,
        confirmed: false,
        winner: null,
      });
      [shuffled[i], shuffled[i+1], shuffled[i+2], shuffled[i+3]].forEach(id => used.add(id));
      courtNum++;
    }

    const byes = shuffled.filter((id) => !used.has(id));
    rounds.push({ id: generateId(), number: r + 1, matches, byes });

    // Rotate all but first
    const last = shuffled.pop()!;
    shuffled.splice(1, 0, last);
  }

  return rounds;
}
