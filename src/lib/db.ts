import { supabase } from './supabase';
import { Event as CHEvent, Player, Match, Round } from './types';

// ─── Save full event (create) ───
export async function saveEvent(event: CHEvent): Promise<boolean> {
  const { error: eventError } = await supabase.from('events').upsert({
    id: event.id,
    name: event.name,
    date: event.date,
    format: event.format,
    courts: event.courts,
    game_to: event.gameTo,
    win_by_2: event.winBy2,
    organizer_id: event.organizerId,
    status: event.status,
    current_round: event.currentRound,
    created_at: event.createdAt,
    updated_at: new Date().toISOString(),
  });
  if (eventError) { console.error('Event save error:', eventError); return false; }

  // Save players
  if (event.players.length > 0) {
    const playerRows = event.players.map(p => ({
      id: p.id,
      event_id: event.id,
      name: p.name,
      email: p.email || null,
      rating: p.rating,
      internal_rating: p.internalRating,
      wins: p.wins,
      losses: p.losses,
      points_for: p.pointsFor,
      points_against: p.pointsAgainst,
    }));
    const { error: playersError } = await supabase.from('players').upsert(playerRows);
    if (playersError) console.error('Players save error:', playersError);
  }

  // Save rounds and matches
  for (const round of event.rounds) {
    const { error: roundError } = await supabase.from('rounds').upsert({
      id: round.id,
      event_id: event.id,
      round_number: round.number,
      byes: round.byes,
    });
    if (roundError) console.error('Round save error:', roundError);

    if (round.matches.length > 0) {
      const matchRows = round.matches.map(m => ({
        id: m.id,
        round_id: round.id,
        event_id: event.id,
        team1: m.team1,
        team2: m.team2,
        score1: m.score1 ?? null,
        score2: m.score2 ?? null,
        winner: m.winner ?? null,
        court: m.court,
        confirmed: m.confirmed,
      }));
      const { error: matchesError } = await supabase.from('matches').upsert(matchRows);
      if (matchesError) console.error('Matches save error:', matchesError);
    }
  }

  return true;
}

// ─── Load single event ───
export async function loadEvent(eventId: string): Promise<CHEvent | null> {
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (eventError || !eventData) return null;

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at');

  const { data: rounds } = await supabase
    .from('rounds')
    .select('*')
    .eq('event_id', eventId)
    .order('round_number');

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('event_id', eventId);

  const mappedPlayers: Player[] = (players || []).map(p => ({
    id: p.id,
    name: p.name,
    email: p.email || '',
    rating: Number(p.rating),
    internalRating: p.internal_rating,
    wins: p.wins,
    losses: p.losses,
    pointsFor: p.points_for,
    pointsAgainst: p.points_against,
  }));

  const mappedRounds: Round[] = (rounds || []).map(r => ({
    id: r.id,
    number: r.round_number,
    byes: r.byes || [],
    matches: (matches || [])
      .filter(m => m.round_id === r.id)
      .map(m => ({
        id: m.id,
        team1: m.team1,
        team2: m.team2,
        score1: m.score1,
        score2: m.score2,
        winner: m.winner,
        court: m.court,
        confirmed: m.confirmed,
        submittedBy1: null,
        submittedBy2: null,
      })),
  }));

  return {
    id: eventData.id,
    name: eventData.name,
    date: eventData.date,
    format: eventData.format,
    courts: eventData.courts,
    gameTo: eventData.game_to,
    winBy2: eventData.win_by_2,
    organizerId: eventData.organizer_id,
    players: mappedPlayers,
    rounds: mappedRounds,
    status: eventData.status,
    currentRound: eventData.current_round,
    createdAt: eventData.created_at,
  };
}

// ─── Load all events ───
export async function loadAllEvents(): Promise<CHEvent[]> {
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .order('created_at', { ascending: false });

  if (!events) return [];

  const results: CHEvent[] = [];
  for (const e of events) {
    const event = await loadEvent(e.id);
    if (event) results.push(event);
  }
  return results;
}

// ─── Update event status/round ───
export async function updateEventStatus(eventId: string, updates: Partial<{ status: string; current_round: number }>): Promise<boolean> {
  const { error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', eventId);
  return !error;
}

// ─── Add player to event ───
export async function addPlayer(eventId: string, player: Player): Promise<boolean> {
  const { error } = await supabase.from('players').insert({
    id: player.id,
    event_id: eventId,
    name: player.name,
    email: player.email || null,
    rating: player.rating,
    internal_rating: player.internalRating,
    wins: 0, losses: 0, points_for: 0, points_against: 0,
  });
  return !error;
}

// ─── Update match score ───
export async function updateMatchScore(
  matchId: string,
  score1: number,
  score2: number,
  winner: string[]
): Promise<boolean> {
  const { error } = await supabase
    .from('matches')
    .update({ score1, score2, winner, confirmed: true })
    .eq('id', matchId);
  return !error;
}

// ─── Update player stats ───
export async function updatePlayerStats(
  playerId: string,
  updates: { wins: number; losses: number; points_for: number; points_against: number }
): Promise<boolean> {
  const { error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId);
  return !error;
}

// ─── Subscribe to event changes (realtime) ───
export function subscribeToEvent(eventId: string, callback: () => void) {
  const channel = supabase
    .channel(`event-${eventId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `id=eq.${eventId}` }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `event_id=eq.${eventId}` }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `event_id=eq.${eventId}` }, callback)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
