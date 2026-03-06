import { v4 as uuid } from 'uuid';

export interface BracketMatch {
  id: string;
  team1_player_ids: string[];
  team2_player_ids: string[];
  scheduled_time?: string;
  court_id?: string;
  winner_player_ids?: string[];
}

export interface BracketRound {
  id: string;
  round_number: number;
  matches: BracketMatch[];
}

export interface BracketStructure {
  bracket_id: string;
  bracket_type: string;
  rounds: BracketRound[];
  seeding: Record<string, number>;
}

/**
 * Single Elimination bracket
 * Losers are eliminated immediately
 */
export function generateSingleElimination(playerIds: string[]): BracketStructure {
  const sorted = [...playerIds].sort();
  const bracketId = uuid();
  const rounds: BracketRound[] = [];

  // Calculate number of rounds needed
  const roundsNeeded = Math.ceil(Math.log2(sorted.length));

  // Build seeding (1v16, 8v9, etc.)
  const seeding: Record<string, number> = {};
  sorted.forEach((id, idx) => {
    seeding[id] = idx + 1;
  });

  // Create matches for round 1
  const round1Matches: BracketMatch[] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    const match: BracketMatch = {
      id: uuid(),
      team1_player_ids: [sorted[i]],
      team2_player_ids: sorted[i + 1] ? [sorted[i + 1]] : [],
    };
    round1Matches.push(match);
  }

  rounds.push({
    id: uuid(),
    round_number: 1,
    matches: round1Matches,
  });

  // Rounds 2+ are generated dynamically after matches are completed
  // (winners advance to next round)

  return {
    bracket_id: bracketId,
    bracket_type: 'single-elim',
    rounds,
    seeding,
  };
}

/**
 * Round Robin bracket
 * Everyone plays everyone else once
 */
export function generateRoundRobin(playerIds: string[]): BracketStructure {
  const sorted = [...playerIds].sort();
  const bracketId = uuid();
  const rounds: BracketRound[] = [];

  const seeding: Record<string, number> = {};
  sorted.forEach((id, idx) => {
    seeding[id] = idx + 1;
  });

  // Create pairings for each round
  const numPlayers = sorted.length;
  const numRounds = numPlayers - 1;
  const isBye = numPlayers % 2 === 1;

  for (let round = 0; round < numRounds; round++) {
    const roundMatches: BracketMatch[] = [];

    for (let i = 0; i < numPlayers / 2; i++) {
      const idx1 = (round + i) % numPlayers;
      const idx2 = (round + numPlayers - i - 1) % numPlayers;

      if (idx1 !== idx2) {
        roundMatches.push({
          id: uuid(),
          team1_player_ids: [sorted[idx1]],
          team2_player_ids: [sorted[idx2]],
        });
      }
    }

    rounds.push({
      id: uuid(),
      round_number: round + 1,
      matches: roundMatches,
    });
  }

  return {
    bracket_id: bracketId,
    bracket_type: 'round-robin',
    rounds,
    seeding,
  };
}

/**
 * Pool Play bracket
 * Players divided into pools, round-robin within each pool
 * Winners then advance to bracket
 */
export function generatePoolPlay(
  playerIds: string[],
  poolsCount: number = 4
): BracketStructure {
  const sorted = [...playerIds].sort();
  const bracketId = uuid();
  const rounds: BracketRound[] = [];

  const seeding: Record<string, number> = {};
  sorted.forEach((id, idx) => {
    seeding[id] = idx + 1;
  });

  // Distribute players into pools
  const playersPerPool = Math.ceil(sorted.length / poolsCount);

  for (let pool = 0; pool < poolsCount; pool++) {
    const poolStart = pool * playersPerPool;
    const poolEnd = Math.min(poolStart + playersPerPool, sorted.length);
    const poolPlayers = sorted.slice(poolStart, poolEnd);

    if (poolPlayers.length === 0) continue;

    // Generate round-robin matches within pool
    const numRounds = poolPlayers.length - 1;

    for (let round = 0; round < numRounds; round++) {
      const roundMatches: BracketMatch[] = [];

      for (let i = 0; i < poolPlayers.length / 2; i++) {
        const idx1 = (round + i) % poolPlayers.length;
        const idx2 = (round + poolPlayers.length - i - 1) % poolPlayers.length;

        if (idx1 !== idx2) {
          roundMatches.push({
            id: uuid(),
            team1_player_ids: [poolPlayers[idx1]],
            team2_player_ids: [poolPlayers[idx2]],
          });
        }
      }

      // Find or create round
      let existingRound = rounds.find(r => r.round_number === round + 1);
      if (!existingRound) {
        existingRound = {
          id: uuid(),
          round_number: round + 1,
          matches: [],
        };
        rounds.push(existingRound);
      }
      existingRound.matches.push(...roundMatches);
    }
  }

  return {
    bracket_id: bracketId,
    bracket_type: 'pool-play',
    rounds,
    seeding,
  };
}

/**
 * Double Elimination bracket
 * Winners bracket and losers bracket
 * Harder to generate - simplified version
 */
export function generateDoubleElimination(playerIds: string[]): BracketStructure {
  // For now, return winners bracket (single-elim)
  // Full double-elim implementation requires more complex logic
  const singleElim = generateSingleElimination(playerIds);

  return {
    ...singleElim,
    bracket_type: 'double-elim',
  };
}
