#!/usr/bin/env node

/**
 * Socket.IO Load Test
 * Simulates up to 10K concurrent connections with realistic traffic patterns
 * Usage: node load-test.js --connections 1000 --duration 60 --rps 100
 */

const { io } = require('socket.io-client');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('connections', {
    alias: 'c',
    description: 'Number of concurrent connections to establish',
    type: 'number',
    default: 1000,
  })
  .option('duration', {
    alias: 'd',
    description: 'Test duration in seconds',
    type: 'number',
    default: 60,
  })
  .option('rps', {
    alias: 'r',
    description: 'Request per second (messages sent across all connections)',
    type: 'number',
    default: 100,
  })
  .option('host', {
    alias: 'h',
    description: 'Server host',
    type: 'string',
    default: 'localhost',
  })
  .option('port', {
    alias: 'p',
    description: 'Server port',
    type: 'number',
    default: 3000,
  })
  .argv;

const SERVER_URL = `http://${argv.host}:${argv.port}`;
const TARGET_CONNECTIONS = argv.connections;
const TEST_DURATION_MS = argv.duration * 1000;
const TARGET_RPS = argv.rps;

// Metrics
let metrics = {
  connectionsEstablished: 0,
  connectionsFailed: 0,
  disconnections: 0,
  messagesSent: 0,
  messagesReceived: 0,
  errors: 0,
  latencies: [],
  startTime: Date.now(),
  endTime: null,
};

// Connection pool
const sockets = [];
let testRunning = true;
let connectionCounter = 0;

/**
 * Create a single Socket.IO client
 */
function createClient(clientId) {
  return new Promise((resolve) => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: false,
      autoConnect: true,
      query: {
        clientId: `load-test-${clientId}`,
      },
    });

    socket.on('connect', () => {
      metrics.connectionsEstablished++;

      // Subscribe to channels
      const eventId = `event-${Math.floor(Math.random() * 10)}`;
      const divisionId = `div-${Math.floor(Math.random() * 50)}`;
      const matchId = `match-${Math.floor(Math.random() * 500)}`;

      socket.emit('subscribe_event', eventId);
      socket.emit('subscribe_division', divisionId);
      socket.emit('subscribe_match', matchId);

      resolve(socket);
    });

    socket.on('disconnect', () => {
      metrics.disconnections++;
    });

    socket.on('score_updated', (data) => {
      metrics.messagesReceived++;
      if (data.timestamp) {
        const latency = Date.now() - new Date(data.timestamp).getTime();
        metrics.latencies.push(latency);
      }
    });

    socket.on('leaderboard_updated', () => {
      metrics.messagesReceived++;
    });

    socket.on('bracket_updated', () => {
      metrics.messagesReceived++;
    });

    socket.on('error', (error) => {
      metrics.errors++;
      console.error(`[Socket ${clientId}] Error:`, error);
    });

    // Timeout after 30s if no connection
    setTimeout(() => {
      if (!socket.connected) {
        metrics.connectionsFailed++;
        socket.disconnect();
        resolve(null);
      }
    }, 30000);
  });
}

/**
 * Establish connections with rate limiting
 */
async function establishConnections() {
  console.log(`\n📊 Starting load test...`);
  console.log(`   Target: ${TARGET_CONNECTIONS} connections`);
  console.log(`   Duration: ${argv.duration}s`);
  console.log(`   Target RPS: ${TARGET_RPS}`);
  console.log(`   Server: ${SERVER_URL}\n`);

  const startTime = Date.now();
  let createdCount = 0;

  while (createdCount < TARGET_CONNECTIONS && testRunning) {
    const socket = await createClient(connectionCounter++);
    if (socket) {
      sockets.push(socket);
      createdCount++;

      if (createdCount % 100 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = createdCount / elapsed;
        console.log(`   [${elapsed.toFixed(1)}s] ${createdCount}/${TARGET_CONNECTIONS} connections (${rate.toFixed(0)} conn/s)`);
      }

      // Rate limit connection establishment (max 100 connections/sec)
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  console.log(`\n✅ Established ${sockets.length} connections\n`);
}

/**
 * Simulate realistic message traffic
 */
function startTrafficSimulation() {
  const messagesPerInterval = Math.max(1, TARGET_RPS / 10); // Send every 100ms
  const interval = setInterval(() => {
    if (!testRunning) {
      clearInterval(interval);
      return;
    }

    for (let i = 0; i < messagesPerInterval && sockets.length > 0; i++) {
      const socket = sockets[Math.floor(Math.random() * sockets.length)];
      if (socket && socket.connected) {
        const messageType = Math.floor(Math.random() * 3);
        const timestamp = new Date().toISOString();

        switch (messageType) {
          case 0:
            socket.emit('score_update', {
              matchId: `match-${Math.floor(Math.random() * 500)}`,
              team1_score: Math.floor(Math.random() * 21),
              team2_score: Math.floor(Math.random() * 21),
              timestamp,
            });
            break;
          case 1:
            socket.emit('schedule_change', {
              eventId: `event-${Math.floor(Math.random() * 10)}`,
              timestamp,
            });
            break;
          case 2:
            socket.emit('bracket_update', {
              divisionId: `div-${Math.floor(Math.random() * 50)}`,
              matchId: `match-${Math.floor(Math.random() * 500)}`,
              timestamp,
            });
            break;
        }
        metrics.messagesSent++;
      }
    }
  }, 100);
}

/**
 * Print metrics
 */
function printMetrics() {
  const elapsed = (metrics.endTime - metrics.startTime) / 1000;
  const avgLatency = metrics.latencies.length > 0
    ? metrics.latencies.reduce((a, b) => a + b) / metrics.latencies.length
    : 0;
  const p99Latency =
    metrics.latencies.length > 0
      ? metrics.latencies.sort((a, b) => a - b)[Math.floor(metrics.latencies.length * 0.99)]
      : 0;

  console.log(`\n📈 Load Test Results (${elapsed.toFixed(1)}s)\n`);
  console.log(`   Connections:`);
  console.log(`     ✓ Established: ${metrics.connectionsEstablished}`);
  console.log(`     ✗ Failed: ${metrics.connectionsFailed}`);
  console.log(`     ✗ Disconnected: ${metrics.disconnections}`);
  console.log(`   Messages:`);
  console.log(`     → Sent: ${metrics.messagesSent} (${(metrics.messagesSent / elapsed).toFixed(0)} msg/s)`);
  console.log(`     ← Received: ${metrics.messagesReceived}`);
  console.log(`   Latency:`);
  console.log(`     AVG: ${avgLatency.toFixed(0)}ms`);
  console.log(`     P99: ${p99Latency.toFixed(0)}ms`);
  console.log(`   Errors: ${metrics.errors}`);
  console.log(`\n   Status: ${metrics.connectionsEstablished > TARGET_CONNECTIONS * 0.95 ? '✅ PASS' : '❌ FAIL'}\n`);
}

/**
 * Main test runner
 */
async function runTest() {
  // Establish connections
  await establishConnections();

  // Start traffic
  startTrafficSimulation();

  // Wait for test duration
  await new Promise((resolve) => setTimeout(resolve, TEST_DURATION_MS));

  // Stop test
  testRunning = false;
  metrics.endTime = Date.now();

  // Disconnect all
  console.log('\n🔌 Disconnecting clients...');
  sockets.forEach((socket) => socket.disconnect());

  // Print results
  setTimeout(() => {
    printMetrics();
    process.exit(0);
  }, 2000);
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  testRunning = false;
  metrics.endTime = Date.now();
  console.log('\n⏹️  Test interrupted');
  sockets.forEach((socket) => socket.disconnect());
  setTimeout(() => {
    printMetrics();
    process.exit(0);
  }, 2000);
});

// Run
runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
