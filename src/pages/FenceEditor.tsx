import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Trash2, Crosshair, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useWhepPlayer } from '../hooks/useWhepPlayer';
import * as client from '../api/client';
import type { FenceResponse, ViewResponse } from '../api/types';

type Point = [number, number];

export default function FenceEditor() {
  const { viewId } = useParams<{ viewId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [view, setView] = useState<ViewResponse | null>(null);
  const [fences, setFences] = useState<FenceResponse[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Drawing mode
  const [drawing, setDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<Point[]>([]);

  const id = Number(viewId) || 0;

  const { status: whepStatus } = useWhepPlayer(videoRef, view?.webrtc_url);

  // Add fence form
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', entry_delay_seconds: 0, safe_distance: 0, leave_frames: 5 });

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const [v, f] = await Promise.all([
        client.fetchViewById(id).catch(() => null),
        client.fetchFences(),
      ]);
      setView(v);
      setFences(f.filter(fc => fc.view_id === id));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally { setInitialLoad(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Canvas click → add draw point
  const onCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPoints: Point[] = [...drawPoints, [Math.round(x), Math.round(y)]];
    if (newPoints.length >= 4) {
      // Auto-finish: open save dialog with points
      setDrawing(false);
      setShowAdd(true);
    }
    setDrawPoints(newPoints);
  }, [drawing, drawPoints]);

  // Cancel drawing
  const cancelDrawing = () => { setDrawing(false); setDrawPoints([]); };

  // Draw in-progress points on canvas (fences rendered server-side into video stream)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw in-progress points
    if (drawPoints.length > 0) {
      ctx.fillStyle = 'var(--color-danger)';
      ctx.strokeStyle = 'var(--color-danger)';
      ctx.lineWidth = 2;
      drawPoints.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 6, 0, Math.PI * 2);
        ctx.fill();
        // Number
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(String(i + 1), p[0] - 3, p[1] + 4);
        ctx.fillStyle = 'var(--color-danger)';
      });
      // Draw lines between points
      if (drawPoints.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(drawPoints[0][0], drawPoints[0][1]);
        for (let i = 1; i < drawPoints.length; i++) ctx.lineTo(drawPoints[i][0], drawPoints[i][1]);
        if (drawPoints.length === 4) ctx.closePath();
        ctx.strokeStyle = 'var(--color-danger)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [drawPoints]);

  const doAdd = async () => {
    if (!addForm.name.trim()) { setError('请输入围栏名称'); return; }
    if (drawPoints.length < 4) { setError('请先绘制 4 个点'); return; }
    setError('');
    setActionLoading(true);
    try {
      const body = {
        name: addForm.name,
        view_id: id,
        coords: drawPoints.slice(0, 4),
        safe_distance: addForm.safe_distance,
        entry_delay_seconds: addForm.entry_delay_seconds,
        leave_frames: addForm.leave_frames,
      };
      console.log('[FenceEditor] createFence', body);
      const saved = await client.createFence(body);
      setShowAdd(false);
      setDrawPoints([]);
      setAddForm({ name: '', entry_delay_seconds: 0, safe_distance: 0, leave_frames: 5 });
      // Optimistic: add the saved fence to local list immediately
      setFences(prev => [...prev, saved]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '添加围栏失败';
      console.error('[FenceEditor] createFence failed:', e);
      setError(msg);
    } finally { setActionLoading(false); }
  };

  const doDelete = async (fid: number) => {
    setActionLoading(true);
    try {
      await client.deleteFence(fid);
      if (selectedId === fid) setSelectedId(null);
      await fetchData();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', marginBottom: 'var(--space-3)',
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      {/* Left: video + canvas overlay */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.06)', position: 'relative', overflow: 'hidden' }}>
        {initialLoad ? (
          <Skeleton style={{ flex: 1 }} />
        ) : view?.webrtc_url ? (
          <div style={{ flex: 1, position: 'relative' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} muted playsInline autoPlay />
            <canvas ref={canvasRef} onClick={onCanvasClick}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                cursor: drawing ? 'crosshair' : 'default', pointerEvents: drawing ? 'auto' : 'none' }} />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', color: 'var(--text-disabled)' }}>
            <Camera size={80} />
            <div style={{ fontSize: 28, fontWeight: 'var(--font-bold)', color: 'var(--text-secondary)' }}>视图 {viewId}</div>
            <div>webrtc_url 不可用</div>
          </div>
        )}

        {/* Drawing toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>视图 {viewId}</span>
          {whepStatus === 'playing' && !drawing && (
            <Button variant="primary" size="sm" icon={Crosshair} onClick={() => { setDrawPoints([]); setDrawing(true); }}>开始绘制围栏</Button>
          )}
          {drawing && (
            <>
              <span style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
                请在视频上点击 4 个顶点（已点 {drawPoints.length}/4）
              </span>
              <Button variant="ghost" size="sm" onClick={cancelDrawing}><X size={14} /> 取消</Button>
            </>
          )}
          {whepStatus === 'connecting' && <span style={{ color: 'var(--text-disabled)', fontSize: 'var(--text-sm)' }}>视频连接中...</span>}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)', border: '1px solid rgba(255,255,255,.06)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>围栏列表</span>
          </div>

          {error && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>{error}</div>}

          {fences.length === 0 && !error && (
            <div style={{ textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-4)' }}>暂无围栏，点击左侧按钮绘制</div>
          )}

          {fences.map(f => (
            <Card key={f.id} selected={selectedId === f.id} hoverable onClick={() => setSelectedId(f.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>{f.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {f.coords.length}点 · 延迟{f.entry_delay_seconds}s · 安全距离{f.safe_distance}px
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => doDelete(f.id)} disabled={actionLoading}>
                <Trash2 size={16} />
              </Button>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="danger" onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>

      {/* Save fence modal */}
      {showAdd && (
        <Modal onClose={() => { setShowAdd(false); setDrawPoints([]); }} title="保存围栏">
          <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginBottom:'var(--space-3)'}}>
            已绘制 {drawPoints.length}/4 个顶点
          </div>
          <input style={inputStyle} placeholder="围栏名称" value={addForm.name}
            onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>进入延迟(秒)</label>
              <input style={inputStyle} type="number" min="0" value={addForm.entry_delay_seconds}
                onChange={e => setAddForm(f => ({ ...f, entry_delay_seconds: Number(e.target.value) }))} /></div>
            <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>安全距离(像素)</label>
              <input style={inputStyle} type="number" min="0" value={addForm.safe_distance}
                onChange={e => setAddForm(f => ({ ...f, safe_distance: Number(e.target.value) }))} /></div>
          </div>
          <div style={{ marginBottom: 'var(--space-3)' }}><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>离开判定帧数</label>
            <input style={inputStyle} type="number" value={addForm.leave_frames}
              onChange={e => setAddForm(f => ({ ...f, leave_frames: Number(e.target.value) }))} /></div>
          <Button variant="primary" style={{ width: '100%' }} onClick={doAdd} disabled={actionLoading || drawPoints.length < 4}>
            保存围栏
          </Button>
        </Modal>
      )}
    </div>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 70 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 80,
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,.1)',
        padding: 'var(--space-6)', minWidth: 400, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>{title}</h3>
          <div style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={onClose}>✕</div>
        </div>
        {children}
      </div>
    </>
  );
}
