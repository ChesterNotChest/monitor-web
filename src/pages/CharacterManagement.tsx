import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Edit3, Upload, X, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Panel } from '../components/ui/Panel';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import { config } from '../api/config';
import type { PersonResponse } from '../api/types';

export default function CharacterManagement() {
  const [chars, setChars] = useState<PersonResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchChars = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await client.fetchPersons(1, 50);
      setChars(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChars(); }, []);

  const char = chars.find(c => c.id === selected);

  const [addName, setAddName] = useState('');
  const doAdd = async () => {
    if (!addName.trim()) return;
    setActionLoading(true);
    try {
      await client.createPerson({ name: addName });
      setShowAdd(false); setAddName('');
      await fetchChars();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const [editName, setEditName] = useState('');
  const openEdit = () => { if (char) { setEditName(char.name); setShowEdit(true); } };
  const doEdit = async () => {
    if (!char) return;
    setActionLoading(true);
    try {
      await client.updatePerson(char.id, { name: editName });
      setShowEdit(false);
      await fetchChars();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const doDelete = async () => {
    if (!char) return;
    setActionLoading(true);
    try {
      await client.deletePerson(char.id);
      setSelected(null);
      await fetchChars();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && char) {
      setActionLoading(true);
      try {
        await client.uploadPersonAvatar(char.id, f);
        await fetchChars();
      } catch { /* ignore */ }
      finally { setActionLoading(false); }
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', marginBottom: 'var(--space-3)',
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>命名人物管理</h2>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)} disabled={actionLoading}>添加人物</Button>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ minHeight: 140 }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
            <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
            <Button variant="secondary" onClick={fetchChars}>重试</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
            {chars.map(c => (
              <Card key={c.id} hoverable selected={selected === c.id} onClick={() => setSelected(c.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>{c.name}</span>
              </Card>
            ))}
            {chars.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-8)' }}>暂无人物数据</div>
            )}
          </div>
        )}
      </div>

      <Panel open={!!char} onClose={() => setSelected(null)} title="人物详情">
        {char && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, flexDirection: 'column', gap: 'var(--space-3)' }}>
              {char.avatar_path ? (
                <img src={`${config.serverBaseUrl}/face_images/${char.avatar_path}`} alt={char.name} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-disabled)' }}>未设置照片</span>
              )}
            </div>
            <div style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>{char.name}</div>
            <Button variant="secondary" icon={Edit3} style={{ width: '100%' }} onClick={openEdit} disabled={actionLoading}>修改信息</Button>
            <Button variant="secondary" icon={Upload} style={{ width: '100%' }} onClick={() => fileRef.current?.click()} disabled={actionLoading}>更改照片</Button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            <Button variant="danger" icon={Trash2} style={{ width: '100%' }} onClick={doDelete} disabled={actionLoading}>删除人物</Button>
          </div>
        )}
      </Panel>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="添加人物">
          <input style={inputStyle} placeholder="人物姓名" value={addName} onChange={e => setAddName(e.target.value)} />
          <Button variant="primary" style={{ width: '100%' }} onClick={doAdd} disabled={actionLoading}>确认添加</Button>
        </Modal>
      )}

      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} title="修改信息">
          <input style={inputStyle} placeholder="人物姓名" value={editName} onChange={e => setEditName(e.target.value)} />
          <Button variant="primary" style={{ width: '100%' }} onClick={doEdit} disabled={actionLoading}>保存修改</Button>
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
        padding: 'var(--space-6)', minWidth: 360, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>{title}</h3>
          <X size={20} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={onClose} />
        </div>
        {children}
      </div>
    </>
  );
}
