const K_FACTOR = 32;

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function updateRatings(
  winnerRating: number,
  loserRating: number,
  marginOfVictory: number = 1
): { newWinnerRating: number; newLoserRating: number } {
  const movMultiplier = Math.log(Math.abs(marginOfVictory) + 1) * (2.2 / (2.2 + 0.001 * (winnerRating - loserRating)));
  const expectedWin = expectedScore(winnerRating, loserRating);
  const expectedLoss = expectedScore(loserRating, winnerRating);
  const adjustedK = K_FACTOR * Math.max(movMultiplier, 1);

  return {
    newWinnerRating: Math.round(winnerRating + adjustedK * (1 - expectedWin)),
    newLoserRating: Math.round(loserRating + adjustedK * (0 - expectedLoss)),
  };
}

export function selfReportedToElo(rating: number): number {
  const map: Record<number, number> = {
    2.5: 800, 3.0: 1000, 3.5: 1200, 4.0: 1400, 4.5: 1600, 5.0: 1800,
  };
  return map[rating] ?? 1200;
}
