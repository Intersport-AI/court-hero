import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, AuthUser } from '@/lib/auth-server';

/**
 * DEVELOPMENT ONLY: Generate a test JWT token for testing protected endpoints
 * This bypasses authentication for testing purposes
 */
export async function POST(req: NextRequest) {
  const { email = 'test@courthero.app', userId = 'test-user-id', orgId = 'court-hero-default' } = await req.json();

  try {
    const testUser: AuthUser = {
      id: userId,
      email,
      role: 'event_director',
      org_id: orgId,
      first_name: 'Test',
      last_name: 'User',
      mfa_enabled: false,
    };

    const tokens = generateTokens(testUser);

    return NextResponse.json({
      success: true,
      message: 'Test token generated (development only)',
      user: testUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
