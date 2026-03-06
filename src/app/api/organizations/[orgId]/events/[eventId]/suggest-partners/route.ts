import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireOrgAccess } from '@/lib/middleware';
import { suggestPartners } from '@/lib/partner-matching';

/**
 * TICKET P2-01: Partner Matching Endpoint
 * POST /api/organizations/{orgId}/events/{eventId}/suggest-partners
 * 
 * Generates optimal partner pairings based on skill rating and history
 * Request body: { playerIds: string[] }
 * Response: { partnerships: Partnership[], timestamp: string }
 */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
  const { orgId, eventId } = await params;
  try {
    // Authorization
    const authResult = await requireOrgAccess(req, orgId);
    if (!authResult.valid) {
      return authResult.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const body = await req.json();
    const { playerIds } = body;

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length < 2) {
      return NextResponse.json(
        { error: 'Request must include playerIds array with at least 2 players' },
        { status: 400 }
      );
    }

    // TODO: Fetch player data from database
    // const players = await db.query(
    //   `SELECT id, name, rating, wins, losses, previous_partners
    //    FROM players WHERE id = ANY($1) AND event_id = $2`,
    //   [playerIds, eventId]
    // );

    // Mock player data for now (in production, fetch from DB)
    const players = playerIds.map((id: string, idx: number) => ({
      id,
      name: `Player ${idx + 1}`,
      rating: 2.5 + Math.random() * 2.0,
      wins: Math.floor(Math.random() * 30),
      losses: Math.floor(Math.random() * 20),
      previousPartners: [],
    }));

    // Generate suggestions
    const partnerships = suggestPartners(players);

    return NextResponse.json({
      success: true,
      partnerships,
      timestamp: new Date().toISOString(),
      eventId,
      stats: {
        total_players: playerIds.length,
        total_partnerships: partnerships.length,
        avg_confidence: partnerships.length > 0
          ? Math.round(partnerships.reduce((sum, p) => sum + p.confidence, 0) / partnerships.length)
          : 0,
      },
    });
  } catch (error: any) {
    console.error('Partner matching error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
