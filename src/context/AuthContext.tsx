/**
 * HealthWay Authentication Context
 * Government of Maharashtra - Integrated Rural Health Platform
 * Provides global authentication, session state, and database-backed user management.
 * Strictly zero unicode emojis, 100% Lucide React icons.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService, { SignUpData, DemoAccount, DEFAULT_USERS } from '../services/authService';
import { UserRecord, SessionRecord, UserRole } from '../services/offlineDB';

export interface AuthContextType {
  user: UserRecord | null;
  session: SessionRecord | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  quickLogin: (username: string) => Promise<boolean>;
  demoAccounts: DemoAccount[];
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionRecord | null>(() => authService.getActiveSessionSync());
  const [user, setUser] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Refresh current user record from database
  const refreshUser = useCallback(async () => {
    try {
      const activeUser = await authService.getCurrentUser();
      setUser(activeUser);
    } catch (err) {
      console.warn('[AuthContext] Error fetching current user:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial mount: seed DB, get current user
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await authService.initAuth();
      if (!isMounted) return;
      const currentSession = authService.getActiveSessionSync();
      setSession(currentSession);
      const activeUser = await authService.getCurrentUser();
      if (isMounted) {
        setUser(activeUser);
        setIsLoading(false);
      }
    };

    init();

    // Listen to internal auth-change and window storage events
    const handleAuthChange = (e: Event) => {
      const customEvt = e as CustomEvent<SessionRecord | null>;
      setSession(customEvt.detail || null);
      refreshUser();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hw_auth_active_session_v1') {
        const newSession = authService.getActiveSessionSync();
        setSession(newSession);
        refreshUser();
      }
    };

    window.addEventListener('healthway:auth-change', handleAuthChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('healthway:auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshUser]);

  // Login handler
  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const res = await authService.login(username, password);
        if (res.success && res.user && res.session) {
          setSession(res.session);
          setUser(res.user);
          return { success: true };
        }
        return { success: false, error: res.error || 'Login failed' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Login encountered an unexpected error' };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Sign Up handler
  const signUp = useCallback(
    async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const res = await authService.signUp(data);
        if (res.success && res.user && res.session) {
          setSession(res.session);
          setUser(res.user);
          return { success: true };
        }
        return { success: false, error: res.error || 'Sign up failed' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Registration encountered an unexpected error' };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout handler
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setSession(null);
      setUser(null);
    } catch (err) {
      console.warn('[AuthContext] Error during logout:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Quick Login for demo accounts
  const quickLogin = useCallback(
    async (username: string): Promise<boolean> => {
      const demoList = authService.getDemoAccounts();
      const target = demoList.find((d) => d.username.toLowerCase() === username.toLowerCase());
      if (target) {
        const res = await login(target.username, target.password);
        return res.success;
      }
      return false;
    },
    [login]
  );

  const demoAccounts = useMemo(() => authService.getDemoAccounts(), []);

  const value = useMemo(
    () => ({
      user,
      session,
      isAuthenticated: Boolean(session && user),
      isLoading,
      login,
      signUp,
      logout,
      quickLogin,
      demoAccounts,
      refreshUser
    }),
    [user, session, isLoading, login, signUp, logout, quickLogin, demoAccounts, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
