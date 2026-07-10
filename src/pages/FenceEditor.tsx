import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { FenceResponse, FenceCreate } from '../api/types';

export default function FenceEditor() {
  const { viewId } = useParams<{ viewId: string }>();
  const navigate = useNavigate();

  const [fences, setFences] = useState<FenceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<FenceCreate>({
    name: '',
    view_id: Number(viewId) || 0,
    coords: [[0, 0], [200, 0], [200, 150], [0, 150]],
    dwell_time: 10,
    density: 0.6,
    leave_frames: 5,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await client.fetchFences();
      setFences(data.filter(f => f.view_id === Number(viewId)));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [viewId]);

  const doAdd = async () => {
    if (!addForm.name.trim()) return;
    setActionLoading(true);
    try {
      await client.createFence({ ...addForm, view_id: Number(viewId) || 0 });
      setShowAdd(false);
      setAddForm({
        name: '',
        view_id: Number(viewId) || 0,
        coords: [[0, 0], [200, 0], [200, 150], [0, 150]],
        dwell_time: 10,
        density: 0.6,
        leave_frames: 5,
      });
      await fetchData();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const doDelete = async (id: number) => {
    setActionLoading(true);
    try {
      await client.deleteFence(id);
      if (selectedId === id) setSelectedId(null);
      await fetchData();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const selectedFence = fences.find(f => f.id === selectedId);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', marginBottom: 'var(--space-3)',
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', color: 'var(--text-disabled)' }}>
          <Camera size={80} />
          <div style={{ fontSize: 48, fontWeight: 'var(--font-bold)', color: 'var(--text-secondary)' }}>实时监控画面</div>
          <div style={{ fontSize: 'var(--text-xl)', color: 'var(--text-secondary)' }}>
            {selectedFence ? `编辑围栏: ${selectedFence.name}` : '选择一个围栏进行编辑'}
          </div>
        </div>
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-disabled)' }}>
          摄像机: {viewId}
        </div>
      </div>

      <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)', border: '1px solid rgba(255,255,255,.06)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>围栏区域</span>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAdd(true)} disabled={actionLoading}>新增</Button>
          </div>

          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} style={{ height: 60 }} />)
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-danger)' }}>
              <AlertTriangle size={24} style={{ marginBottom: 'var(--space-2)' }} />
              <div>{error}</div>
              <Button variant="secondary" size="sm" style={{ marginTop: 'var(--space-3)' }} onClick={fetchData}>重试</Button>
            </div>
          ) : fences.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-4)' }}>暂无围栏，点击"新增"创建</div>
          ) : (
            fences.map(f => (
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
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="danger" onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="新增围栏">
          <input style={inputStyle} placeholder="围栏名称" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>停留时限(s)</label>
              <input style={inputStyle} type="number" value={addForm.dwell_time} onChange={e => setAddForm(f => ({ ...f, dwell_time: Number(e.target.value) }))} />
            </div>
            <div>
              <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>密度阈值</label>
              <input style={inputStyle} type="number" step="0.1" min="0" max="1" value={addForm.density} onChange={e => setAddForm(f => ({ ...f, density: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>离开判定帧数</label>
            <input style={inputStyle} type="number" value={addForm.leave_frames} onChange={e => setAddForm(f => ({ ...f, leave_frames: Number(e.target.value) }))} />
          </div>
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
