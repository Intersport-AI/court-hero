import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, checkRole, checkOrgAccess, AuthUser } from './auth-server';

/**
 * Extract JWT from request headers
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Require authentication middleware
 * Attaches user to request.user
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ valid: boolean; user?: AuthUser; response?: NextResponse }> {
  const token = extractToken(request);

  if (!token) {
    return {
      valid: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const user = await getCurrentUser(token);

  if (!user) {
    return {
      valid: false,
      response: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
    };
  }

  return { valid: true, user };
}

/**
 * Require specific roles
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ valid: boolean; user?: AuthUser; response?: NextResponse }> {
  const auth = await requireAuth(request);

  if (!auth.valid) {
    return auth;
  }

  if (!checkRole(auth.user!, allowedRoles)) {
    return {
      valid: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { valid: true, user: auth.user };
}

/**
 * Require org access (user must belong to the org or be platform admin)
 */
export async function requireOrgAccess(
  request: NextRequest,
  org_id: string
): Promise<{ valid: boolean; user?: AuthUser; response?: NextResponse }> {
  const auth = await requireAuth(request);

  if (!auth.valid) {
    return auth;
  }

  if (!checkOrgAccess(auth.user!, org_id)) {
    return {
      valid: false,
      response: NextResponse.json({ error: 'Forbidden: No access to this organization' }, { status: 403 }),
    };
  }

  return { valid: true, user: auth.user };
}

/**
 * Require multiple conditions
 */
export async function requireAuthorization(
  request: NextRequest,
  options: {
    roles?: string[];
    orgId?: string;
  }
): Promise<{ valid: boolean; user?: AuthUser; response?: NextResponse }> {
  let auth = await requireAuth(request);

  if (!auth.valid) {
    return auth;
  }

  if (options.roles && !checkRole(auth.user!, options.roles)) {
    return {
      valid: false,
      response: NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 }),
    };
  }

  if (options.orgId && !checkOrgAccess(auth.user!, options.orgId)) {
    return {
      valid: false,
      response: NextResponse.json({ error: 'Forbidden: No access to this organization' }, { status: 403 }),
    };
  }

  return { valid: true, user: auth.user };
}
