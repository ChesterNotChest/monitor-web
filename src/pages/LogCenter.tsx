import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { LogEntry } from '../api/types';

/** 动态生成最近 6 天日期列表 */
function recentDates(count: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** 动态生成最近 6 周信息 */
function recentWeeks(count: number): { label: string; range: string; idx: number }[] {
  const weeks: { label: string; range: string; idx: number }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay() + 1 - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    weeks.push({ label: `第${27 - i}周`, range: `${fmt(start)}-${fmt(end)}`, idx: 27 - i });
  }
  return weeks;
}

export default function LogCenter() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reportDates = recentDates(6);
  const weeks = recentWeeks(6);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await client.fetchLogs(1, 50);
      setLogs(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const logEntries = [...logs]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6)
    .map(l => ({
      time: l.timestamp.slice(11, 16),
      level: l.level,
      message: l.message,
      id: l.id,
    }));

  const panelStyle: React.CSSProperties = {
    flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)',
    border: '1px solid rgba(255,255,255,.06)', overflowY: 'auto',
  };
  const headerStyle: React.CSSProperties = {
    textAlign: 'center', padding: 'var(--space-2) var(--space-4)', marginBottom: 'var(--space-3)',
    background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)',
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', height: '100%', padding: 'var(--space-4)' }}>
      <div style={panelStyle}>
        <div style={headerStyle}>本日日志</div>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} style={{ height: 40, marginBottom: 'var(--space-2)' }} />)
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={24} style={{ marginBottom: 'var(--space-2)' }} />
            <div>{error}</div>
            <Button variant="secondary" size="sm" style={{ marginTop: 'var(--space-3)' }} onClick={fetchData}>重试</Button>
          </div>
        ) : (
          logEntries.map((e, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: i % 2 === 0 ? 'var(--bg-canvas)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,.04)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', color: 'var(--text-primary)', width: 48, flexShrink: 0 }}>{e.time}</span>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', flex: 1 }}>{e.message}</span>
              <Badge level={e.level === 'ERROR' ? 'danger' : e.level === 'WARNING' ? 'warning' : 'neutral'}>{e.level}</Badge>
            </div>
          ))
        )}
        {!loading && !error && logEntries.length === 0 && (
          <div style={{ color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-8)' }}>暂无日志</div>
        )}
      </div>

      <div style={panelStyle}>
        <div style={headerStyle}>日报</div>
        {reportDates.map((d) => (
          <Card key={d} hoverable onClick={() => navigate(`/report/${d}`, { state: { from: '/log' } })} style={{ marginBottom: 'var(--space-2)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>{d}</span>
          </Card>
        ))}
      </div>

      <div style={panelStyle}>
        <div style={headerStyle}>周报</div>
        {weeks.map((w) => (
          <Card key={w.label} hoverable onClick={() => navigate(`/weekly-report/${w.idx}`, { state: { from: '/log' } })} style={{ marginBottom: 'var(--space-2)', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>{w.label}（{w.range}）</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
