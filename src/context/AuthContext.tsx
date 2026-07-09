import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserResponse } from '../api/types';

interface AuthCtx {
  user: UserResponse | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  token: null,
  login: () => Promise.resolve(false),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => {
    const saved = localStorage.getItem('current-user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        // 验证新格式：必须有 username 且 id 为 number（排除旧 mock 格式）
        if (typeof u.id === 'number' && typeof u.username === 'string') {
          return u as UserResponse;
        }
        // 旧格式数据无效，清除
        localStorage.removeItem('current-user');
      } catch {
        /* corrupted data, ignore */
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('access-token'),
  );

  useEffect(() => {
    if (user) localStorage.setItem('current-user', JSON.stringify(user));
    else localStorage.removeItem('current-user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('access-token', token);
    else localStorage.removeItem('access-token');
  }, [token]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    // TODO: 替换为 api/client.ts 的 login() 调用
    // const result = await login({ username, password });
    // if (result) { setToken(result.access_token); setUser(result.user); return true; }
    // return false;

    // Stub：开发期间接受 admin/123 登录
    if (username === 'admin' && password === '123') {
      const u: UserResponse = { id: 1, username: 'admin', role: 'operator', is_active: true };
      setUser(u);
      setToken('stub-token');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, token, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
