import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Monitor, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { ReportResponse } from '../api/types';

export default function WeeklyReportDetail() {
  const { weekNum } = useParams<{ weekNum: string }>();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await client.fetchWeeklyReport();
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [weekNum]);

  return (
    <div style={{ padding: 'var(--space-6)', height: '100%', overflow: 'auto' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.06)', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            周报详情 · 第{weekNum}周
          </h2>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)' }}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} style={{ height: 72 }} />)}
          </div>
        ) : error ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-danger)' }}>
            <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
            <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
            <Button variant="secondary" onClick={fetchData}>重试</Button>
          </div>
        ) : report ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <StatBlock label="总告警" value={report.total_alerts} icon={Monitor} color="var(--color-info-dim)" iconColor="var(--color-info)" />
              {report.by_severity.map((s, i) => (
                <StatBlock key={i} label={s.label} value={s.value} icon={Activity} color="var(--color-success-dim)" iconColor="var(--color-success)" />
              )).slice(0, 3)}
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
                高频异常 Top
              </h3>
              {report.top_exceptions.length === 0 ? (
                <div style={{ color: 'var(--text-disabled)', padding: 'var(--space-4)' }}>暂无数据</div>
              ) : (
                report.top_exceptions.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,.04)', color: 'var(--text-primary)' }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 'var(--font-semibold)' }}>{item.value}</span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatBlock({ label, value, icon: Icon, color, iconColor }: { label: string; value: number; icon: typeof Monitor; color: string; iconColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color, color: iconColor, flexShrink: 0 }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{label}</div>
      </div>
    </div>
  );
}
