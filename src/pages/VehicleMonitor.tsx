import { useEffect, useState, useRef, useCallback } from 'react';
import { Camera, WifiOff, Car } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { useWhepPlayer } from '../hooks/useWhepPlayer';
import { useFlvPlayer } from '../hooks/useFlvPlayer';
import * as client from '../api/client';
import type { ViewResponse, VehicleStatsResponse } from '../api/types';

// ── 车辆类别 → 中文名 + 饼图颜色 ─────────────────
const VEHICLE_META: Record<string, { name: string; color: string }> = {
  car:        { name: '轿车',    color: '#3b82f6' },
  truck:      { name: '卡车',    color: '#f59e0b' },
  bus:        { name: '公交车',  color: '#ef4444' },
  motorcycle: { name: '摩托车',  color: '#10b981' },
  bicycle:    { name: '自行车',  color: '#8b5cf6' },
};

const VEHICLE_KEYS = Object.keys(VEHICLE_META);

// ── SVG 饼图组件 ─────────────────────────────────
function PieChart({ data }: { data: Record<string, number> }) {
  const entries = VEHICLE_KEYS.map(k => ({ key: k, name: VEHICLE_META[k].name, value: data[k] ?? 0, color: VEHICLE_META[k].color }));
  const total = entries.reduce((s, e) => s + e.value, 0);

  if (total === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-disabled)', fontSize: 'var(--text-sm)' }}>
        <Car size={32} style={{ marginRight: 8 }} />
        暂无车辆数据
      </div>
    );
  }

  const cx = 100, cy = 100, r = 80;
  let angle = -Math.PI / 2;

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 240 }}>
      {entries.filter(e => e.value > 0).map(e => {
        const slice = (e.value / total) * 2 * Math.PI;
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle + slice);
        const y2 = cy + r * Math.sin(angle + slice);
        const large = slice > Math.PI ? 1 : 0;
        const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
        angle += slice;
        return <path key={e.key} d={path} fill={e.color} stroke="var(--bg-surface)" strokeWidth="2" />;
      })}
    </svg>
  );
}

// ── 图例 ─────────────────────────────────────────
function Legend({ data }: { data: Record<string, number> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {VEHICLE_KEYS.map(k => {
        const meta = VEHICLE_META[k];
        return (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: meta.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{meta.name}</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>{data[k] ?? 0} 辆</span>
          </div>
        );
      })}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 'var(--space-2)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>总计</span>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
          {Object.values(data).reduce((s, v) => s + (v ?? 0), 0)} 辆
        </span>
      </div>
    </div>
  );
}

// ── 实时帧计数条 ─────────────────────────────────
function FrameBar({ data }: { data: Record<string, number> }) {
  const entries = VEHICLE_KEYS.map(k => ({ name: VEHICLE_META[k].name, value: data[k] ?? 0, color: VEHICLE_META[k].color }));
  const total = entries.reduce((s, e) => s + e.value, 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
      <span style={{ fontWeight: 'var(--font-medium)', whiteSpace: 'nowrap' }}>当前帧:</span>
      {total === 0 ? (
        <span style={{ color: 'var(--text-disabled)' }}>无车辆</span>
      ) : (
        entries.filter(e => e.value > 0).map(e => (
          <span key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: e.color }} />
            {e.name}:{e.value}
          </span>
        ))
      )}
    </div>
  );
}

// ── 主页面组件 ───────────────────────────────────
export default function VehicleMonitor() {
  const [views, setViews] = useState<ViewResponse[]>([]);
  const [selectedViewId, setSelectedViewId] = useState<number | null>(null);
  const [stats, setStats] = useState<VehicleStatsResponse | null>(null);
  const [loadingViews, setLoadingViews] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch views list
  useEffect(() => {
    setLoadingViews(true);
    client.fetchViews()
      .then(v => { setViews(v); if (v.length > 0) setSelectedViewId(v[0].id); })
      .catch(() => setViews([]))
      .finally(() => setLoadingViews(false));
  }, []);

  const selectedView = views.find(v => v.id === selectedViewId) ?? null;

  // WHEP / FLV player
  const { status: whepStatus, connect: reconnectWhep } =
    useWhepPlayer(videoRef, selectedView?.webrtc_url ?? null);
  const enableFlv = whepStatus === 'error';
  const { status: flvStatus, connect: reconnectFlv } =
    useFlvPlayer(videoRef, enableFlv ? selectedView?.flv_url ?? null : null);
  const effectiveStatus = enableFlv ? flvStatus : whepStatus;
  const effectiveReconnect = enableFlv ? reconnectFlv : reconnectWhep;

  // Stats polling
  const fetchStats = useCallback(() => {
    if (selectedViewId === null) return;
    client.fetchVehicleStats(selectedViewId)
      .then(setStats)
      .catch(() => { /* silent */ });
  }, [selectedViewId]);

  useEffect(() => {
    fetchStats();
    const timer = setInterval(fetchStats, 2000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  // ── Render ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Car size={22} style={{ color: 'var(--color-info)' }} />
        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', margin: 0, flex: 1 }}>
          车辆监控
        </h1>
        <select
          value={selectedViewId ?? ''}
          onChange={e => setSelectedViewId(e.target.value ? Number(e.target.value) : null)}
          style={{
            background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', padding: '6px 12px',
            fontSize: 'var(--text-sm)', minWidth: 180,
          }}
        >
          {loadingViews ? (
            <option value="">加载中...</option>
          ) : views.length === 0 ? (
            <option value="">暂无可用 View</option>
          ) : (
            views.map(v => (
              <option key={v.id} value={v.id}>{v.name ?? `View #${v.id}`}</option>
            ))
          )}
        </select>
      </div>

      {/* Main: preview + stats */}
      <div style={{ flex: 1, display: 'flex', gap: 'var(--space-4)', minHeight: 0 }}>
        {/* Left: video preview */}
        <div style={{
          flex: 1, minWidth: 0, background: '#000',
          borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.06)',
          position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <video ref={videoRef} autoPlay muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: effectiveStatus === 'playing' ? 'block' : 'none' }} />
          {effectiveStatus === 'connecting' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
              <Skeleton variant="card" count={1} />
              <span style={{ fontSize: 'var(--text-sm)' }}>正在连接视频流...</span>
            </div>
          )}
          {effectiveStatus === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-disabled)' }}>
              <WifiOff size={40} />
              <span style={{ fontSize: 'var(--text-sm)' }}>无法连接视频流</span>
              <button onClick={effectiveReconnect}
                style={{ padding: '6px 16px', background: 'var(--color-info)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                重试
              </button>
            </div>
          )}
          {effectiveStatus === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-disabled)' }}>
              <Camera size={40} />
              <span style={{ fontSize: 'var(--text-sm)' }}>{selectedView ? '等待视频流...' : '请选择一个 View'}</span>
            </div>
          )}
        </div>

        {/* Right: pie + table */}
        <div style={{
          width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
          background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255,255,255,.06)', padding: 'var(--space-4)', overflowY: 'auto',
        }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-secondary)' }}>
            车辆类型分布（累计）
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart data={stats?.total_unique ?? {}} />
          </div>
          <Legend data={stats?.total_unique ?? {}} />
        </div>
      </div>

      {/* Bottom: current frame bar */}
      <div style={{
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255,255,255,.06)', padding: 'var(--space-3) var(--space-4)',
      }}>
        <FrameBar data={stats?.current_frame ?? {}} />
      </div>
    </div>
  );
}
