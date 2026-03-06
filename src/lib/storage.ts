'use client';

import { Event, Organizer } from './types';

const EVENTS_KEY = 'courthero_events';
const ORGANIZER_KEY = 'courthero_organizer';

export function getEvents(): Event[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getEvent(id: string): Event | null {
  const events = getEvents();
  return events.find((e) => e.id === id) || null;
}

export function saveEvent(event: Event): void {
  const events = getEvents();
  const idx = events.findIndex((e) => e.id === event.id);
  if (idx >= 0) events[idx] = event;
  else events.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function deleteEvent(id: string): void {
  const events = getEvents().filter((e) => e.id !== id);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function getOrganizer(): Organizer | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(ORGANIZER_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveOrganizer(org: Organizer): void {
  localStorage.setItem(ORGANIZER_KEY, JSON.stringify(org));
}

export function clearOrganizer(): void {
  localStorage.removeItem(ORGANIZER_KEY);
}
