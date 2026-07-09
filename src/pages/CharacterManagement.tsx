import { useState, useRef } from 'react';
import { Plus, Trash2, Edit3, Image, X, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Panel } from '../components/ui/Panel';
import { mockCharacters } from '../data/mock';
import type { Character } from '../data/mock';

export default function CharacterManagement() {
  const [chars, setChars] = useState<Character[]>(mockCharacters);
  const [photos, setPhotos] = useState<Record<string, string | null>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const char = chars.find(c => c.id === selected);
  const newId = () => `char-${Date.now()}`;

  const [addName, setAddName] = useState('');
  const doAdd = () => {
    if (!addName.trim()) return;
    setChars(prev => [...prev, { id: newId(), name: addName }]);
    setShowAdd(false); setAddName('');
  };

  const [editName, setEditName] = useState('');
  const openEdit = () => { if (char) { setEditName(char.name); setShowEdit(true); } };
  const doEdit = () => {
    if (!char) return;
    setChars(prev => prev.map(c => c.id === char.id ? { ...c, name: editName } : c));
    setShowEdit(false);
  };

  const doDelete = () => {
    if (!char) return;
    setChars(prev => prev.filter(c => c.id !== char.id));
    setPhotos(prev => { const n = { ...prev }; delete n[char.id]; return n; });
    setSelected(null);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && char) {
      const url = URL.createObjectURL(f);
      setPhotos(prev => ({ ...prev, [char.id]: url }));
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', marginBottom: 'var(--space-3)'
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>命名人物管理</h2>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>添加人物</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
          {chars.map(c => (
            <Card key={c.id} hoverable selected={selected === c.id} onClick={() => setSelected(c.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
              <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>{c.name}</span>
            </Card>
          ))}
          {Array.from({ length: Math.max(0, 9 - chars.length) }, (_, i) => (
            <Card key={`e-${i}`} disabled style={{ minHeight: 140 }} />
          ))}
        </div>
      </div>

      <Panel open={!!char} onClose={() => setSelected(null)} title="人物详情">
        {char && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, flexDirection: 'column', gap: 'var(--space-3)' }}>
              {photos[char.id] ? (
                <img src={photos[char.id]} alt={char.name} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-disabled)' }}>未设置照片</span>
              )}
            </div>
            <div style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>{char.name}</div>
            <Button variant="secondary" icon={Edit3} style={{ width: '100%' }} onClick={openEdit}>修改信息</Button>
            <Button variant="secondary" icon={Upload} style={{ width: '100%' }} onClick={() => fileRef.current?.click()}>更改照片</Button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            <Button variant="danger" icon={Trash2} style={{ width: '100%' }} onClick={doDelete}>删除人物</Button>
          </div>
        )}
      </Panel>

      {/* Add modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="添加人物">
          <input style={inputStyle} placeholder="人物姓名" value={addName} onChange={e => setAddName(e.target.value)} />
          <Button variant="primary" style={{ width: '100%' }} onClick={doAdd}>确认添加</Button>
        </Modal>
      )}

      {/* Edit modal */}
      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} title="修改信息">
          <input style={inputStyle} placeholder="人物姓名" value={editName} onChange={e => setEditName(e.target.value)} />
          <Button variant="primary" style={{ width: '100%' }} onClick={doEdit}>保存修改</Button>
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
