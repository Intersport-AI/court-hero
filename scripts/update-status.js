#!/usr/bin/env node

/**
 * REPORTING AGENT: Auto-update sprint status every 5 minutes
 * This script is meant to run via cron or process manager
 */

const fs = require('fs');
const path = require('path');

const statusFile = path.join(__dirname, '../public/sprint-status.json');

function updateStatus() {
  try {
    // Read current status
    const currentStatus = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
    
    // Update timestamp
    currentStatus.timestamp = new Date().toISOString();
    
    // Update progress based on active tickets
    const inProgressTickets = currentStatus.active_tickets.filter(t => t.status === 'IN_PROGRESS');
    const completedTickets = currentStatus.active_tickets.filter(t => t.status === 'COMPLETED');
    
    currentStatus.sprint.completed = completedTickets.length;
    currentStatus.sprint.in_progress = inProgressTickets.length;
    currentStatus.sprint.progress_percent = Math.round(
      (completedTickets.length / currentStatus.sprint.total_tickets) * 100
    );
    
    // Write back
    fs.writeFileSync(statusFile, JSON.stringify(currentStatus, null, 2));
    
    console.log(`✅ Status updated at ${new Date().toISOString()}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Status update failed:', error.message);
    process.exit(1);
  }
}

updateStatus();
