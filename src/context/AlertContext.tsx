import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AlertResponse } from '../api/types';
import * as client from '../api/client';
import { config } from '../api/config';

interface AlertCtx {
  alerts: AlertResponse[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  markHandled: (id: number) => Promise<void>;
  markFalseAlarm: (id: number) => Promise<void>;
}

const Ctx = createContext<AlertCtx>({
  alerts: [],
  loading: false,
  hasMore: false,
  loadMore: () => {},
  refresh: () => {},
  markHandled: () => Promise.resolve(),
  markFalseAlarm: () => Promise.resolve(),
});

const PAGE_SIZE = 10;

const POLL_INTERVAL = 30_000;

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    try {
      pageRef.current = 1;
      const data = await client.fetchAlerts(1, PAGE_SIZE);
      const filtered = data.items.filter(a =>
        a.status !== 'handled' && a.status !== 'false_alarm'
      );
      setAlerts(filtered);
      setHasMore(data.total > PAGE_SIZE);
    } catch {
      // Silently ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    try {
      const nextPage = pageRef.current + 1;
      const data = await client.fetchAlerts(nextPage, PAGE_SIZE);
      const filtered = data.items.filter(a =>
        a.status !== 'handled' && a.status !== 'false_alarm'
      );
      setAlerts(prev => [...prev, ...filtered]);
      pageRef.current = nextPage;
      setHasMore(data.items.length === PAGE_SIZE && alerts.length + filtered.length < data.total);
    } catch { /* ignore */ }
  }, [hasMore, alerts.length]);

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
    <Ctx.Provider value={{ alerts, loading, hasMore, loadMore, refresh, markHandled, markFalseAlarm }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAlerts() {
  return useContext(Ctx);
}
