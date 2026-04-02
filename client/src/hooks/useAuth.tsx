import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthResponse } from '@shared/types/auth';
import api from '@/lib/api';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('habit21_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('habit21_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuth = useCallback((data: AuthResponse) => {
    localStorage.setItem('habit21_token', data.token);
    localStorage.setItem('habit21_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    handleAuth(data);
  }, [handleAuth]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name });
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
