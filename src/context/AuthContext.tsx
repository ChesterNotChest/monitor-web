import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserResponse } from '../api/types';
import * as client from '../api/client';

interface AuthCtx {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  token: null,
  loading: true,
  login: () => Promise.resolve(false),
  logout: () => Promise.resolve(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('access-token'),
  );
  const [loading, setLoading] = useState(true);

  // Verify stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access-token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    client.fetchCurrentUser()
      .then((u) => {
        setUser(u);
        setToken(storedToken);
      })
      .catch(() => {
        // Token expired or invalid — clear storage
        localStorage.removeItem('access-token');
        localStorage.removeItem('current-user');
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('current-user', JSON.stringify(user));
    else localStorage.removeItem('current-user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('access-token', token);
    else localStorage.removeItem('access-token');
  }, [token]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await client.login({ username, password });
      setToken(result.access_token);
      setUser(result.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.logout();
    } catch {
      // Ignore errors — clear local state regardless
    }
    setUser(null);
    setToken(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
