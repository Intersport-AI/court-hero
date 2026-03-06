'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import Link from 'next/link';

interface Match {
  id: string;
  eventId: string;
  eventName: string;
  matchNumber: number;
  opponent: string;
  court: string;
  scheduledTime: string;
  status: 'pending' | 'in-progress' | 'completed';
  myScore?: number;
  opponentScore?: number;
}

export default function PlayerDashboard() {
  const { onScoreUpdate, onMatchCall } = useSocket();
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [inProgressMatches, setInProgressMatches] = useState<Match[]>([]);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  // Load player matches
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch('/api/players/me/matches');
        if (response.ok) {
          const data = await response.json();
          const upcoming = data.filter((m: Match) => m.status === 'pending');
          const inProgress = data.filter((m: Match) => m.status === 'in-progress');
          
          setUpcomingMatches(upcoming);
          setInProgressMatches(inProgress);
          
          if (upcoming.length > 0) {
            setNextMatch(upcoming[0]);
          }
        }
      } catch (error) {
        console.error('Error loading matches:', error);
      }
    };

    loadMatches();
  }, []);

  // Countdown timer for next match
  useEffect(() => {
    if (!nextMatch) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const matchTime = new Date(nextMatch.scheduledTime).getTime();
      const diff = matchTime - now;

      if (diff <= 0) {
        setCountdown('Starting now!');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextMatch]);

  // Real-time score updates
  useEffect(() => {
    const unsubscribe = onScoreUpdate((data) => {
      setInProgressMatches((prev) =>
        prev.map((m) =>
          m.id === data.matchId
            ? { ...m, myScore: data.team1_score_game1, opponentScore: data.team2_score_game1 }
            : m
        )
      );
    });
    return unsubscribe;
  }, [onScoreUpdate]);

  // Match call notifications
  useEffect(() => {
    const unsubscribe = onMatchCall((data) => {
      if (upcomingMatches.find((m) => m.id === data.matchId)) {
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Match Called!', {
            body: `Your match is starting on ${data.court}`,
            icon: '/logo.png',
          });
        }
      }
    });
    return unsubscribe;
  }, [onMatchCall, upcomingMatches]);

  return (
    <div className="bg-[#0C0F14] text-white min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#FFB800] mb-2">My Dashboard</h1>
          <p className="text-[#B8C4D4]">Track your matches and upcoming events</p>
        </div>

        {/* Next Match Countdown */}
        {nextMatch && (
          <div className="bg-gradient-to-r from-[#00F260]/20 to-[#FFB800]/20 border-2 border-[#00F260] rounded-lg p-8 mb-8">
            <div className="text-center">
              <div className="text-sm text-[#B8C4D4] mb-2">NEXT MATCH</div>
              <h2 className="text-3xl font-bold mb-4">{nextMatch.eventName}</h2>
              <div className="text-2xl text-[#B8C4D4] mb-2">vs {nextMatch.opponent}</div>
              <div className="text-6xl font-bold text-[#00F260] mb-4">{countdown}</div>
              <div className="flex gap-4 justify-center text-sm text-[#B8C4D4]">
                <span>🏟️ Court {nextMatch.court}</span>
                <span>📅 {new Date(nextMatch.scheduledTime).toLocaleString()}</span>
              </div>
              <Link
                href={`/event/${nextMatch.eventId}/live-scoring`}
                className="inline-block mt-6 px-6 py-3 bg-[#00F260] text-[#0C0F14] font-bold rounded-lg hover:bg-[#00F260]/80"
              >
                View Match
              </Link>
            </div>
          </div>
        )}

        {/* In-Progress Matches */}
        {inProgressMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🔴 Live Now</h2>
            <div className="space-y-4">
              {inProgressMatches.map((match) => (
                <Link key={match.id} href={`/event/${match.eventId}/live-scoring`}>
                  <div className="bg-[#1A1F2E] p-6 rounded-lg border border-blue-500/50 hover:border-blue-500 transition cursor-pointer">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-lg font-bold">{match.eventName}</div>
                        <div className="text-sm text-[#B8C4D4]">Match #{match.matchNumber} • Court {match.court}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-sm text-blue-300">LIVE</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xl">vs {match.opponent}</div>
                      <div className="text-3xl font-bold">
                        <span className="text-[#00F260]">{match.myScore || 0}</span>
                        <span className="text-[#B8C4D4] mx-2">-</span>
                        <span className="text-[#FFB800]">{match.opponentScore || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">📅 Upcoming</h2>
            <div className="bg-[#1A1F2E] rounded-lg overflow-hidden border border-[#00F260]/10">
              <table className="w-full">
                <thead className="bg-[#0C0F14] border-b border-[#00F260]/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-[#00F260]">Event</th>
                    <th className="px-4 py-3 text-left text-[#00F260]">Match #</th>
                    <th className="px-4 py-3 text-left text-[#00F260]">Opponent</th>
                    <th className="px-4 py-3 text-left text-[#00F260]">Court</th>
                    <th className="px-4 py-3 text-left text-[#00F260]">Time</th>
                    <th className="px-4 py-3 text-left text-[#00F260]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingMatches.map((match) => (
                    <tr
                      key={match.id}
                      className="border-b border-[#00F260]/5 hover:bg-[#0C0F14]/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/event/${match.eventId}`}
                          className="text-[#00F260] hover:text-[#00F260]/80"
                        >
                          {match.eventName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#FFB800]">{match.matchNumber}</td>
                      <td className="px-4 py-3">{match.opponent}</td>
                      <td className="px-4 py-3">{match.court || 'TBD'}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(match.scheduledTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-300">
                          Scheduled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {upcomingMatches.length === 0 && inProgressMatches.length === 0 && (
          <div className="text-center py-12 bg-[#1A1F2E] rounded-lg border border-[#00F260]/10">
            <div className="text-xl text-[#B8C4D4] mb-4">No upcoming matches</div>
            <Link
              href="/discover"
              className="inline-block px-6 py-3 bg-[#00F260] text-[#0C0F14] font-bold rounded-lg hover:bg-[#00F260]/80"
            >
              Discover Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
