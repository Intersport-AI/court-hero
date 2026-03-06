/**
 * Court Hero API Client
 * Handles all API calls with JWT token management
 */

const API_BASE = '/api';

// Token storage
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    localStorage.setItem('ch_access_token', access);
    localStorage.setItem('ch_refresh_token', refresh);
  }
}

export function loadTokens() {
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('ch_access_token');
    refreshToken = localStorage.getItem('ch_refresh_token');
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ch_access_token');
    localStorage.removeItem('ch_refresh_token');
    localStorage.removeItem('ch_user');
    localStorage.removeItem('ch_org_id');
  }
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('ch_user');
  return data ? JSON.parse(data) : null;
}

export function getStoredOrgId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ch_org_id');
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success && data.accessToken) {
      accessToken = data.accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ch_access_token', data.accessToken);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  loadTokens();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If 401, try refreshing token
  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `API error: ${res.status}`);
  }

  return data;
}

// ============================================================================
// AUTH
// ============================================================================

export async function signup(email: string, password: string, firstName: string, lastName: string, orgName?: string) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName, orgName }),
  });
  return data;
}

export async function signin(email: string, password: string) {
  const data = await apiFetch('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.success && data.tokens) {
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ch_user', JSON.stringify(data.tokens.user));
      localStorage.setItem('ch_org_id', data.tokens.user.org_id);
    }
  }
  return data;
}

export async function getMe() {
  return apiFetch('/auth/me');
}

export function signout() {
  clearTokens();
}

// ============================================================================
// EVENTS
// ============================================================================

export async function listEvents(orgId: string) {
  return apiFetch(`/organizations/${orgId}/events`);
}

export async function createEvent(orgId: string, eventData: any) {
  return apiFetch(`/organizations/${orgId}/events`, {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

export async function getEvent(orgId: string, eventId: string) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}`);
}

export async function updateEvent(orgId: string, eventId: string, updates: any) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteEvent(orgId: string, eventId: string) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// DIVISIONS
// ============================================================================

export async function listDivisions(orgId: string, eventId: string) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/divisions`);
}

export async function createDivision(orgId: string, eventId: string, divisionData: any) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/divisions`, {
    method: 'POST',
    body: JSON.stringify(divisionData),
  });
}

// ============================================================================
// VENUES & COURTS
// ============================================================================

export async function listVenues(orgId: string, eventId: string) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/venues`);
}

export async function createVenue(orgId: string, eventId: string, venueData: any) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/venues`, {
    method: 'POST',
    body: JSON.stringify(venueData),
  });
}

export async function listCourts(orgId: string, eventId: string, venueId: string) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/venues/${venueId}/courts`);
}

export async function createCourt(orgId: string, eventId: string, venueId: string, courtData: any) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/venues/${venueId}/courts`, {
    method: 'POST',
    body: JSON.stringify(courtData),
  });
}

// ============================================================================
// BRACKETS & SCHEDULING
// ============================================================================

export async function generateBrackets(orgId: string, eventId: string) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/generate-brackets`, {
    method: 'POST',
  });
}

export async function scheduleMatches(orgId: string, eventId: string, scheduleData: any) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/schedule-matches`, {
    method: 'POST',
    body: JSON.stringify(scheduleData),
  });
}

// ============================================================================
// SCORING
// ============================================================================

export async function submitScore(matchId: string, scores: any) {
  return apiFetch(`/matches/${matchId}/score`, {
    method: 'POST',
    body: JSON.stringify(scores),
  });
}

// ============================================================================
// REGISTRATION & PAYMENTS
// ============================================================================

export async function createPlayer(eventId: string, playerData: any) {
  return apiFetch(`/events/${eventId}/players`, {
    method: 'POST',
    body: JSON.stringify(playerData),
  });
}

export async function registerForDivision(eventId: string, divisionId: string, registrationData: any) {
  return apiFetch(`/events/${eventId}/divisions/${divisionId}/registrations`, {
    method: 'POST',
    body: JSON.stringify(registrationData),
  });
}

export async function createPayment(registrationId: string, amount_cents: number) {
  return apiFetch(`/registrations/${registrationId}/payment`, {
    method: 'POST',
    body: JSON.stringify({ amount_cents }),
  });
}

export async function getPaymentStatus(registrationId: string) {
  return apiFetch(`/registrations/${registrationId}/payment`);
}

// ============================================================================
// PLAYER
// ============================================================================

export async function getPlayerDashboard(playerId: string) {
  return apiFetch(`/players/${playerId}/dashboard`);
}

// ============================================================================
// PUBLIC
// ============================================================================

export async function searchEvents(params: {
  latitude?: number;
  longitude?: number;
  radius_miles?: number;
  date_from?: string;
  date_to?: string;
  skill_level?: number;
  format?: string;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  return apiFetch(`/public/events/search?${searchParams.toString()}`);
}

// ============================================================================
// ANALYTICS & REPORTS
// ============================================================================

export async function getEventAnalytics(orgId: string, eventId: string) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/analytics`);
}

export async function getFinancialReport(orgId: string, eventId: string) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/reports/financial`);
}

export async function submitDUPRResults(orgId: string, eventId: string) {
  return apiFetch(`/organizations/${orgId}/events/${eventId}/submit-dupr-results`, {
    method: 'POST',
  });
}
