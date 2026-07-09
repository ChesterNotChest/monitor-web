import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { mockAlerts as initialAlerts, type Alert } from '../data/mock';

interface AlertCtx {
  alerts: Alert[];
  updateAlert: (id: string, updates: Partial<Alert>) => void;
}

const Ctx = createContext<AlertCtx>({ alerts: [], updateAlert: () => {} });

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const updateAlert = useCallback((id: string, updates: Partial<Alert>) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  return <Ctx.Provider value={{ alerts, updateAlert }}>{children}</Ctx.Provider>;
}

export function useAlerts() {
  return useContext(Ctx);
}
