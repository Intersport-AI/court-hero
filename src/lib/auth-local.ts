/**
 * Local Auth - Minimal implementation
 * Works completely offline without any database
 * Perfect for MVP testing
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

// Simple in-memory user store (in production would be database)
const users = new Map<string, any>();

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
 * Sign up a new user locally
 */
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    // Check if user already exists
    if (users.has(email.toLowerCase())) {
      return { success: false, error: 'User already exists' };
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Validate password
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    const userId = uuid();
    const hashedPassword = await bcrypt.hash(password, 12);

    const user: AuthUser = {
      id: userId,
      email: email.toLowerCase(),
      role: 'player',
      org_id: 'court-hero-default',
      first_name: firstName,
      last_name: lastName,
    };

    // Store user
    users.set(email.toLowerCase(), {
      ...user,
      password_hash: hashedPassword,
    });

    console.log(`✅ User created: ${email}`);

    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Signup failed' };
  }
}

/**
 * Sign in a user locally
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; tokens?: AuthTokens }> {
  try {
    const storedUser = users.get(email.toLowerCase());

    if (!storedUser) {
      return { success: false, error: 'User not found' };
    }

    const passwordMatch = await bcrypt.compare(password, storedUser.password_hash);

    if (!passwordMatch) {
      return { success: false, error: 'Invalid password' };
    }

    const user: AuthUser = {
      id: storedUser.id,
      email: storedUser.email,
      role: storedUser.role,
      org_id: storedUser.org_id,
      first_name: storedUser.first_name,
      last_name: storedUser.last_name,
    };

    const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: REFRESH_EXPIRY });

    console.log(`✅ User logged in: ${email}`);

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
 * Get current user from token
 */
export async function getMe(token: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return { success: true, user: decoded };
  } catch (err: any) {
    return { success: false, error: 'Invalid or expired token' };
  }
}

/**
 * Get auth status
 */
export function getAuthStatus() {
  return {
    usersCount: users.size,
    ready: true,
  };
}
