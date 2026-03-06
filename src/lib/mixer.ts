import { Player, Round, Match } from './types';
import { generateId } from './utils';

export function generateMixerRounds(players: Player[], courts: number, numRounds: number = 8): Round[] {
  const ids = players.map(p => p.id);
  if (ids.length < 4) return [];
  const rounds: Round[] = [];
  const partnerHistory = new Map<string, Set<string>>();
  ids.forEach(id => partnerHistory.set(id, new Set()));

  for (let r = 0; r < numRounds; r++) {
    const shuffled = [...ids].sort(() => Math.random() - 0.5);
    // Try to minimize repeat partners
    const sorted = balancePartners(shuffled, partnerHistory);
    const matches: Match[] = [];
    const used = new Set<string>();
    let courtNum = 1;

    for (let i = 0; i + 3 < sorted.length && courtNum <= courts; i += 4) {
      const t1 = [sorted[i], sorted[i + 1]];
      const t2 = [sorted[i + 2], sorted[i + 3]];
      matches.push({
        id: generateId(),
        court: courtNum,
        team1: t1,
        team2: t2,
        score1: null,
        score2: null,
        submittedBy1: null,
        submittedBy2: null,
        confirmed: false,
        winner: null,
      });
      t1.forEach(id => { used.add(id); partnerHistory.get(id)?.add(t1.find(x => x !== id)!); });
      t2.forEach(id => { used.add(id); partnerHistory.get(id)?.add(t2.find(x => x !== id)!); });
      courtNum++;
    }

    const byes = sorted.filter(id => !used.has(id));
    rounds.push({ id: generateId(), number: r + 1, matches, byes });
  }

  return rounds;
}

function balancePartners(ids: string[], history: Map<string, Set<string>>): string[] {
  // Sort by fewest past partners first to give them priority
  return [...ids].sort((a, b) => {
    const aSize = history.get(a)?.size || 0;
    const bSize = history.get(b)?.size || 0;
    return aSize - bSize;
  });
}

export function generateRatingBalancedTeams(players: Player[], courts: number): Match[] {
  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const matches: Match[] = [];
  let courtNum = 1;

  for (let i = 0; i + 3 < sorted.length && courtNum <= courts; i += 4) {
    // Pair #1 with #4, #2 with #3 for balanced teams
    matches.push({
      id: generateId(),
      court: courtNum,
      team1: [sorted[i].id, sorted[i + 3].id],
      team2: [sorted[i + 1].id, sorted[i + 2].id],
      score1: null,
      score2: null,
      submittedBy1: null,
      submittedBy2: null,
      confirmed: false,
      winner: null,
    });
    courtNum++;
  }

  return matches;
}
