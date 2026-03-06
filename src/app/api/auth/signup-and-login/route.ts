import { NextRequest, NextResponse } from 'next/server';
import { signUp, signIn } from '@/lib/auth-server';

/**
 * Test endpoint: Sign up and immediately log in to test auth flow
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email = 'instant-test@courthero.app', password = 'TestPass123!', firstName = 'Instant', lastName = 'Test' } = body;

  try {
    // Step 1: Sign up
    console.log(`[TEST] Signing up: ${email}`);
    const signupResult = await signUp(email, password, firstName, lastName);
    console.log(`[TEST] Signup result:`, signupResult);

    if (!signupResult.success) {
      return NextResponse.json({
        stage: 'signup',
        success: false,
        error: signupResult.error,
      }, { status: 400 });
    }

    // Step 2: Immediately sign in with same credentials
    console.log(`[TEST] Signing in with: ${email}`);
    const loginResult = await signIn(email, password);
    console.log(`[TEST] Login result:`, loginResult);

    if (!loginResult.success) {
      return NextResponse.json({
        stage: 'login',
        success: false,
        error: loginResult.error,
        signup: signupResult,
        debug: (loginResult as any).debug,
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      stage: 'both',
      signup: signupResult,
      tokens: loginResult.tokens,
    });
  } catch (error: any) {
    console.error('[TEST] Error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
