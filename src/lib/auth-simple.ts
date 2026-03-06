/**
 * Simplified Auth using Supabase Auth (built-in)
 * No custom tables required - uses Supabase managed auth
 */

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
const JWT_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  org_id: string;
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
    // Use Supabase Auth API directly
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Create mock user object for response
    const user: AuthUser = {
      id: authData.user.id,
      email: authData.user.email || email,
      role: 'player',
      org_id: 'court-hero-default',
      first_name: firstName,
      last_name: lastName,
    };

    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Signup failed' };
  }
}

/**
 * Sign in a user using Supabase Auth
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; tokens?: AuthTokens }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user || !authData.session) {
      return { success: false, error: 'Authentication failed' };
    }

    // Create JWT tokens for app use
    const user: AuthUser = {
      id: authData.user.id,
      email: authData.user.email || email,
      role: 'player',
      org_id: 'court-hero-default',
      first_name: authData.user.user_metadata?.first_name,
      last_name: authData.user.user_metadata?.last_name,
    };

    const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRY });

    return {
      success: true,
      tokens: {
        accessToken,
        refreshToken,
        user,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Login failed' };
  }
}

/**
 * Get current user from session
 */
export async function getMe(accessToken: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const { data: userData, error } = await supabase.auth.getUser(accessToken);

    if (error || !userData.user) {
      return { success: false, error: 'Not authenticated' };
    }

    const user: AuthUser = {
      id: userData.user.id,
      email: userData.user.email || '',
      role: 'player',
      org_id: 'court-hero-default',
      first_name: userData.user.user_metadata?.first_name,
      last_name: userData.user.user_metadata?.last_name,
    };

    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<{ success: boolean }> {
  const { error } = await supabase.auth.signOut();
  return { success: !error };
}
