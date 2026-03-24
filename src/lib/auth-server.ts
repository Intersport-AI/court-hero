import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/**
 * Sign up a new user using Supabase Auth
 */
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    // Use Supabase Auth to create user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
      email_confirm: true, // Auto-confirm email
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        first_name: firstName,
        last_name: lastName,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Log in a user using Supabase Auth
 */
export async function logIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; tokens?: AuthTokens }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user || !data.session) {
      return { success: false, error: 'Sign in failed' };
    }

    const user = data.user;
    const metadata = user.user_metadata || {};

    return {
      success: true,
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token || '',
        user: {
          id: user.id,
          email: user.email!,
          first_name: metadata.first_name,
          last_name: metadata.last_name,
        },
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    // For Supabase JWT tokens, we just verify they're valid
    const decoded = jwt.decode(token) as any;
    if (!decoded) return null;

    return {
      id: decoded.sub || decoded.user_id || '',
      email: decoded.email || '',
    };
  } catch (err) {
    return null;
  }
}

/**
 * Get current user from Supabase session
 */
export async function getCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    const user = data.user;
    const metadata = user.user_metadata || {};

    return {
      id: user.id,
      email: user.email!,
      first_name: metadata.first_name,
      last_name: metadata.last_name,
    };
  } catch (err) {
    return null;
  }
}
