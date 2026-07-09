import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { mockUsers } from '../data/mock';
import type { User } from '../data/mock';

interface AuthCtx {
  user: User | null;
  users: User[];
  login: (userId: string, password: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
}

const Ctx = createContext<AuthCtx>({ user:null,users:[],login:()=>false,logout:()=>{},switchUser:()=>{} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User|null>(()=>{
    const saved = localStorage.getItem('current-user');
    if (saved) {
      try { const u = JSON.parse(saved); if (u.id) return u; } catch {}
    }
    return null;
  });

  useEffect(()=>{
    if (user) localStorage.setItem('current-user',JSON.stringify(user));
    else localStorage.removeItem('current-user');
  },[user]);

  const login = useCallback((userId: string, password: string) => {
    // Simple mock: accept any non-empty password, find user by id prefix match
    const u = mockUsers.find(u=>u.id===userId || u.name===userId);
    if (u && password.length>0) { setUser(u); return true; }
    // Also allow "admin" / "123" as universal login
    if (userId==='admin' && password==='123') { setUser(mockUsers[0]); return true; }
    return false;
  },[]);

  const logout = useCallback(()=>setUser(null),[]);

  const switchUser = useCallback((userId: string) => {
    const u = mockUsers.find(u=>u.id===userId);
    if (u) setUser(u);
  },[]);

  return <Ctx.Provider value={{ user, users:mockUsers, login, logout, switchUser }}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }
