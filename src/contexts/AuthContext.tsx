'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signin as apiSignin, signup as apiSignup, getMe, signout as apiSignout, loadTokens, getStoredUser, getStoredOrgId } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  role: string;
  org_id: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  orgId: string | null;
  loading: boolean;
  error: string | null;
  signin: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string, orgName?: string) => Promise<boolean>;
  signout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  orgId: null,
  loading: true,
  error: null,
  signin: async () => false,
  signup: async () => false,
  signout: () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      loadTokens();
      const stored = getStoredUser();
      const storedOrg = getStoredOrgId();

      if (stored) {
        setUser(stored);
        setOrgId(storedOrg);

        // Validate token is still good
        try {
          const data = await getMe();
          if (data.success && data.user) {
            setUser(data.user);
            setOrgId(data.user.org_id);
          }
        } catch {
          // Token expired, user needs to log in again
          setUser(null);
          setOrgId(null);
        }
      }

      setLoading(false);
    };

    restore();
  }, []);

  const signin = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const data = await apiSignin(email, password);
      if (data.success && data.tokens) {
        setUser(data.tokens.user);
        setOrgId(data.tokens.user.org_id);
        return true;
      }
      setError(data.error || 'Login failed');
      return false;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string, orgName?: string): Promise<boolean> => {
    setError(null);
    try {
      const data = await apiSignup(email, password, firstName, lastName, orgName);
      if (data.success) {
        // Auto-login after signup
        return await signin(email, password);
      }
      setError(data.error || 'Signup failed');
      return false;
    } catch (err: any) {
      setError(err.message || 'Signup failed');
      return false;
    }
  };

  const signout = () => {
    apiSignout();
    setUser(null);
    setOrgId(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, orgId, loading, error, signin, signup, signout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
