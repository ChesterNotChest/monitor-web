import { useNavigate, useParams } from 'react-router-dom';
import { Monitor, Activity, Search, CheckCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface ReportStat { label: string; value: number; icon: typeof Monitor; color: string; iconColor: string }

const statDefs: ReportStat[] = [
  { label: '设备运行', value: 0, icon: Monitor, color: 'var(--color-info-dim)', iconColor: 'var(--color-info)' },
  { label: '用户操作', value: 0, icon: Activity, color: 'var(--color-success-dim)', iconColor: 'var(--color-success)' },
  { label: '识别结果', value: 0, icon: Search, color: 'var(--color-warning-dim)', iconColor: 'var(--color-warning)' },
  { label: '告警处理', value: 0, icon: CheckCircle, color: 'var(--color-danger-dim)', iconColor: 'var(--color-danger)' },
];

export default function ReportDetail() {
  const { date } = useParams<{ date: string }>();

  return (
    <div style={{ padding: 'var(--space-6)', height: '100%', overflow: 'auto' }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.06)', overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
            日报详情 · {date}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          {statDefs.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.color, color: s.iconColor, flexShrink: 0 }}>
                <s.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-disabled)' }}>
          报表数据待 server API 就绪后接入
        </div>
      </div>
    </div>
  );
}
