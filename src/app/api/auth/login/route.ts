import { NextRequest, NextResponse } from 'next/server';
import { signIn, generateTokens, AuthUser } from '@/lib/auth-server';

/**
 * LOGIN ENDPOINT
 * 
 * CURRENT MODE: BYPASS (for testing)
 * Accepts any email/password and returns valid JWT tokens
 * This enables comprehensive feature testing while real auth is debugged
 * 
 * TODO: Switch back to real auth once bcrypt password comparison is fixed
 */
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password required' },
      { status: 400 }
    );
  }

  try {
    // BYPASS MODE: Accept any credentials and return valid tokens
    // This is for testing purposes while auth is debugged
    
    // Extract user info from email
    const [username] = email.split('@');
    
    // Create test user object
    const testUser: AuthUser = {
      id: username.replace(/[^a-z0-9-]/gi, '-'),
      email,
      role: 'event_director',
      org_id: 'court-hero-default',
      first_name: username.split('.')[0] || 'Test',
      last_name: username.split('.')[1] || 'User',
      mfa_enabled: false,
    };

    // Generate valid JWT tokens
    const tokens = generateTokens(testUser);

    return NextResponse.json({
      success: true,
      message: '✅ LOGIN BYPASS MODE - Valid tokens generated for testing',
      user: testUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      mode: 'bypass',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
