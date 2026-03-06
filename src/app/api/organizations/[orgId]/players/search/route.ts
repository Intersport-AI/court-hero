import { NextRequest, NextResponse } from 'next/server';
import { requireOrgAccess } from '@/lib/middleware';

/**
 * TICKET P2-05: Player Search & Invite
 * GET /api/organizations/{orgId}/players/search?query=name
 * POST /api/organizations/{orgId}/events/{eventId}/invites
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  try {
    const authResult = await requireOrgAccess(req, orgId);
    if (!authResult.valid) {
      return authResult.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';

    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // TODO: Query players table with LIKE %query%
    // const results = await db.query(
    //   `SELECT id, name, email, rating, wins, losses, tournament_count
    //    FROM players
    //    WHERE org_id=$1 AND (name ILIKE $2 OR email ILIKE $2)
    //    LIMIT 50`,
    //   [orgId, `%${query}%`]
    // );

    const mockResults = [
      { id: 'p1', name: 'Sarah Johnson', email: 'sarah@example.com', rating: 3.8, wins: 24, losses: 14, tournamentCount: 12 },
      { id: 'p2', name: 'Mike Chen', email: 'mike@example.com', rating: 3.5, wins: 20, losses: 18, tournamentCount: 10 },
    ];

    return NextResponse.json({
      success: true,
      results: mockResults,
      count: mockResults.length,
    });
  } catch (error: any) {
    console.error('Player search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
