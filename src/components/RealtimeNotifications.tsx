'use client';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  type: 'match_update' | 'score_change' | 'match_start' | 'tournament_update';
  message: string;
  timestamp: number;
  data?: any;
}

export function RealtimeNotifications({ eventId, userId }: { eventId: string; userId?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('subscribe_event', { eventId });
      if (userId) {
        newSocket.emit('subscribe_user', { userId });
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('match_update', (data: any) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'match_update',
        message: `Match ${data.matchId}: ${data.team1} vs ${data.team2}`,
        timestamp: Date.now(),
        data,
      };
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    });

    newSocket.on('score_change', (data: any) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'score_change',
        message: `Score updated: ${data.team1} ${data.score1} - ${data.score2} ${data.team2}`,
        timestamp: Date.now(),
        data,
      };
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    });

    newSocket.on('match_start', (data: any) => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'match_start',
        message: `Match started on ${data.court}`,
        timestamp: Date.now(),
        data,
      };
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [eventId, userId]);

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-[600px] overflow-y-auto space-y-2 z-50">
      {!connected && (
        <div className="bg-[#FFB800]/10 border border-[#FFB800]/20 text-[#FFB800] rounded-lg px-4 py-3 text-[13px] font-medium">
          🔴 Real-time connection offline (attempting reconnect)
        </div>
      )}

      {connected && notifications.length === 0 && (
        <div className="bg-[#00F260]/10 border border-[#00F260]/20 text-[#00F260] rounded-lg px-4 py-3 text-[13px] font-medium">
          ✓ Real-time updates enabled
        </div>
      )}

      {notifications.map((notif) => (
        <div key={notif.id}
          className={`rounded-lg px-4 py-3 text-[13px] font-medium animate-slide-in ${
            notif.type === 'score_change'
              ? 'bg-[#0AE87F]/10 border border-[#0AE87F]/20 text-[#0AE87F]'
              : notif.type === 'match_start'
              ? 'bg-[#00F260]/10 border border-[#00F260]/20 text-[#00F260]'
              : 'bg-[#00F260]/5 border border-[#00F260]/10 text-[#B8C4D4]'
          }`}>
          {notif.message}
        </div>
      ))}
    </div>
  );
}

export function MatchScoreUpdater({ matchId, eventId }: { matchId: string; eventId: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      newSocket.emit('subscribe_match', { matchId, eventId });
    });

    newSocket.on('score_updated', (data: any) => {
      setTeam1Score(data.team1Score);
      setTeam2Score(data.team2Score);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [matchId, eventId]);

  const submitScore = (team: 1 | 2, newScore: number) => {
    if (!socket) return;
    socket.emit('update_score', {
      matchId,
      eventId,
      team,
      score: newScore,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="bg-[#111827]/40 border border-white/[0.06] rounded-2xl p-6">
      <h3 className="text-white font-bold mb-4">Live Score</h3>
      <div className="flex items-center justify-between gap-4">
        <div className="text-center">
          <div className="text-[48px] font-bold text-[#00F260]">{team1Score}</div>
          <button onClick={() => submitScore(1, team1Score + 1)}
            className="mt-2 bg-[#00F260]/10 text-[#00F260] px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#00F260]/20 transition-all">
            +1
          </button>
        </div>
        <div className="text-[#8B9DB8] text-[18px] font-bold">vs</div>
        <div className="text-center">
          <div className="text-[48px] font-bold text-[#00F260]">{team2Score}</div>
          <button onClick={() => submitScore(2, team2Score + 1)}
            className="mt-2 bg-[#00F260]/10 text-[#00F260] px-4 py-2 rounded-lg text-[13px] font-bold hover:bg-[#00F260]/20 transition-all">
            +1
          </button>
        </div>
      </div>
    </div>
  );
}
