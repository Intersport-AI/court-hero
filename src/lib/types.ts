export type Format = 'round-robin' | 'single-elim' | 'double-elim' | 'king-of-court' | 'mixer';
export type EventStatus = 'setup' | 'active' | 'paused' | 'completed';

export interface Player {
  id: string;
  name: string;
  email: string;
  rating: number;
  internalRating: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

export interface Match {
  id: string;
  court: number;
  team1: string[];
  team2: string[];
  score1: number | null;
  score2: number | null;
  submittedBy1: string | null;
  submittedBy2: string | null;
  confirmed: boolean;
  winner: string[] | null;
}

export interface Round {
  id: string;
  number: number;
  matches: Match[];
  byes: string[];
}

export interface Event {
  id: string;
  name: string;
  date: string;
  format: Format;
  courts: number;
  gameTo: number;
  winBy2: boolean;
  organizerId: string;
  players: Player[];
  rounds: Round[];
  status: EventStatus;
  currentRound: number;
  createdAt: string;
}

export interface Organizer {
  id: string;
  email: string;
  passwordHash: string;
  plan: 'free' | 'pro' | 'premium';
  eventsCreated: number;
}
