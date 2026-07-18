/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStorage } from '../lib/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore the session by validating the stored token with the backend;
    // never decode a token locally and treat its claims as authoritative.
    if (!tokenStorage.get()) { setLoading(false); return; }
    api.me().then(setUser).catch(() => tokenStorage.clear()).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Keep authentication state independent from the fetch implementation by
    // reacting to one small browser event.
    const clearExpiredSession = () => setUser(null);
    window.addEventListener('auth:unauthorized', clearExpiredSession);
    return () => window.removeEventListener('auth:unauthorized', clearExpiredSession);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: async (email, password) => {
      const response = await api.login(email, password);
      tokenStorage.set(response.accessToken);
      setUser(response.user);
    },
    logout: () => { tokenStorage.clear(); setUser(null); },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
