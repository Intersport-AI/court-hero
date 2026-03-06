# Court Hero - Build Instructions

## What Court Hero Is
Court Hero is a pickleball event management platform. Organizers create events (round robins, brackets, king of the court, mixers). Players join via a shareable link. The app handles scheduling, court assignments, live scoring, and real-time leaderboards.

## Design Aesthetic
- Dark theme: near-black background (#0C0F14), electric green accent (#00F260), white text, muted grays, amber/gold (#FFB800) for #1 position/winners
- Mobile-first. Every screen designed for phones first.
- Clean, premium, sporty but not cheesy. Think Stripe meets ESPN.
- Font: Inter. Heavy weights for scores, light for secondary info. Tabular numbers.
- No pickleball clip art. No cartoon paddles. We look like a real tech company.
- Subtle animations: leaderboard shuffles when scores update, gold highlight for first place.

## Tech Stack
- Next.js 15+ with App Router, TypeScript, Tailwind CSS
- Stripe for payments (keys in .env.local)
- localStorage + JSON files for v1 data persistence (no database yet)
- WebSocket-style updates via polling every 2 seconds for live leaderboard
- All client components where interactivity is needed

## Pages to Build

### 1. Landing Page (/)
Marketing site. Dark background. Hero section with:
- Headline: "Run Your Court Like a Hero"
- Subhead: "The easiest way to organize and run pickleball events. Create a bracket in seconds. Players score from their phones. Leaderboard updates live."
- CTA button: "Create Your First Event — Free" (electric green)
- Below: 3-column feature grid (Round Robins, Brackets, Live Scoring) with icons
- Below: "How It Works" - 3 steps (Create → Share → Play)
- Below: Pricing section ($19/event, $49/mo unlimited, $99/mo facility)
- Footer with links

### 2. Create Event (/create)
Single-page form, mobile-first:
- Event name (text input)
- Date & time (datetime picker)
- Format selector (Round Robin, Single Elimination, Double Elimination, King of the Court, Mixer/Social)
- Number of courts (number input, 1-20)
- Games to (11, 15, or 21)
- Win by 2 toggle
- Add players section: name + skill rating (2.5-5.0 in 0.5 increments) for each player. "Add Player" button. Also show a "Share Signup Link" that generates a join URL.
- Big green "Generate Bracket" button
- After generation: shows the full schedule, court assignments, and a shareable event link
- Requires organizer account (email + password) or quick signup

### 3. Event Dashboard (/event/[id])  
Organizer control panel:
- Current round indicator with "Start Next Round" button
- Grid of courts showing current matchups on each court
- Live standings/leaderboard sidebar
- Score override capability
- "Add Late Player" and "Remove Player" buttons
- "Pause Event" and "End Event" buttons
- Share link for players prominently displayed

### 4. Player Event View (/event/[id]/play)
What players see when they open the shared link:
- Join flow: enter name, email, skill rating (3 fields, no account needed)
- After joining, shows:
  - TOP CARD: Their next match — opponent name(s), court number, round. Big, bold.
  - MIDDLE: Live leaderboard. Their name highlighted. Positions update in real-time.
  - BOTTOM: "Submit Score" button. Tap → enter score (two number inputs) → submit. Back to leaderboard.

### 5. Live Leaderboard (/event/[id]/board)
Full-screen display mode for TVs/projectors:
- Dark background, large type
- Event name and current round at top
- Leaderboard with rank, player name, W-L record, point differential
- Updates in real-time
- Court Hero branding in corner

### 6. Auth Pages (/login, /signup)
Simple email + password. For organizers only. Players never need accounts.

### 7. Organizer Dashboard (/dashboard)
After login, shows:
- List of their events (past and upcoming)
- Quick stats (total events, total players, etc.)
- "Create New Event" button
- Account settings (change password, manage subscription)

### 8. Pricing/Checkout (/pricing)
Three tier cards:
- Single Event: $19 — "Perfect for trying it out"
- Monthly Unlimited: $49/mo — "For regular organizers"  
- Facility License: $99/mo — "For clubs and facilities"
Stripe Checkout integration for payments.

## Core Algorithms to Implement

### Round Robin Scheduler
- Input: list of players with ratings, number of courts
- Output: list of rounds, each with court assignments and matchups
- Constraints: minimize byes, balance court usage, no repeat matchups, rating-proximity matching
- Handle odd numbers (byes distributed fairly)
- For doubles: partner rotation so everyone plays with everyone before repeating

### Single/Double Elimination Bracket
- Proper seeding (1v16, 8v9, etc.)
- Bye distribution to top seeds in round 1
- Double elim: winners bracket, losers bracket, grand finals with proper feed-in

### King of the Court
- Queue management
- Winner stays, challenger rotates in
- Configurable point threshold
- Cumulative stats tracking

### Scoring
- Score validation (reject impossible scores based on format rules)
- Both sides submit independently, auto-confirm on match
- Organizer override capability
- Timeout nudges (visual indicator for missing scores)

### Matchmaking/Rating
- Elo-style internal rating that updates after each match
- Rating-balanced team formation for doubles
- Self-reported rating as starting point

## Data Model (localStorage for v1)

```typescript
interface Event {
  id: string;
  name: string;
  date: string;
  format: 'round-robin' | 'single-elim' | 'double-elim' | 'king-of-court' | 'mixer';
  courts: number;
  gameTo: number;
  winBy2: boolean;
  organizerId: string;
  players: Player[];
  rounds: Round[];
  status: 'setup' | 'active' | 'paused' | 'completed';
  currentRound: number;
  createdAt: string;
}

interface Player {
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

interface Round {
  number: number;
  matches: Match[];
  byes: string[]; // player ids sitting out
}

interface Match {
  id: string;
  court: number;
  team1: string[]; // player ids
  team2: string[]; // player ids
  score1?: number;
  score2?: number;
  submittedBy1?: boolean;
  submittedBy2?: boolean;
  confirmed: boolean;
  winner?: 'team1' | 'team2';
}

interface Organizer {
  id: string;
  email: string;
  passwordHash: string;
  plan: 'free' | 'single' | 'monthly' | 'facility';
  eventsCreated: number;
}
```

## File Structure
```
src/
  app/
    page.tsx (landing)
    create/page.tsx
    event/[id]/page.tsx (organizer dashboard)
    event/[id]/play/page.tsx (player view)
    event/[id]/board/page.tsx (projector leaderboard)
    login/page.tsx
    signup/page.tsx
    dashboard/page.tsx
    pricing/page.tsx
    api/
      events/route.ts
      events/[id]/route.ts
      events/[id]/join/route.ts
      events/[id]/score/route.ts
      auth/login/route.ts
      auth/signup/route.ts
      checkout/route.ts
  components/
    Header.tsx
    Footer.tsx
    EventCard.tsx
    Leaderboard.tsx
    ScoreSubmit.tsx
    CourtGrid.tsx
    BracketView.tsx
    MatchCard.tsx
    PlayerForm.tsx
    PricingCard.tsx
    Modal.tsx
  lib/
    scheduler.ts (round robin algorithm)
    bracket.ts (elimination bracket algorithm)
    kingOfCourt.ts (KOTC logic)
    mixer.ts (social play rotation)
    rating.ts (Elo rating system)
    scoring.ts (validation, tiebreaking)
    stripe.ts (payment helpers)
    storage.ts (localStorage/file persistence helpers)
    types.ts (all TypeScript interfaces)
    utils.ts (currency formatting, date helpers, etc.)
  styles/
    globals.css (Tailwind config + custom styles)
```

## Important
- Every page must be mobile-first and look great on a 6-inch phone screen
- Use Tailwind exclusively for styling
- Electric green (#00F260) for primary CTAs and active states
- Amber/gold (#FFB800) for first place, winner badges
- All interactive components must be 'use client'
- Leaderboard must poll for updates every 2 seconds
- Score submission must be 2 taps maximum
- The entire player experience (join → see matches → submit scores → view leaderboard) must work without creating an account
