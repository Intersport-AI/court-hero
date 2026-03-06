/**
 * TICKET P2-01: Partner Matching Algorithm
 * Suggests optimal partner pairings based on skill rating and history
 * Performance target: <3 seconds for 5,000 players
 */

interface Player {
  id: string;
  name: string;
  rating: number;
  wins: number;
  losses: number;
  previousPartners: string[];
}

interface Partnership {
  team1: {
    playerId: string;
    name: string;
    rating: number;
  };
  team2: {
    playerId: string;
    name: string;
    rating: number;
  };
  confidence: number; // 0-100
  ratingBalance: number; // how well matched
  novelty: number; // 0-100, higher = new partnership
}

/**
 * Calculates confidence score for a potential partnership
 * Factors: rating balance, partnership novelty, win rate similarity
 */
function calculateConfidence(p1: Player, p2: Player): number {
  // Rating balance (max 30 points)
  const ratingDiff = Math.abs(p1.rating - p2.rating);
  const ratingScore = Math.max(0, 30 - ratingDiff * 5); // Penalizes mismatches

  // Partnership novelty (max 40 points)
  const hasPlayedBefore = p2.previousPartners.includes(p1.id);
  const noveltyScore = hasPlayedBefore ? 15 : 40; // Prefer new pairings

  // Win rate similarity (max 30 points)
  const p1WinRate = p1.wins / (p1.wins + p1.losses || 1);
  const p2WinRate = p2.wins / (p2.wins + p2.losses || 1);
  const winRateDiff = Math.abs(p1WinRate - p2WinRate);
  const winRateScore = Math.max(0, 30 - winRateDiff * 50);

  return Math.round(ratingScore + noveltyScore + winRateScore);
}

/**
 * Generates optimal partner suggestions using greedy matching algorithm
 * Time complexity: O(n²) - acceptable for n ≤ 5,000
 */
export function suggestPartners(players: Player[]): Partnership[] {
  if (players.length < 2) {
    return [];
  }

  const partnerships: Partnership[] = [];
  const paired = new Set<string>();

  // Sort by rating (descending) to prioritize high-rated players
  const sorted = [...players].sort((a, b) => b.rating - a.rating);

  for (const player1 of sorted) {
    if (paired.has(player1.id)) continue;

    // Find best available partner
    let bestPartner: Player | null = null;
    let bestConfidence = 0;

    for (const player2 of sorted) {
      if (player2.id === player1.id || paired.has(player2.id)) continue;

      const confidence = calculateConfidence(player1, player2);
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestPartner = player2;
      }
    }

    if (bestPartner && bestConfidence > 0) {
      const ratingBalance = Math.abs(player1.rating - bestPartner.rating);
      partnerships.push({
        team1: {
          playerId: player1.id,
          name: player1.name,
          rating: player1.rating,
        },
        team2: {
          playerId: bestPartner.id,
          name: bestPartner.name,
          rating: bestPartner.rating,
        },
        confidence: bestConfidence,
        ratingBalance,
        novelty: bestPartner.previousPartners.includes(player1.id) ? 0 : 100,
      });

      paired.add(player1.id);
      paired.add(bestPartner.id);
    }
  }

  return partnerships;
}

/**
 * Unit test: Basic pairing
 */
export function testBasicPairing() {
  const players: Player[] = [
    { id: '1', name: 'Alice', rating: 3.5, wins: 10, losses: 5, previousPartners: [] },
    { id: '2', name: 'Bob', rating: 3.6, wins: 9, losses: 6, previousPartners: [] },
    { id: '3', name: 'Charlie', rating: 2.5, wins: 5, losses: 10, previousPartners: [] },
  ];

  const result = suggestPartners(players);
  console.log('Test Basic Pairing:', result);
  return result.length === 1 && result[0].confidence > 50;
}

/**
 * Unit test: Novelty preference
 */
export function testNoveltyPreference() {
  const players: Player[] = [
    { id: '1', name: 'Alice', rating: 3.5, wins: 10, losses: 5, previousPartners: ['2'] },
    { id: '2', name: 'Bob', rating: 3.5, wins: 10, losses: 5, previousPartners: ['1'] },
    { id: '3', name: 'Charlie', rating: 3.4, wins: 10, losses: 5, previousPartners: [] },
    { id: '4', name: 'Diana', rating: 3.4, wins: 10, losses: 5, previousPartners: [] },
  ];

  const result = suggestPartners(players);
  // Should prefer Alice+Charlie over Alice+Bob (which have played before)
  console.log('Test Novelty Preference:', result);
  return result.length === 2 && result[0].novelty === 100;
}

/**
 * Unit test: Rating balance
 */
export function testRatingBalance() {
  const players: Player[] = [
    { id: '1', name: 'Expert', rating: 5.0, wins: 50, losses: 5, previousPartners: [] },
    { id: '2', name: 'Intermediate', rating: 3.0, wins: 20, losses: 20, previousPartners: [] },
    { id: '3', name: 'Expert2', rating: 4.9, wins: 48, losses: 5, previousPartners: [] },
    { id: '4', name: 'Intermediate2', rating: 3.1, wins: 21, losses: 19, previousPartners: [] },
  ];

  const result = suggestPartners(players);
  // Should pair experts together and intermediates together
  console.log('Test Rating Balance:', result);
  return result.length === 2 && result[0].ratingBalance < 1;
}

/**
 * Performance test: 5,000 players
 */
export function testPerformance5K() {
  const players: Player[] = Array.from({ length: 5000 }, (_, i) => ({
    id: `player_${i}`,
    name: `Player ${i}`,
    rating: 2.0 + Math.random() * 3.0, // 2.0 to 5.0
    wins: Math.floor(Math.random() * 50),
    losses: Math.floor(Math.random() * 50),
    previousPartners: [],
  }));

  const start = Date.now();
  const result = suggestPartners(players);
  const duration = Date.now() - start;

  console.log(`Performance Test (5K players): ${duration}ms, ${result.length} partnerships`);
  return duration < 3000; // Must complete in < 3 seconds
}
