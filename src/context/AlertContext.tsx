import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AlertResponse } from '../api/types';
import * as client from '../api/client';
import { config } from '../api/config';

interface AlertCtx {
  alerts: AlertResponse[];
  loading: boolean;
  refresh: () => void;
  markHandled: (id: number) => Promise<void>;
  markFalseAlarm: (id: number) => Promise<void>;
}

const Ctx = createContext<AlertCtx>({
  alerts: [],
  loading: false,
  refresh: () => {},
  markHandled: () => Promise.resolve(),
  markFalseAlarm: () => Promise.resolve(),
});

const POLL_INTERVAL = 30_000;

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await client.fetchAlerts(1, 50);
      // 过滤已处理/误报 — 后端不过滤，前端兜底
      setAlerts(data.items.filter(a =>
        a.status !== 'handled' && a.status !== 'false_alarm'
      ));
    } catch {
      // Silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // WSS connection
  const connectWss = useCallback(() => {
    const token = localStorage.getItem('access-token');
    if (!token) return;

    const wsUrl = `${config.serverBaseUrl.replace(/^http/, 'ws')}/ws/alerts?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // WSS connected — stop REST polling
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };

    ws.onmessage = (e) => {
      try {
        const alert: AlertResponse = JSON.parse(e.data);
        setAlerts(prev => [alert, ...prev].slice(0, 50));
        setLoading(false);
      } catch { /* ignore parse errors */ }
    };

    ws.onclose = () => {
      wsRef.current = null;
      // Fallback to REST polling
      if (!pollRef.current) {
        refresh();
        pollRef.current = setInterval(refresh, POLL_INTERVAL);
      }
      // Reconnect WSS after 10s
      reconnectRef.current = setTimeout(connectWss, 10_000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [refresh]);

  useEffect(() => {
    // Initial REST fetch while WSS is connecting
    refresh();
    pollRef.current = setInterval(refresh, POLL_INTERVAL);
    // Start WSS
    connectWss();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connectWss]);

  const markHandled = useCallback(async (id: number) => {
    try {
      await client.markAlertHandled(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ }
  }, []);

  const markFalseAlarm = useCallback(async (id: number) => {
    try {
      await client.markAlertFalseAlarm(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ }
  }, []);

  return (
    <Ctx.Provider value={{ alerts, loading, refresh, markHandled, markFalseAlarm }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAlerts() {
  return useContext(Ctx);
}
