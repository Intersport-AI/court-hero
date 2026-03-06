'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { io, Socket } from 'socket.io-client';

interface Match {
  id: string;
  team1: string;
  team2: string;
  court: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  team1_score: number;
  team2_score: number;
}

export default function LiveScoringPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // Mock matches data
  useEffect(() => {
    const mockMatches: Match[] = [
      { id: '1', team1: 'Smith / Jones', team2: 'Chen / Lee', court: 'Court 1', status: 'in-progress', team1_score: 8, team2_score: 6 },
      { id: '2', team1: 'Davis / Brown', team2: 'Wilson / Taylor', court: 'Court 2', status: 'in-progress', team1_score: 5, team2_score: 9 },
      { id: '3', team1: 'Garcia / Martinez', team2: 'Anderson / Thomas', court: 'Court 3', status: 'scheduled', team1_score: 0, team2_score: 0 },
    ];
    setMatches(mockMatches);
    setSelectedMatch(mockMatches[0]);

    // Initialize Socket.IO
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('subscribe_event', { eventId });
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('match_updated', (data: any) => {
      setMatches(prev => prev.map(m => 
        m.id === data.matchId 
          ? { ...m, ...data }
          : m
      ));
      if (selectedMatch?.id === data.matchId) {
        setSelectedMatch({ ...selectedMatch, ...data });
      }
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [eventId]);

  const updateScore = (matchId: string, team: 1 | 2, delta: number) => {
    if (!socket) return;
    socket.emit('score_update', { matchId, eventId, team, delta });
  };

  const endMatch = (matchId: string) => {
    if (!socket) return;
    socket.emit('end_match', { matchId, eventId });
  };

  return (
    <div className="min-h-screen bg-[#0C0F14]">
      <Header />
      <div className="max-w-7xl mx-auto pt-8 px-6 pb-12">
        {/* Header with connection status */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-[40px] font-bold">Live Scoring</h1>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[13px] ${
            connected 
              ? 'bg-[#00F260]/10 text-[#00F260]' 
              : 'bg-red-500/10 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#00F260] animate-pulse' : 'bg-red-400'}`}></span>
            {connected ? 'CONNECTED' : 'CONNECTING...'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matches List */}
          <div className="lg:col-span-1">
            <h2 className="text-white text-[18px] font-bold mb-4">Matches</h2>
            <div className="space-y-3">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedMatch?.id === match.id
                      ? 'bg-[#00F260]/10 border-[#00F260]/30'
                      : 'bg-[#111827]/40 border-white/[0.06] hover:border-white/[0.1]'
                  }`}>
                  <p className="text-[13px] font-medium text-[#8B9DB8] mb-1">{match.court}</p>
                  <p className="text-white text-[13px] font-bold mb-3">{match.team1}</p>
                  <p className="text-white text-[13px] font-bold">vs {match.team2}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/[0.06]">
                    <span className={`text-[14px] font-bold ${
                      match.status === 'in-progress' ? 'text-[#00F260]' : 'text-[#8B9DB8]'
                    }`}>
                      {match.team1_score}-{match.team2_score}
                    </span>
                    <span className="text-[11px] px-2 py-1 rounded bg-white/[0.05] text-[#8B9DB8]">
                      {match.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Score Control */}
          {selectedMatch && (
            <div className="lg:col-span-2">
              <h2 className="text-white text-[18px] font-bold mb-4">Score Entry</h2>
              <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-8">
                {/* Court Info */}
                <p className="text-[#8B9DB8] text-[13px] font-medium mb-6">{selectedMatch.court}</p>

                {/* Score Display */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                  {/* Team 1 */}
                  <div className="text-center">
                    <p className="text-[#B8C4D4] text-[13px] font-medium mb-3 text-ellipsis overflow-hidden">
                      {selectedMatch.team1}
                    </p>
                    <div className="bg-[#0A0D12] rounded-2xl p-6 border border-white/[0.08] mb-4">
                      <p className="text-[#00F260] text-[64px] font-bold">{selectedMatch.team1_score}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateScore(selectedMatch.id, 1, -1)}
                        className="flex-1 bg-red-500/10 text-red-400 py-3 rounded-lg font-bold hover:bg-red-500/20 transition-all">
                        −
                      </button>
                      <button
                        onClick={() => updateScore(selectedMatch.id, 1, 1)}
                        className="flex-1 bg-[#00F260]/10 text-[#00F260] py-3 rounded-lg font-bold hover:bg-[#00F260]/20 transition-all">
                        +
                      </button>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="flex items-center justify-center">
                    <p className="text-[#8B9DB8] text-[20px] font-bold">VS</p>
                  </div>

                  {/* Team 2 */}
                  <div className="text-center">
                    <p className="text-[#B8C4D4] text-[13px] font-medium mb-3 text-ellipsis overflow-hidden">
                      {selectedMatch.team2}
                    </p>
                    <div className="bg-[#0A0D12] rounded-2xl p-6 border border-white/[0.08] mb-4">
                      <p className="text-[#FFB800] text-[64px] font-bold">{selectedMatch.team2_score}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateScore(selectedMatch.id, 2, -1)}
                        className="flex-1 bg-red-500/10 text-red-400 py-3 rounded-lg font-bold hover:bg-red-500/20 transition-all">
                        −
                      </button>
                      <button
                        onClick={() => updateScore(selectedMatch.id, 2, 1)}
                        className="flex-1 bg-[#FFB800]/10 text-[#FFB800] py-3 rounded-lg font-bold hover:bg-[#FFB800]/20 transition-all">
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="border-t border-white/[0.06] pt-6">
                  <p className="text-[#8B9DB8] text-[13px] mb-4">Match Status: <span className="text-white font-bold">{selectedMatch.status}</span></p>
                  <button
                    onClick={() => endMatch(selectedMatch.id)}
                    disabled={selectedMatch.status === 'completed'}
                    className="w-full bg-[#00F260] text-black py-4 rounded-xl font-bold hover:bg-[#00D954] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    {selectedMatch.status === 'completed' ? '✓ Match Completed' : 'End Match'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
