import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Camera, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAlerts } from '../context/AlertContext';
import { useWhepPlayer } from '../hooks/useWhepPlayer';
import { useFlvPlayer } from '../hooks/useFlvPlayer';
import * as client from '../api/client';
import type { ViewResponse } from '../api/types';

export default function LiveMonitor() {
  const { cameraId } = useParams<{ cameraId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts } = useAlerts();

  const [view, setView] = useState<ViewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const viewId = cameraId ? Number(cameraId) : null;
  const viewAlerts = alerts.filter(a => a.view_id === viewId);
  const from = (location.state as any)?.from || '/main';

  // Fetch view
  useEffect(() => {
    if (viewId === null) return;
    setLoading(true);
    client.fetchViewById(viewId)
      .then(setView)
      .catch(() => setView(null))
      .finally(() => setLoading(false));
  }, [viewId]);

  // WHEP live player (WebRTC — preferred, low latency)
  const { status: whepStatus, error: whepError, connect: reconnectWhep } =
    useWhepPlayer(videoRef, view?.webrtc_url);

  // FLV fallback — only activate when WHEP confirmed failed
  const enableFlv = whepStatus === 'error';
  const { status: flvStatus, error: flvError, connect: reconnectFlv } =
    useFlvPlayer(videoRef, enableFlv ? view?.flv_url : null);

  const effectiveStatus = enableFlv ? flvStatus : whepStatus;
  const effectiveError = enableFlv ? flvError : whepError;
  const effectiveReconnect = enableFlv ? reconnectFlv : reconnectWhep;

  const showPlaceholder = (!view?.webrtc_url && !view?.flv_url) || effectiveStatus === 'error';

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.06)', position: 'relative', overflow: 'hidden' }}>

        {/* Time display */}
        {effectiveStatus === 'playing' && <TimeDisplay />}

        {/* Connecting indicator */}
        {effectiveStatus === 'connecting' && (
          <div style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)', zIndex: 10,
            background: 'rgba(0,0,0,.6)', color: '#fff', padding: '4px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            连接中...
          </div>
        )}

        {/* Video or placeholder */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Skeleton style={{ width: '100%', height: '100%', borderRadius: 0 }} />
          </div>
        ) : showPlaceholder ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', color: 'var(--text-disabled)', padding: 'var(--space-6)' }}>
            {effectiveStatus === 'error' ? (
              <>
                <AlertTriangle size={48} style={{ color: 'var(--color-danger)' }} />
                <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-lg)' }}>{effectiveError}</div>
                <Button variant="secondary" size="sm" onClick={effectiveReconnect}><RefreshCw size={16} /> 重试</Button>
              </>
            ) : (
              <>
                <Camera size={80} />
                <div style={{ fontSize: 28, fontWeight: 'var(--font-bold)', color: 'var(--text-secondary)' }}>
                  {view ? `视图 ${view.id}` : `视图 ${cameraId}`}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-disabled)', textAlign: 'center', maxWidth: 360 }}>
                  {view?.flv_url === null && view?.webrtc_url === null
                    ? <><WifiOff size={16} style={{ marginRight: 4 }} />直播不可用：SRS 流媒体服务未启动。<br />检查 SRS 是否运行，Server 是否设置了 DEBUG_WEB_STREAM=false</>
                    : '正在等待直播信号...'}
                </div>
              </>
            )}
          </div>
        ) : (
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} playsInline autoPlay />
        )}
      </div>

      {/* Right sidebar — alerts + actions */}
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
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                  {a.exception_name || `告警 #${a.id}`}
                  {a.exception_name && <span style={{ color: 'var(--text-disabled)', fontWeight: 'var(--font-normal)', marginLeft: 4 }}>#{a.id}</span>}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{a.timestamp}</div>
              </div>
              <Badge level="warning">中危</Badge>
              <Button variant="danger" size="sm" onClick={() => navigate(`/replay/${a.id}`, { state: { from: location.pathname } })}>查看回放</Button>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>操作</div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => navigate(`/view/${cameraId}/edit`, { state: { from: location.pathname } })}>编辑电子围栏</Button>
            <Button variant="primary">手动录制</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeDisplay() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (n: number) => String(n).padStart(2, '0');
  const time = `${fmt(now.getHours())}:${fmt(now.getMinutes())}:${fmt(now.getSeconds())}`;
  return (
    <div style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)', zIndex: 10,
      background: 'rgba(0,0,0,.5)', color: '#fff', padding: '2px 10px', borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', fontFamily: 'var(--font-mono)' }}>
      {time}
    </div>
  );
}
