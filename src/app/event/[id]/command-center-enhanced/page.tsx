'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Match {
  id: string;
  matchNumber: number;
  team1: string;
  team2: string;
  court: string;
  status: 'pending' | 'in-progress' | 'completed';
  scheduledTime: string;
  team1_score_game1?: number;
  team2_score_game1?: number;
}

interface Court {
  id: string;
  name: string;
  currentMatch?: string;
  status: 'available' | 'in-use' | 'maintenance';
}

interface Division {
  id: string;
  name: string;
  matchCount: number;
  completedMatches: number;
}

export default function CommandCenterEnhanced() {
  const params = useParams();
  const eventId = params.id as string;
  const { subscribeEvent, onMatchCompleted, onScoreUpdate } = useSocket();

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [autoAssign, setAutoAssign] = useState(false);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates
  useEffect(() => {
    if (eventId) {
      subscribeEvent(eventId);
    }
  }, [eventId, subscribeEvent]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [divRes, matchRes, courtRes] = await Promise.all([
          fetch(`/api/organizations/org/events/${eventId}/divisions`),
          fetch(`/api/organizations/org/events/${eventId}/matches`),
          fetch(`/api/organizations/org/events/${eventId}/courts`),
        ]);

        if (divRes.ok) setDivisions(await divRes.json());
        if (matchRes.ok) setMatches(await matchRes.json());
        if (courtRes.ok) setCourts(await courtRes.json());
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  // Real-time match completion updates
  useEffect(() => {
    const unsubscribe = onMatchCompleted((data) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === data.matchId ? { ...m, status: 'completed' as const } : m
        )
      );
    });
    return unsubscribe;
  }, [onMatchCompleted]);

  // Real-time score updates
  useEffect(() => {
    const unsubscribe = onScoreUpdate((data) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === data.matchId
            ? {
                ...m,
                team1_score_game1: data.team1_score_game1,
                team2_score_game1: data.team2_score_game1,
                status: 'in-progress' as const,
              }
            : m
        )
      );
    });
    return unsubscribe;
  }, [onScoreUpdate]);

  // Call next match
  const callMatch = useCallback(async (matchId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/org/events/${eventId}/matches/${matchId}/call`,
        { method: 'POST' }
      );
      if (response.ok) {
        // Match called - update state
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId ? { ...m, status: 'in-progress' as const } : m
          )
        );
      }
    } catch (error) {
      console.error('Error calling match:', error);
    }
  }, [eventId]);

  // Assign match to court
  const assignCourt = useCallback(
    async (matchId: string, courtId: string) => {
      try {
        const response = await fetch(
          `/api/organizations/org/events/${eventId}/matches/${matchId}/assign-court`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courtId }),
          }
        );
        if (response.ok) {
          // Update match court assignment
          setMatches((prev) =>
            prev.map((m) =>
              m.id === matchId ? { ...m, court: courtId } : m
            )
          );
          // Update court status
          setCourts((prev) =>
            prev.map((c) =>
              c.id === courtId ? { ...c, currentMatch: matchId } : c
            )
          );
        }
      } catch (error) {
        console.error('Error assigning court:', error);
      }
    },
    [eventId]
  );

  // Auto-assign matches to courts
  const autoAssignMatches = useCallback(async () => {
    if (!autoAssign) return;

    const pendingMatches = matches.filter((m) => m.status === 'pending');
    const availableCourts = courts.filter((c) => c.status === 'available');

    for (const match of pendingMatches.slice(0, availableCourts.length)) {
      const court = availableCourts.find((c) => !c.currentMatch);
      if (court) {
        await assignCourt(match.id, court.id);
      }
    }
  }, [autoAssign, matches, courts, assignCourt]);

  useEffect(() => {
    if (autoAssign) {
      const interval = setInterval(autoAssignMatches, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoAssign, autoAssignMatches]);

  if (loading) {
    return <div className="p-8 text-center">Loading tournament command center...</div>;
  }

  const filteredMatches = selectedDivision
    ? matches.filter((m) => m.id.includes(selectedDivision))
    : matches;

  const stats = {
    total: matches.length,
    completed: matches.filter((m) => m.status === 'completed').length,
    inProgress: matches.filter((m) => m.status === 'in-progress').length,
    pending: matches.filter((m) => m.status === 'pending').length,
  };

  return (
    <div className="p-6 bg-[#0C0F14] text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Tournament Command Center</h1>
          <p className="text-[#B8C4D4]">Real-time match management and court assignments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1F2E] p-4 rounded-lg border border-[#00F260]/20">
            <div className="text-[#B8C4D4] text-sm">Total Matches</div>
            <div className="text-3xl font-bold text-[#00F260] mt-1">{stats.total}</div>
          </div>
          <div className="bg-[#1A1F2E] p-4 rounded-lg border border-blue-500/20">
            <div className="text-[#B8C4D4] text-sm">In Progress</div>
            <div className="text-3xl font-bold text-blue-400 mt-1">{stats.inProgress}</div>
          </div>
          <div className="bg-[#1A1F2E] p-4 rounded-lg border border-amber-500/20">
            <div className="text-[#B8C4D4] text-sm">Pending</div>
            <div className="text-3xl font-bold text-amber-400 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-[#1A1F2E] p-4 rounded-lg border border-green-500/20">
            <div className="text-[#B8C4D4] text-sm">Completed</div>
            <div className="text-3xl font-bold text-green-400 mt-1">{stats.completed}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#1A1F2E] p-4 rounded-lg mb-8 border border-[#00F260]/10">
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Auto-assign courts</span>
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-3 py-2 bg-[#0C0F14] border border-[#00F260]/20 rounded text-white"
            >
              <option value="">All Divisions</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#FFB800]">Court Status</h2>
          <div className="grid grid-cols-4 gap-4">
            {courts.map((court) => (
              <div
                key={court.id}
                className={`p-4 rounded-lg border ${
                  court.status === 'in-use'
                    ? 'border-[#00F260] bg-[#1A1F2E]'
                    : court.status === 'available'
                      ? 'border-blue-500/50 bg-[#1A1F2E]'
                      : 'border-red-500/50 bg-[#1A1F2E] opacity-50'
                }`}
              >
                <div className="font-bold text-lg mb-2">{court.name}</div>
                {court.currentMatch ? (
                  <div className="text-sm text-[#B8C4D4]">
                    Match:{' '}
                    {matches.find((m) => m.id === court.currentMatch)?.matchNumber}
                  </div>
                ) : (
                  <div className="text-sm text-green-400">Available</div>
                )}
                <div
                  className={`mt-2 px-2 py-1 rounded text-xs font-semibold ${
                    court.status === 'available'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-[#00F260]/20 text-[#00F260]'
                  }`}
                >
                  {court.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matches Table */}
        <div className="bg-[#1A1F2E] rounded-lg overflow-hidden border border-[#00F260]/10">
          <table className="w-full">
            <thead className="bg-[#0C0F14] border-b border-[#00F260]/10">
              <tr>
                <th className="px-4 py-3 text-left text-[#00F260]">#</th>
                <th className="px-4 py-3 text-left text-[#00F260]">Match</th>
                <th className="px-4 py-3 text-left text-[#00F260]">Court</th>
                <th className="px-4 py-3 text-left text-[#00F260]">Status</th>
                <th className="px-4 py-3 text-left text-[#00F260]">Score</th>
                <th className="px-4 py-3 text-left text-[#00F260]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match) => (
                <tr
                  key={match.id}
                  className="border-b border-[#00F260]/5 hover:bg-[#0C0F14]/50"
                >
                  <td className="px-4 py-3 text-[#FFB800]">{match.matchNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-semibold">{match.team1}</div>
                      <div className="text-[#B8C4D4]">vs {match.team2}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{match.court || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        match.status === 'completed'
                          ? 'bg-green-500/20 text-green-300'
                          : match.status === 'in-progress'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {match.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {match.status === 'in-progress' &&
                      match.team1_score_game1 !== undefined ? (
                      <span>
                        {match.team1_score_game1}-{match.team2_score_game1}
                      </span>
                    ) : (
                      <span className="text-[#B8C4D4]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {match.status === 'pending' && (
                        <>
                          <button
                            onClick={() => callMatch(match.id)}
                            className="px-2 py-1 bg-[#00F260]/20 text-[#00F260] rounded text-xs hover:bg-[#00F260]/30"
                          >
                            Call
                          </button>
                          <select
                            onChange={(e) => assignCourt(match.id, e.target.value)}
                            className="px-2 py-1 bg-[#0C0F14] border border-[#00F260]/20 rounded text-xs text-white"
                            defaultValue=""
                          >
                            <option value="">Assign Court</option>
                            {courts
                              .filter((c) => c.status === 'available')
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                          </select>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link href={`/event/${eventId}`} className="text-[#00F260] hover:text-[#00F260]/80">
            ← Back to Event
          </Link>
        </div>
      </div>
    </div>
  );
}
