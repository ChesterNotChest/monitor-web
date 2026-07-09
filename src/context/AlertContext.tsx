import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AlertResponse } from '../api/types';

interface AlertCtx {
  alerts: AlertResponse[];
  markHandled: (id: number) => void;
  markFalseAlarm: (id: number) => void;
}

const Ctx = createContext<AlertCtx>({
  alerts: [],
  markHandled: () => {},
  markFalseAlarm: () => {},
});

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);

  const markHandled = useCallback((id: number) => {
    // TODO: 替换为 api/client.ts 的 markAlertHandled(id)
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const markFalseAlarm = useCallback((id: number) => {
    // TODO: 替换为 api/client.ts 的 markAlertFalseAlarm(id)
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ alerts, markHandled, markFalseAlarm }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAlerts() {
  return useContext(Ctx);
}
