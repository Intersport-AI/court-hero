import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, extractToken } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  const token = extractToken(request);
  console.log('GET /api/auth/me', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    authHeader: request.headers.get('authorization'),
  });

  const auth = await requireAuth(request);
  console.log('Auth result:', { valid: auth.valid, hasUser: !!auth.user });

  if (!auth.valid) {
    return auth.response;
  }

  return NextResponse.json(
    {
      success: true,
      user: auth.user,
    },
    { status: 200 }
  );
}
