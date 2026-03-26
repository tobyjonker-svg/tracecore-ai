/**
 * TraceCore AI — Authentication Context
 * Manages user authentication, sessions, and multi-workspace support.
 * Ready for Supabase integration.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  workspaceId: string;
  role: 'admin' | 'manager' | 'user';
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = 'tracecore-auth-user';

/**
 * AuthProvider wraps the app and manages authentication state.
 * Currently uses localStorage for demo; ready for Supabase integration.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with Supabase auth
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;

      // Demo: Create mock user
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        workspaceId: `ws-${Date.now()}`,
        role: 'admin',
      };

      setUser(mockUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with Supabase auth
      // const { data, error } = await supabase.auth.signUp({ email, password });
      // if (error) throw error;

      // Demo: Create mock user
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        workspaceId: `ws-${Date.now()}`,
        role: 'admin',
      };

      setUser(mockUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // TODO: Call supabase.auth.signOut() when integrated
  };

  const switchWorkspace = async (workspaceId: string) => {
    if (!user) return;
    const updated = { ...user, workspaceId };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        switchWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
