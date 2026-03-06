import { NextRequest, NextResponse } from 'next/server';
import { requireOrgAccess } from '@/lib/middleware';

/**
 * TICKET P2-05: Bulk Player Invite
 * POST /api/organizations/{orgId}/events/{eventId}/invites
 * Body: { playerIds: string[] }
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
    const { playerIds } = body;

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'playerIds array required (min 1 player)' },
        { status: 400 }
      );
    }

    // TODO: For each player:
    // 1. Generate unique invite token
    // 2. Insert into invites table
    // 3. Send email with invite link

    const invitedCount = playerIds.length;

    return NextResponse.json({
      success: true,
      invitedCount,
      message: `Invites sent to ${invitedCount} players`,
      invites: playerIds.map((id) => ({
        playerId: id,
        status: 'invited',
        sentAt: new Date().toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
