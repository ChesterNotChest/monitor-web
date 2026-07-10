import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Camera, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAlerts } from '../context/AlertContext';
import * as client from '../api/client';
import type { ViewResponse } from '../api/types';
import flvjs from 'flv.js';

export default function LiveMonitor() {
  const { cameraId } = useParams<{ cameraId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts } = useAlerts();

  const [view, setView] = useState<ViewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [flvError, setFlvError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<flvjs.Player | null>(null);

  const viewId = cameraId ? Number(cameraId) : null;
  const viewAlerts = alerts.filter(a => a.view_id === viewId);
  const from = (location.state as any)?.from || '/main';

  // Fetch view
  useEffect(() => {
    if (viewId === null) return;
    setLoading(true);
    setFlvError('');
    client.fetchViewById(viewId)
      .then(setView)
      .catch(() => setView(null))
      .finally(() => setLoading(false));
  }, [viewId]);

  // FLV player setup / teardown
  useEffect(() => {
    if (!view?.flv_url || !videoRef.current) return;

    // Destroy previous player if any
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    setFlvError('');
    const player = flvjs.createPlayer({
      type: 'flv',
      url: view.flv_url,
      isLive: true,
    });

    player.attachMediaElement(videoRef.current);
    player.load();

    player.on(flvjs.Events.ERROR, () => {
      setFlvError('视频流加载失败');
    });

    player.on(flvjs.Events.METADATA_ARRIVED, () => {
      player.play().catch(() => setFlvError('播放失败'));
    });

    playerRef.current = player;

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, [view?.flv_url]);

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.06)', position: 'relative', overflow: 'hidden' }}>

        {/* LIVE badge */}
        {view?.flv_url && !flvError && (
          <div style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)',
            background: 'var(--color-danger)', color: '#fff', padding: '2px 10px', borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-1)', zIndex: 10 }}>
            <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'pulse-ring 1.4s ease-out infinite' }} />LIVE
          </div>
        )}

        {/* Video player or placeholder */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Skeleton style={{ width: '100%', height: '100%', borderRadius: 0 }} />
          </div>
        ) : view?.flv_url ? (
          flvError ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', color: 'var(--color-danger)' }}>
              <AlertTriangle size={48} />
              <div>{flvError}</div>
              <Button variant="secondary" size="sm" onClick={() => {
                setFlvError('');
                if (playerRef.current) {
                  playerRef.current.destroy();
                  playerRef.current = null;
                }
                if (view?.flv_url && videoRef.current) {
                  const player = flvjs.createPlayer({ type: 'flv', url: view.flv_url, isLive: true });
                  player.attachMediaElement(videoRef.current);
                  player.load();
                  player.on(flvjs.Events.ERROR, () => setFlvError('视频流加载失败'));
                  player.on(flvjs.Events.METADATA_ARRIVED, () => player.play().catch(() => setFlvError('播放失败')));
                  playerRef.current = player;
                }
              }}>
                <RefreshCw size={16} /> 重试
              </Button>
            </div>
          ) : (
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} controls muted />
          )
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', color: 'var(--text-disabled)' }}>
            <Camera size={80} />
            <div style={{ fontSize: 28, fontWeight: 'var(--font-bold)', color: 'var(--text-secondary)' }}>
              {view ? `视图 ${view.id}` : `视图 ${cameraId}`}
            </div>
          </div>
        )}
      </div>

      <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)', border: '1px solid rgba(255,255,255,.06)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            本视图告警 ({viewAlerts.length})
          </div>
          {viewAlerts.length === 0 && (
            <div style={{ color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-8)' }}>当前视图无未处理告警</div>
          )}
          {viewAlerts.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-canvas)',
              borderLeft: '3px solid var(--color-warning)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>告警 #{a.id}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{a.timestamp}</div>
              </div>
              <Badge level="warning">中危</Badge>
              <Button variant="danger" size="sm" onClick={() => navigate(`/replay/${a.id}`, { state: { from: location.pathname } })}>查看回放</Button>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>固定可用操作</div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => navigate(`/view/${cameraId}/edit`, { state: { from: location.pathname } })}>编辑电子围栏</Button>
            <Button variant="primary">手动录制</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
