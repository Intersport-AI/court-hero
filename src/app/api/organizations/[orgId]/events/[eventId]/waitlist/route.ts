import { NextRequest, NextResponse } from 'next/server';
import { requireOrgAccess } from '@/lib/middleware';

/**
 * TICKET P2-02: Waitlist Management
 * POST /api/organizations/{orgId}/events/{eventId}/waitlist
 * GET /api/organizations/{orgId}/events/{eventId}/waitlist/{playerId}
 */

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
    const { playerId, divisionId } = body;

    if (!playerId || !divisionId) {
      return NextResponse.json(
        { error: 'playerId and divisionId required' },
        { status: 400 }
      );
    }

    // TODO: Insert into waitlist table
    // const result = await db.query(
    //   `INSERT INTO waitlist (player_id, event_id, division_id, position, created_at)
    //    VALUES ($1, $2, $3, (SELECT COUNT(*)+1 FROM waitlist WHERE event_id=$2 AND division_id=$3), NOW())
    //    RETURNING id, position`,
    //   [playerId, eventId, divisionId]
    // );

    return NextResponse.json({
      success: true,
      waitlist_entry: {
        playerId,
        eventId,
        divisionId,
        position: 1, // Mock
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
  const { orgId, eventId } = await params;

  try {
    const authResult = await requireOrgAccess(req, orgId);
    if (!authResult.valid) {
      return authResult.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'playerId query parameter required' },
        { status: 400 }
      );
    }

    // TODO: Query waitlist position
    // const result = await db.query(
    //   `SELECT position, created_at FROM waitlist 
    //    WHERE player_id=$1 AND event_id=$2`,
    //   [playerId, eventId]
    // );

    return NextResponse.json({
      success: true,
      waitlist: {
        playerId,
        eventId,
        position: 1, // Mock
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Waitlist fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
