'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';

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
  team1_score_game2?: number;
  team2_score_game2?: number;
}

export default function CourtDisplay() {
  const params = useParams();
  const eventId = params.id as string;
  const { subscribeEvent, onScoreUpdate } = useSocket();

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [courts, setCourts] = useState<{ id: string; name: string }[]>([]);

  // Subscribe to event updates
  useEffect(() => {
    if (eventId) {
      subscribeEvent(eventId);
    }
  }, [eventId, subscribeEvent]);

  // Load courts and matches
  useEffect(() => {
    const loadData = async () => {
      try {
        const [courtRes, matchRes] = await Promise.all([
          fetch(`/api/organizations/org/events/${eventId}/courts`),
          fetch(`/api/organizations/org/events/${eventId}/matches`),
        ]);

        if (courtRes.ok) {
          const courtData = await courtRes.json();
          setCourts(courtData);
          if (courtData.length > 0 && !selectedCourtId) {
            setSelectedCourtId(courtData[0].id);
          }
        }

        if (matchRes.ok) {
          const matchData = await matchRes.json();
          setMatches(matchData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [eventId, selectedCourtId]);

  // Update current match when court changes or matches update
  useEffect(() => {
    if (selectedCourtId) {
      const match = matches.find((m) => m.court === selectedCourtId);
      if (match) {
        setCurrentMatch(match);
      } else {
        // Show next match if none currently on court
        const nextMatch = matches.find((m) => m.status === 'pending');
        if (nextMatch) {
          setCurrentMatch(nextMatch);
        }
      }
    }

    // Get recent completed matches for sidebar
    const recent = matches
      .filter((m) => m.status === 'completed')
      .sort((a, b) => {
        const aNum = a.matchNumber || 0;
        const bNum = b.matchNumber || 0;
        return bNum - aNum;
      })
      .slice(0, 5);
    setRecentMatches(recent);
  }, [matches, selectedCourtId]);

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
                team1_score_game2: data.team1_score_game2,
                team2_score_game2: data.team2_score_game2,
                status: 'in-progress' as const,
              }
            : m
        )
      );
    });
    return unsubscribe;
  }, [onScoreUpdate]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const loadMatches = async () => {
        try {
          const response = await fetch(`/api/organizations/org/events/${eventId}/matches`);
          if (response.ok) {
            const data = await response.json();
            setMatches(data);
          }
        } catch (error) {
          console.error('Error refreshing matches:', error);
        }
      };
      loadMatches();
    }, 5000);

    return () => clearInterval(interval);
  }, [eventId]);

  if (!currentMatch) {
    return (
      <div className="bg-[#0C0F14] text-white h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">Loading...</div>
          <p className="text-[#B8C4D4]">Waiting for matches</p>
        </div>
      </div>
    );
  }

  const isLiveMatch = currentMatch.status === 'in-progress';
  const team1Score = currentMatch.team1_score_game1 || 0;
  const team2Score = currentMatch.team2_score_game1 || 0;
  const leader = team1Score > team2Score ? 1 : team2Score > team1Score ? 2 : 0;

  return (
    <div className="bg-[#0C0F14] text-white h-screen flex overflow-hidden">
      {/* Main Display */}
      <div className="flex-1 flex flex-col p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-[#FFB800]">Court {currentMatch.court || '—'}</div>
          <div className="text-2xl text-[#B8C4D4] mt-2">Match #{currentMatch.matchNumber}</div>
          {isLiveMatch && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-[#B8C4D4]">LIVE</span>
            </div>
          )}
        </div>

        {/* Score Display */}
        <div className="flex-1 flex items-center justify-center gap-12 mb-8">
          {/* Team 1 */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-6">{currentMatch.team1}</div>
            <div
              className={`text-9xl font-bold transition ${
                leader === 1 ? 'text-[#00F260]' : 'text-[#B8C4D4]'
              }`}
            >
              {team1Score}
            </div>
          </div>

          {/* Divider */}
          <div className="text-6xl text-[#FFB800] font-bold">-</div>

          {/* Team 2 */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-6">{currentMatch.team2}</div>
            <div
              className={`text-9xl font-bold transition ${
                leader === 2 ? 'text-[#FFB800]' : 'text-[#B8C4D4]'
              }`}
            >
              {team2Score}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="text-center mb-4">
          <span
            className={`px-4 py-2 rounded-full font-bold text-lg ${
              isLiveMatch
                ? 'bg-blue-500/20 text-blue-300'
                : currentMatch.status === 'completed'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-amber-500/20 text-amber-300'
            }`}
          >
            {currentMatch.status === 'in-progress'
              ? 'In Progress'
              : currentMatch.status === 'completed'
                ? 'Match Complete'
                : 'Coming Up'}
          </span>
        </div>
      </div>

      {/* Sidebar - Recent Matches & Court Selector */}
      <div className="w-80 bg-[#1A1F2E] border-l border-[#00F260]/10 p-6 flex flex-col">
        {/* Court Selector */}
        <div className="mb-8">
          <div className="text-sm text-[#B8C4D4] mb-3 font-semibold">SELECT COURT</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {courts.map((court) => (
              <button
                key={court.id}
                onClick={() => setSelectedCourtId(court.id)}
                className={`w-full px-4 py-2 rounded-lg transition font-semibold ${
                  selectedCourtId === court.id
                    ? 'bg-[#00F260] text-[#0C0F14]'
                    : 'bg-[#0C0F14] text-white border border-[#00F260]/20 hover:border-[#00F260]/50'
                }`}
              >
                {court.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="flex-1">
          <div className="text-sm text-[#B8C4D4] mb-3 font-semibold">RECENT</div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentMatches.map((match) => (
              <div
                key={match.id}
                className="px-3 py-2 bg-[#0C0F14] rounded-lg border border-[#00F260]/10 hover:border-[#00F260]/30"
              >
                <div className="text-xs text-[#FFB800] font-semibold mb-1">Match #{match.matchNumber}</div>
                <div className="text-xs text-[#B8C4D4] mb-1">{match.team1}</div>
                <div className="text-xs text-[#B8C4D4] mb-2">{match.team2}</div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-[#00F260]">
                    {match.team1_score_game1 || 0}
                  </span>
                  <span className="text-xs text-[#B8C4D4]">-</span>
                  <span className="text-sm font-bold text-[#FFB800]">
                    {match.team2_score_game1 || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-[#B8C4D4] text-center pt-4 border-t border-[#00F260]/10">
          Updates every 5 seconds
        </div>
      </div>
    </div>
  );
}
