'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useParams } from 'next/navigation';

interface Match {
  id: string;
  matchNumber: number;
  team1: string;
  team2: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface ScoreEntry {
  matchId: string;
  team1_score_game1: number;
  team2_score_game1: number;
  team1_score_game2?: number;
  team2_score_game2?: number;
  team1_score_game3?: number;
  team2_score_game3?: number;
  timestamp: number;
  synced: boolean;
}

export default function RefereeMobileUI() {
  const params = useParams();
  const eventId = params.id as string;
  const { isConnected } = useSocket();

  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [game, setGame] = useState<1 | 2 | 3>(1);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState<ScoreEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load offline queue from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`score-queue-${eventId}`);
    if (stored) {
      try {
        setOfflineQueue(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading offline queue:', error);
      }
    }
  }, [eventId]);

  // Load matches
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch(`/api/organizations/org/events/${eventId}/matches`);
        if (response.ok) {
          const data = await response.json();
          setMatches(data);
          if (data.length > 0) {
            setCurrentMatch(data.find((m: Match) => m.status === 'pending') || data[0]);
          }
        }
      } catch (error) {
        console.error('Error loading matches:', error);
      }
    };

    loadMatches();
  }, [eventId]);

  // Sync offline queue when connection restored
  useEffect(() => {
    if (isConnected && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isConnected]);

  // Save score entry (with offline support)
  const submitScore = useCallback(async () => {
    if (!currentMatch) return;

    setSubmitting(true);
    const scoreEntry: ScoreEntry = {
      matchId: currentMatch.id,
      team1_score_game1: team1Score,
      team2_score_game1: team2Score,
      timestamp: Date.now(),
      synced: false,
    };

    try {
      if (isConnected) {
        // Try to submit to server
        const response = await fetch(`/api/matches/${currentMatch.id}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team1_score_game1: team1Score,
            team2_score_game1: team2Score,
          }),
        });

        if (response.ok) {
          scoreEntry.synced = true;
          // Move to next match
          const nextMatch = matches.find((m) => m.status === 'pending');
          if (nextMatch) {
            setCurrentMatch(nextMatch);
            setTeam1Score(0);
            setTeam2Score(0);
          }
        }
      } else {
        // Queue for offline
        scoreEntry.synced = false;
      }

      // Add to offline queue
      const newQueue = [...offlineQueue, scoreEntry];
      setOfflineQueue(newQueue);
      localStorage.setItem(`score-queue-${eventId}`, JSON.stringify(newQueue));

      // Reset form
      if (scoreEntry.synced) {
        setTeam1Score(0);
        setTeam2Score(0);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      // Queue for offline
      const newQueue = [...offlineQueue, scoreEntry];
      setOfflineQueue(newQueue);
      localStorage.setItem(`score-queue-${eventId}`, JSON.stringify(newQueue));
    } finally {
      setSubmitting(false);
    }
  }, [currentMatch, team1Score, team2Score, isConnected, offlineQueue, matches, eventId]);

  // Sync offline queue to server
  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || !isConnected) return;

    setSyncing(true);
    let successCount = 0;

    for (const entry of offlineQueue) {
      if (entry.synced) continue;

      try {
        const response = await fetch(`/api/matches/${entry.matchId}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team1_score_game1: entry.team1_score_game1,
            team2_score_game1: entry.team2_score_game1,
            team1_score_game2: entry.team1_score_game2,
            team2_score_game2: entry.team2_score_game2,
            team1_score_game3: entry.team1_score_game3,
            team2_score_game3: entry.team2_score_game3,
          }),
        });

        if (response.ok) {
          entry.synced = true;
          successCount++;
        }
      } catch (error) {
        console.error(`Error syncing entry for match ${entry.matchId}:`, error);
      }
    }

    const updatedQueue = offlineQueue.filter((e) => !e.synced);
    setOfflineQueue(updatedQueue);
    localStorage.setItem(`score-queue-${eventId}`, JSON.stringify(updatedQueue));
    setSyncing(false);

    return successCount;
  }, [offlineQueue, isConnected, eventId]);

  if (!currentMatch) {
    return (
      <div className="p-8 text-center bg-[#0C0F14] min-h-screen text-white">
        Loading matches...
      </div>
    );
  }

  return (
    <div className="bg-[#0C0F14] text-white min-h-screen p-4 flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center mb-4 p-3 bg-[#1A1F2E] rounded border border-[#00F260]/10">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#00F260]' : 'bg-red-500'}`}
          ></span>
          <span className="text-sm">
            {isConnected ? 'Online' : 'Offline'} — Queue: {offlineQueue.filter((e) => !e.synced).length}
          </span>
        </div>
        {offlineQueue.filter((e) => !e.synced).length > 0 && (
          <button
            onClick={syncOfflineQueue}
            disabled={!isConnected || syncing}
            className="px-3 py-1 bg-[#00F260]/20 text-[#00F260] rounded text-sm hover:bg-[#00F260]/30 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {/* Current Match */}
      <div className="flex-1 flex flex-col">
        {/* Match Header */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-[#FFB800] mb-2">Match #{currentMatch.matchNumber}</div>
          <div className="text-[#B8C4D4]">
            <div className="font-semibold">{currentMatch.team1}</div>
            <div className="text-sm my-1">vs</div>
            <div className="font-semibold">{currentMatch.team2}</div>
          </div>
        </div>

        {/* Game Selector */}
        <div className="flex gap-2 justify-center mb-6">
          {[1, 2, 3].map((g) => (
            <button
              key={g}
              onClick={() => setGame(g as 1 | 2 | 3)}
              className={`px-4 py-2 rounded font-semibold transition ${
                game === g
                  ? 'bg-[#00F260] text-[#0C0F14]'
                  : 'bg-[#1A1F2E] text-white border border-[#00F260]/20 hover:border-[#00F260]/50'
              }`}
            >
              Game {g}
            </button>
          ))}
        </div>

        {/* Score Entry */}
        <div className="flex-1 flex flex-col justify-center gap-8 mb-6">
          {/* Team 1 Score */}
          <div className="text-center">
            <div className="text-[#B8C4D4] mb-3">{currentMatch.team1}</div>
            <div className="text-6xl font-bold text-[#00F260] mb-6">{team1Score}</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setTeam1Score(Math.max(0, team1Score - 1))}
                className="px-6 py-3 bg-red-500/20 text-red-300 rounded-lg font-bold text-2xl hover:bg-red-500/30"
              >
                −
              </button>
              <button
                onClick={() => setTeam1Score(team1Score + 1)}
                className="px-6 py-3 bg-[#00F260]/20 text-[#00F260] rounded-lg font-bold text-2xl hover:bg-[#00F260]/30"
              >
                +
              </button>
            </div>
          </div>

          {/* Team 2 Score */}
          <div className="text-center">
            <div className="text-[#B8C4D4] mb-3">{currentMatch.team2}</div>
            <div className="text-6xl font-bold text-[#FFB800] mb-6">{team2Score}</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setTeam2Score(Math.max(0, team2Score - 1))}
                className="px-6 py-3 bg-red-500/20 text-red-300 rounded-lg font-bold text-2xl hover:bg-red-500/30"
              >
                −
              </button>
              <button
                onClick={() => setTeam2Score(team2Score + 1)}
                className="px-6 py-3 bg-[#FFB800]/20 text-[#FFB800] rounded-lg font-bold text-2xl hover:bg-[#FFB800]/30"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={submitScore}
        disabled={submitting || (team1Score === 0 && team2Score === 0)}
        className="w-full py-4 bg-[#00F260] text-[#0C0F14] font-bold rounded-lg text-lg hover:bg-[#00F260]/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {submitting ? 'Submitting...' : 'Submit Score'}
      </button>

      {/* Match List (small) */}
      <div className="mt-6 pt-4 border-t border-[#00F260]/10">
        <div className="text-xs text-[#B8C4D4] mb-2">Other Matches</div>
        <div className="max-h-24 overflow-y-auto">
          {matches
            .filter((m) => m.id !== currentMatch.id)
            .map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setCurrentMatch(m);
                  setTeam1Score(0);
                  setTeam2Score(0);
                }}
                className="w-full text-left px-2 py-1 text-xs text-[#B8C4D4] hover:bg-[#1A1F2E] rounded mb-1"
              >
                {m.matchNumber}: {m.team1} vs {m.team2}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
