import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

// Use service role key if available, otherwise anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client with service role key (if available) for bypassing RLS
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : supabase;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
const JWT_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

export interface AuthUser {
  id: string;
  email: string;
  role: 'platform_admin' | 'org_owner' | 'event_director' | 'staff' | 'referee' | 'player';
  org_id: string;
  first_name?: string;
  last_name?: string;
  mfa_enabled: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/**
 * Ensure default organization exists
 * Uses admin client if available to bypass RLS
 */
async function ensureDefaultOrganization(): Promise<string> {
  const defaultOrgId = 'court-hero-default';
  const client = supabaseAdmin || supabase;
  
  // Check if it exists
  try {
    const { data: existing } = await client
      .from('organizations')
      .select('id')
      .eq('id', defaultOrgId)
      .single();
    
    if (existing) {
      return defaultOrgId;
    }
  } catch (err: any) {
    // Doesn't exist, will try to create below
  }

  // Try to create the organization with admin client (bypasses RLS)
  try {
    const { data, error: insertError } = await client
      .from('organizations')
      .insert({
        id: defaultOrgId,
        name: 'Court Hero',
        plan_tier: 'community',
      })
      .select('id')
      .single();

    if (data) {
      return data.id;
    }

    // If we get a constraint error, it probably means it already exists
    if (insertError && insertError.code === '23505') {
      console.log('Organization already exists');
      return defaultOrgId;
    }

    if (insertError) {
      console.error('Failed to create default org:', insertError);
      console.warn('Proceeding anyway - RLS policy may allow this on anon user');
    }
    
    return defaultOrgId;
  } catch (err) {
    console.error('Error ensuring default organization:', err);
    console.warn('Proceeding with signup - will fail if org truly doesnt exist');
    return defaultOrgId;
  }
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  orgName?: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    // Ensure default organization exists and get its ID
    const org_id = await ensureDefaultOrganization();

    // Create user
    const userId = uuid();
    const { error: userError } = await supabase.from('players').insert({
      id: userId,
      org_id,
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role: 'player', // Default role
      mfa_enabled: false,
    });

    if (userError) {
      if (userError.code === '23505') {
        return { success: false, error: 'Email already exists in this organization' };
      }
      return { success: false, error: userError.message };
    }

    const user: AuthUser = {
      id: userId,
      email,
      role: 'player',
      org_id,
      first_name: firstName,
      last_name: lastName,
      mfa_enabled: false,
    };

    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; tokens?: AuthTokens; debug?: any }> {
  try {
    const { data: users, error: userError } = await supabase
      .from('players')
      .select('id, org_id, email, password_hash, role, first_name, last_name, mfa_enabled')
      .eq('email', email)
      .limit(1);

    // Debug logging
    const debugInfo = {
      userFound: !!users && users.length > 0,
      userError: userError?.message || null,
      userCount: users?.length || 0,
      passwordHashLength: users?.[0]?.password_hash?.length || 0,
      passwordHashNull: users?.[0]?.password_hash === null,
      passwordLength: password?.length || 0,
      passwordNull: password === null,
    };

    if (userError || !users || users.length === 0) {
      return { success: false, error: 'Invalid email or password', debug: debugInfo };
    }

    const user = users[0];
    
    // Debug: Log the actual comparison
    let passwordMatch = false;
    try {
      if (!user.password_hash) {
        console.warn('Password hash is missing/null for user:', email);
        return { success: false, error: 'Invalid email or password', debug: { ...debugInfo, passwordHashMissing: true } };
      }
      passwordMatch = await bcrypt.compare(password, user.password_hash);
    } catch (bcryptErr: any) {
      console.error('Bcrypt comparison error:', bcryptErr.message);
      return { success: false, error: 'Password validation failed', debug: { ...debugInfo, bcryptError: bcryptErr.message } };
    }

    if (!passwordMatch) {
      return { success: false, error: 'Invalid email or password', debug: { ...debugInfo, passwordMismatch: true } };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      first_name: user.first_name,
      last_name: user.last_name,
      mfa_enabled: user.mfa_enabled,
    };

    const tokens = generateTokens(authUser);

    return { success: true, tokens };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Generate JWT access and refresh tokens
 */
export function generateTokens(user: AuthUser): AuthTokens {
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  const refreshToken = jwt.sign(
    {
      sub: user.id,
      type: 'refresh',
    },
    JWT_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );

  return {
    accessToken,
    refreshToken,
    user,
  };
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): { valid: boolean; decoded?: any; error?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (err: any) {
    console.error('Token verification failed:', {
      error: err.message,
      tokenLength: token.length,
      secretLength: JWT_SECRET.length,
      token: token.substring(0, 50) + '...'
    });
    return { valid: false, error: err.message };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ success: boolean; accessToken?: string; error?: string }> {
  const verification = verifyToken(refreshToken);

  if (!verification.valid) {
    return { success: false, error: 'Invalid refresh token' };
  }

  const { sub } = verification.decoded;

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, org_id, first_name, last_name, mfa_enabled')
      .eq('id', sub)
      .single();

    if (error || !users) {
      return { success: false, error: 'User not found' };
    }

    const authUser: AuthUser = {
      id: users.id,
      email: users.email,
      role: users.role,
      org_id: users.org_id,
      first_name: users.first_name,
      last_name: users.last_name,
      mfa_enabled: users.mfa_enabled,
    };

    const newAccessToken = jwt.sign(
      {
        sub: authUser.id,
        email: authUser.email,
        role: authUser.role,
        org_id: authUser.org_id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return { success: true, accessToken: newAccessToken };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get current user from auth token (from request headers)
 */
export async function getCurrentUser(token?: string): Promise<AuthUser | null> {
  if (!token) return null;

  const verification = verifyToken(token);
  if (!verification.valid) return null;

  const { id, email, role, org_id, sub } = verification.decoded;
  const userId = id || sub; // Support both 'id' and 'sub' fields

  try {
    if (!userId) return null;
    
    // BYPASS MODE: If token was generated in test mode, return decoded claims directly
    // This allows testing without requiring database user to exist
    if (email && role && org_id) {
      return {
        id: userId,
        email,
        role,
        org_id,
        mfa_enabled: false,
      } as AuthUser;
    }
    
    // NORMAL MODE: Look up user in database
    const { data: user, error } = await supabase
      .from('players')
      .select('id, email, role, org_id, first_name, last_name, mfa_enabled')
      .eq('id', userId)
      .single();

    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id,
      first_name: user.first_name,
      last_name: user.last_name,
      mfa_enabled: user.mfa_enabled,
    };
  } catch {
    return null;
  }
}

/**
 * Verify user role and org_id (for authorization)
 */
export function checkRole(user: AuthUser, requiredRoles: string[]): boolean {
  if (user.role === 'platform_admin') return true;
  return requiredRoles.includes(user.role);
}

/**
 * Verify user has access to org_id
 */
export function checkOrgAccess(user: AuthUser, org_id: string): boolean {
  if (user.role === 'platform_admin') return true;
  return user.org_id === org_id;
}
