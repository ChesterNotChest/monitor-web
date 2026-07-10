import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AlertResponse } from '../api/types';
import * as client from '../api/client';

interface AlertCtx {
  alerts: AlertResponse[];
  loading: boolean;
  markHandled: (id: number) => Promise<void>;
  markFalseAlarm: (id: number) => Promise<void>;
}

const Ctx = createContext<AlertCtx>({
  alerts: [],
  loading: false,
  markHandled: () => Promise.resolve(),
  markFalseAlarm: () => Promise.resolve(),
});

const POLL_INTERVAL = 30_000; // 30 seconds

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await client.fetchAlerts(1, 50);
      setAlerts(data.items);
    } catch {
      // Silently ignore poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + start polling
  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const markHandled = useCallback(async (id: number) => {
    try {
      await client.markAlertHandled(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch {
      // Silently ignore — alert stays in list
    }
  }, []);

  const markFalseAlarm = useCallback(async (id: number) => {
    try {
      await client.markAlertFalseAlarm(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch {
      // Silently ignore — alert stays in list
    }
  }, []);

  return (
    <Ctx.Provider value={{ alerts, loading, markHandled, markFalseAlarm }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAlerts() {
  return useContext(Ctx);
}
