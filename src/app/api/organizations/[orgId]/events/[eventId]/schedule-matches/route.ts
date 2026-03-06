import { NextRequest, NextResponse } from 'next/server';
import { requireOrgAccess } from '@/lib/middleware';

/**
 * TICKET P3-02: Integration with Scheduling Microservice
 * POST /api/organizations/{orgId}/events/{eventId}/schedule-matches
 * Calls Python OR-Tools scheduler, returns optimized match schedule
 */

const SCHEDULER_URL = process.env.SCHEDULER_SERVICE_URL || 'http://localhost:8000';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
  const { orgId, eventId } = await params;

  try {
    const authResult = await requireOrgAccess(req, orgId);
    if (!authResult.valid) {
      return authResult.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { matches, courts, startTime, endTime } = body;

    if (!matches || !courts || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'matches, courts, startTime, endTime required' },
        { status: 400 }
      );
    }

    // Call Python scheduler service
    const schedulerResponse = await fetch(`${SCHEDULER_URL}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matches: matches.map((m: any) => ({ id: m.id, team1: m.team1, team2: m.team2 })),
        courts: courts.map((c: any) => ({ id: c.id, name: c.name })),
        start_time: startTime,
        end_time: endTime,
      }),
    });

    if (!schedulerResponse.ok) {
      const error = await schedulerResponse.text();
      console.error('Scheduler error:', error);
      return NextResponse.json(
        { error: 'Scheduling failed', details: error },
        { status: 500 }
      );
    }

    const scheduledResult = await schedulerResponse.json();

    // TODO: Persist schedule to database
    // await db.query(
    //   `INSERT INTO match_schedules (event_id, match_id, court_id, scheduled_time)
    //    VALUES ($1, $2, $3, $4)`,
    //   [eventId, match.match_id, match.court_id, match.start_time]
    // );

    return NextResponse.json({
      success: true,
      eventId,
      schedule: scheduledResult.schedule,
      stats: scheduledResult.stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Schedule endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
