import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * useSocket Hook
 * Manages Socket.IO connection with auto-reconnect and subscription handling
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  // Initialize Socket.IO connection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (socketRef.current?.connected) {
      setIsLoading(false);
      setIsConnected(true);
      return;
    }

    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected:', socket.id);
      setIsConnected(true);
      setIsLoading(false);

      // Re-subscribe after reconnection
      subscriptionsRef.current.forEach((subscription) => {
        const [type, id] = subscription.split(':');
        if (type === 'event') {
          socket.emit('subscribe_event', id);
        } else if (type === 'division') {
          socket.emit('subscribe_division', id);
        } else if (type === 'match') {
          socket.emit('subscribe_match', id);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected');
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('[Socket.IO] Error:', error);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Subscribe to event updates
  const subscribeEvent = useCallback((eventId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe_event', eventId);
      subscriptionsRef.current.add(`event:${eventId}`);
    }
  }, []);

  // Subscribe to division updates
  const subscribeDivision = useCallback((divisionId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe_division', divisionId);
      subscriptionsRef.current.add(`division:${divisionId}`);
    }
  }, []);

  // Subscribe to match updates
  const subscribeMatch = useCallback((matchId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe_match', matchId);
      subscriptionsRef.current.add(`match:${matchId}`);
    }
  }, []);

  // Listen for score updates
  const onScoreUpdate = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('score_updated', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('score_updated', callback);
        }
      };
    }
  }, []);

  // Listen for leaderboard updates
  const onLeaderboardUpdate = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('leaderboard_updated', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('leaderboard_updated', callback);
        }
      };
    }
  }, []);

  // Listen for bracket updates
  const onBracketUpdate = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('bracket_updated', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('bracket_updated', callback);
        }
      };
    }
  }, []);

  // Listen for match calls
  const onMatchCall = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('match_called', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('match_called', callback);
        }
      };
    }
  }, []);

  // Listen for schedule changes
  const onScheduleChange = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('schedule_changed', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('schedule_changed', callback);
        }
      };
    }
  }, []);

  // Listen for match completion
  const onMatchCompleted = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('match_completed', callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off('match_completed', callback);
        }
      };
    }
  }, []);

  // Emit custom events
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isLoading,
    subscribeEvent,
    subscribeDivision,
    subscribeMatch,
    onScoreUpdate,
    onLeaderboardUpdate,
    onBracketUpdate,
    onMatchCall,
    onScheduleChange,
    onMatchCompleted,
    emit,
  };
}
