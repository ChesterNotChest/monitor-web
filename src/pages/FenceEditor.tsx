import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useWhepPlayer } from '../hooks/useWhepPlayer';
import * as client from '../api/client';
import type { FenceResponse, FenceCreate, ViewResponse } from '../api/types';

export default function FenceEditor() {
  const { viewId } = useParams<{ viewId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [view, setView] = useState<ViewResponse | null>(null);
  const [fences, setFences] = useState<FenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const id = Number(viewId) || 0;

  // WHEP live player
  const { status: whepStatus, error: whepError } = useWhepPlayer(videoRef, view?.webrtc_url);

  const [addForm, setAddForm] = useState<FenceCreate>({
    name: '', view_id: id,
    coords: [[0, 0], [200, 0], [200, 150], [0, 150]],
    dwell_time: 10, density: 0.6, leave_frames: 5,
  });

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [v, f] = await Promise.all([
        client.fetchViewById(id).catch(() => null),
        client.fetchFences().catch(() => [] as FenceResponse[]),
      ]);
      setView(v);
      setFences(f.filter(fc => fc.view_id === id));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Draw fences on canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || fences.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fences.forEach(f => {
      if (f.coords.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(f.coords[0][0], f.coords[0][1]);
      for (let i = 1; i < f.coords.length; i++) ctx.lineTo(f.coords[i][0], f.coords[i][1]);
      ctx.closePath();
      ctx.fillStyle = f.id === selectedId ? 'rgba(56,189,248,.25)' : 'rgba(56,189,248,.12)';
      ctx.fill();
      ctx.strokeStyle = f.id === selectedId ? 'var(--color-info)' : 'rgba(56,189,248,.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [fences, selectedId]);

  const doAdd = async () => {
    if (!addForm.name.trim()) return;
    setActionLoading(true);
    try {
      await client.createFence({ ...addForm, view_id: id });
      setShowAdd(false);
      setAddForm({ name: '', view_id: id, coords: [[0, 0], [200, 0], [200, 150], [0, 150]], dwell_time: 10, density: 0.6, leave_frames: 5 });
      await fetchData();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const doDelete = async (fid: number) => {
    setActionLoading(true);
    try { await client.deleteFence(fid); if (selectedId === fid) setSelectedId(null); await fetchData(); }
    catch { /* ignore */ }
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
        {loading ? (
          <Skeleton style={{ flex: 1 }} />
        ) : view?.webrtc_url ? (
          <div style={{ flex: 1, position: 'relative' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} muted playsInline autoPlay />
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', color: 'var(--text-disabled)' }}>
            <Camera size={80} />
            <div style={{ fontSize: 28, fontWeight: 'var(--font-bold)', color: 'var(--text-secondary)' }}>视图 {viewId}</div>
            <div style={{ fontSize: 'var(--text-sm)' }}>{whepError || 'webrtc_url 不可用 — 请检查 SRS 是否启动'}</div>
          </div>
        )}
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-disabled)' }}>
          摄像机: {viewId} {whepStatus === 'connecting' ? '· 连接中...' : ''}
        </div>
      </div>

      {/* Right: fence list + CRUD */}
      <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)', border: '1px solid rgba(255,255,255,.06)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>围栏区域</span>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAdd(true)} disabled={actionLoading}>新增</Button>
          </div>

          {error && (
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-danger)' }}>
              <AlertTriangle size={24} /><div>{error}</div>
              <Button variant="secondary" size="sm" onClick={fetchData}>重试</Button>
            </div>
          )}

          {fences.length === 0 && !error && (
            <div style={{ textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-4)' }}>暂无围栏，点击"新增"创建</div>
          )}

          {fences.map(f => (
            <Card key={f.id} selected={selectedId === f.id} hoverable onClick={() => setSelectedId(f.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>{f.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {f.coords.length}点 · 停留{f.dwell_time}s · 密度{f.density}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); doDelete(f.id); }} disabled={actionLoading}>
                <Trash2 size={16} />
              </Button>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="danger" onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>

      {/* Add fence modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="新增围栏">
          <input style={inputStyle} placeholder="围栏名称" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>停留时限(s)</label>
              <input style={inputStyle} type="number" value={addForm.dwell_time} onChange={e => setAddForm(f => ({ ...f, dwell_time: Number(e.target.value) }))} /></div>
            <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>密度阈值</label>
              <input style={inputStyle} type="number" step="0.1" min="0" max="1" value={addForm.density} onChange={e => setAddForm(f => ({ ...f, density: Number(e.target.value) }))} /></div>
          </div>
          <div style={{ marginBottom: 'var(--space-3)' }}><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>离开判定帧数</label>
            <input style={inputStyle} type="number" value={addForm.leave_frames} onChange={e => setAddForm(f => ({ ...f, leave_frames: Number(e.target.value) }))} /></div>
          <Button variant="primary" style={{ width: '100%' }} onClick={doAdd} disabled={actionLoading}>确认添加</Button>
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
