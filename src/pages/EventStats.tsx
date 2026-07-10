import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { ExceptionStatsItem, TrendItem } from '../api/types';

const SEVERITY_COLORS: Record<string, string> = {
  INFO: 'var(--color-info)',
  WARNING: 'var(--color-warning)',
  CRITICAL: 'var(--color-danger)',
  EMERGENCY: '#ff4444',
};

export default function EventStats() {
  const [stats, setStats] = useState<ExceptionStatsItem[]>([]);
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, t] = await Promise.all([
        client.fetchExceptionStats(),
        client.fetchEventTrend('day'),
      ]);
      setStats(s);
      setTrend(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div style={{ padding: 'var(--space-6)', height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>事件统计</h2>

      {/* By Exception Stats */}
      <Card style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
          按异常分组统计
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: 40 }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={24} style={{ marginBottom: 'var(--space-2)' }} />
            <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
            <Button variant="secondary" size="sm" onClick={fetchData}>重试</Button>
          </div>
        ) : stats.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-6)' }}>暂无统计数据</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>异常ID</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2) var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>严重级别</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2) var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>事件数</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--text-primary)' }}>#{s.exception_id}</td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      background: SEVERITY_COLORS[s.exception_severity] || 'var(--color-info)',
                      marginRight: 'var(--space-2)',
                    }} />
                    {s.exception_severity}
                  </td>
                  <td style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 'var(--font-semibold)' }}>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Trend Chart */}
      <Card style={{ padding: 'var(--space-4)' }}>
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
          事件趋势
        </div>
        {loading ? (
          <Skeleton style={{ height: 150 }} />
        ) : trend.length === 0 && !error ? (
          <div style={{ textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-6)' }}>暂无趋势数据</div>
        ) : !error ? (
          <TrendBarChart data={trend} />
        ) : null}
      </Card>
    </div>
  );
}

function TrendBarChart({ data }: { data: TrendItem[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barW = 16;
  const gap = 6;
  const totalW = data.length * (barW + gap);
  const chartH = 130;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(totalW, 300)} height={chartH + 36} style={{ display: 'block' }}>
        {data.map((d, i) => {
          const barH = Math.max((d.count / maxCount) * chartH, 2);
          const x = i * (barW + gap);
          const y = chartH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill="var(--color-info)" rx={2} opacity={0.85}>
                <title>{d.period}: {d.count}</title>
              </rect>
              {/* Count label on top */}
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="var(--text-secondary)" fontSize={9}>
                {d.count}
              </text>
            </g>
          );
        })}
        <line x1={0} y1={chartH} x2={totalW} y2={chartH} stroke="rgba(255,255,255,.1)" strokeWidth={1} />
        {/* Period labels */}
        {data.map((d, i) => {
          if (data.length > 20 && i % Math.floor(data.length / 10) !== 0) return null;
          return (
            <text
              key={`lbl-${i}`}
              x={i * (barW + gap) + barW / 2}
              y={chartH + 18}
              textAnchor="middle"
              fill="var(--text-disabled)"
              fontSize={9}
              transform={`rotate(-30, ${i * (barW + gap) + barW / 2}, ${chartH + 18})`}
            >
              {d.period}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
