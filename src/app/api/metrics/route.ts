import { NextResponse } from 'next/server';

export async function GET() {
  // Socket.IO metrics would be tracked server-side
  // For Vercel serverless, we return basic metrics
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV,
    },
    // These would be populated by Socket.IO in production
    socketIO: {
      activeConnections: 0, // Track via Redis in production
      messagesPerSecond: 0,
      averageLatency: 0,
    },
  });
}
