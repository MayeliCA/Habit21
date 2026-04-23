import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthResponse } from '@shared/types/auth';
import api from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  timezone: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('habit21_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const savedUser: AuthUser = {
          id: parsed.id,
          email: parsed.email,
          name: parsed.name,
          timezone: parsed.timezone || 'UTC',
        };
        setUser(savedUser);
        syncTimezone(savedUser.timezone);
      } catch {
        localStorage.removeItem('habit21_user');
      }
    }
    setIsLoading(false);
  }, []);

  const syncTimezone = useCallback((currentTz: string) => {
    const detected = detectTimezone();
    if (detected !== currentTz) {
      api.patch('/auth/timezone', { timezone: detected })
        .then((res) => {
          const data = res.data;
          if (data.token) {
            localStorage.setItem('habit21_token', data.token);
          }
          if (data.user?.timezone) {
            const updated = { ...JSON.parse(localStorage.getItem('habit21_user') || '{}'), timezone: data.user.timezone };
            localStorage.setItem('habit21_user', JSON.stringify(updated));
            setUser((prev) => prev ? { ...prev, timezone: data.user.timezone } : prev);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleAuth = useCallback((data: AuthResponse) => {
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      timezone: data.user.timezone || 'UTC',
    };
    localStorage.setItem('habit21_token', data.token);
    localStorage.setItem('habit21_user', JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const timezone = detectTimezone();
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password, timezone });
    handleAuth(data);
  }, [handleAuth]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const timezone = detectTimezone();
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name, timezone });
    handleAuth(data);
  }, [handleAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('habit21_token');
    localStorage.removeItem('habit21_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
