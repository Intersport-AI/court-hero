import { Player, Match, Round } from './types';
import { generateId } from './utils';

export interface KingQueue {
  queue: string[];      // player IDs waiting to play
  onCourt: string[];    // player IDs currently on court
  champion: string | null;
}

export function initKingQueue(players: Player[]): KingQueue {
  const ids = players.map(p => p.id);
  // Shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return { queue: ids, onCourt: [], champion: null };
}

export function nextKingMatch(kq: KingQueue, court: number): { match: Match; queue: KingQueue } | null {
  const q = [...kq.queue];
  if (kq.champion) {
    if (q.length === 0) return null;
    const challenger = q.shift()!;
    const match: Match = {
      id: generateId(),
      court,
      team1: [kq.champion],
      team2: [challenger],
      score1: null,
      score2: null,
      submittedBy1: null,
      submittedBy2: null,
      confirmed: false,
      winner: null,
    };
    return { match, queue: { ...kq, queue: q, onCourt: [kq.champion, challenger] } };
  }
  // No champion yet — first two play
  if (q.length < 2) return null;
  const p1 = q.shift()!;
  const p2 = q.shift()!;
  const match: Match = {
    id: generateId(),
    court,
    team1: [p1],
    team2: [p2],
    score1: null,
    score2: null,
    submittedBy1: null,
    submittedBy2: null,
    confirmed: false,
    winner: null,
  };
  return { match, queue: { ...kq, queue: q, onCourt: [p1, p2] } };
}

export function resolveKingMatch(kq: KingQueue, winnerId: string, loserId: string): KingQueue {
  return {
    queue: [...kq.queue, loserId],
    onCourt: [],
    champion: winnerId,
  };
}
