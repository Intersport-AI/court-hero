import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

let io: SocketIOServer | null = null;
let pubClient: any = null;
let subClient: any = null;

/**
 * Initialize Socket.IO server with Redis adapter
 * Call this once at app startup
 */
export async function initializeSocket(httpServer: any): Promise<SocketIOServer> {
  if (io) return io;

  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    // Create Redis clients
    pubClient = createClient({ url: REDIS_URL });
    subClient = pubClient.duplicate();

    // Connect with timeout
    const connectPromise = Promise.all([
      pubClient.connect().catch((err: any) => {
        console.warn('Redis pub client connection failed:', err);
        throw err;
      }),
      subClient.connect().catch((err: any) => {
        console.warn('Redis sub client connection failed:', err);
        throw err;
      }),
    ]);

    await connectPromise;

    // Initialize Socket.IO with Redis adapter
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      adapter: createAdapter(pubClient, subClient),
    });
  } catch (error) {
    // Fallback: use default in-memory adapter if Redis fails
    console.warn('Redis connection failed, using in-memory adapter for development:', error);
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });
  }

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Subscribe to event channels
    socket.on('subscribe_event', (eventId: string) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('subscribe_division', (divisionId: string) => {
      socket.join(`division:${divisionId}`);
    });

    socket.on('subscribe_match', (matchId: string) => {
      socket.join(`match:${matchId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get Socket.IO instance
 */
export function getSocket(): SocketIOServer | null {
  return io;
}

/**
 * Broadcast a score update to all watchers of a match
 */
export function broadcastScoreUpdate(
  matchId: string,
  divisionId: string,
  eventId: string,
  scoreData: any
) {
  if (!io) return;

  // Send to all subscribed clients
  io.to(`match:${matchId}`).emit('score_updated', {
    matchId,
    ...scoreData,
    timestamp: new Date().toISOString(),
  });

  // Also broadcast to division leaderboard subscribers
  io.to(`division:${divisionId}`).emit('leaderboard_updated', {
    divisionId,
    matchId,
    timestamp: new Date().toISOString(),
  });

  // Broadcast to event command center
  io.to(`event:${eventId}`).emit('match_completed', {
    matchId,
    divisionId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify players their match is being called
 */
export function broadcastMatchCall(matchId: string, eventId: string, matchData: any) {
  if (!io) return;

  io.to(`event:${eventId}`).emit('match_called', {
    matchId,
    ...matchData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast schedule change
 */
export function broadcastScheduleChange(eventId: string, scheduleData: any) {
  if (!io) return;

  io.to(`event:${eventId}`).emit('schedule_changed', {
    ...scheduleData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast bracket/standings update
 */
export function broadcastBracketUpdate(divisionId: string, bracketData: any) {
  if (!io) return;

  io.to(`division:${divisionId}`).emit('bracket_updated', {
    ...bracketData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Clean up Socket.IO on shutdown
 */
export async function closeSocket() {
  if (io) {
    await io.close();
    io = null;
  }
  if (pubClient) {
    await pubClient.quit();
    pubClient = null;
  }
  if (subClient) {
    await subClient.quit();
    subClient = null;
  }
}
