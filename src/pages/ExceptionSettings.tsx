import { useState } from 'react';
import { X, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusDot } from '../components/ui/StatusDot';
import { mockExceptionTypes } from '../data/mock';
import type { ExceptionType } from '../data/mock';

const sevLabel: Record<string, string> = { danger: '高危', warning: '中危', caution: '低危' };

export default function ExceptionSettings() {
  const [exceptions, setExceptions] = useState<ExceptionType[]>(mockExceptionTypes);
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'level' | 'deleteEx' | null>(null);
  const [eventMode, setEventMode] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [editStep, setEditStep] = useState<'pick' | 'edit'>('pick');

  const selected = exceptions.find(e => e.selected);
  const toggleSelect = (id: string) => setExceptions(prev => prev.map(e => ({ ...e, selected: e.id === id ? !e.selected : false })));

  // Toggle alert on/off
  const toggleEnabled = (id: string) => setExceptions(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));

  // Delete exception
  const deleteException = () => {
    if (!selected) return;
    setExceptions(prev => prev.filter(e => e.id !== selected.id));
    setShowModal(null);
  };

  // Set alert level
  const setLevel = (sev: ExceptionType['severity']) => {
    if (!selected) return;
    setExceptions(prev => prev.map(e => e.id === selected.id ? { ...e, severity: sev } : e));
    setShowModal(null);
  };

  // Add exception type
  const [addName, setAddName] = useState('');
  const [addSev, setAddSev] = useState<ExceptionType['severity']>('warning');
  const doAdd = () => {
    if (!addName.trim()) return;
    const ex: ExceptionType = { id: `ex-${Date.now()}`, name: addName, severity: addSev, enabled: true, selected: false, events: [] };
    setExceptions(prev => [...prev, ex]);
    setShowModal(null); setAddName('');
  };

  // Edit exception name
  const [editName, setEditName] = useState('');
  const openEdit = () => { if (selected) { setEditName(selected.name); setShowModal('edit'); } };
  const doEdit = () => {
    if (!selected) return;
    setExceptions(prev => prev.map(e => e.id === selected.id ? { ...e, name: editName } : e));
    setShowModal(null);
  };

  // Event CRUD
  const [eventName, setEventName] = useState('');
  const [editEventIdx, setEditEventIdx] = useState(-1);
  const doAddEvent = () => {
    if (!selected || !eventName.trim()) return;
    setExceptions(prev => prev.map(e => e.id === selected.id ? { ...e, events: [...e.events, eventName] } : e));
    setEventMode(null); setEventName('');
  };
  const openEditEvent = (idx: number) => { setEditEventIdx(idx); setEventName(selected!.events[idx]); setEditStep('edit'); setEventMode('edit'); };
  const doEditEvent = () => {
    if (!selected || editEventIdx < 0) return;
    setExceptions(prev => prev.map(e => e.id === selected.id ? { ...e, events: e.events.map((ev, i) => i === editEventIdx ? eventName : ev) } : e));
    setEventMode(null); setEventName('');
  };
  const doDeleteEvent = (idx: number) => {
    if (!selected) return;
    setExceptions(prev => prev.map(e => e.id === selected.id ? { ...e, events: e.events.filter((_, i) => i !== idx) } : e));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', marginBottom: 'var(--space-3)'
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <Card style={{ flex: 1, padding: 'var(--space-6)', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>异常设置</h2>
          <Button variant="primary" icon={Plus} onClick={() => setShowModal('add')}>添加异常类型</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
          {exceptions.map(ex => (
            <Card key={ex.id} selected={ex.selected} hoverable onClick={() => toggleSelect(ex.id)}
              style={{ padding: 'var(--space-4)', position: 'relative', opacity: ex.enabled ? 1 : 0.55 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <span onClick={(ev) => { ev.stopPropagation(); toggleEnabled(ex.id); }} style={{ cursor: 'pointer' }}>
                  <StatusDot status={ex.enabled ? 'online' : 'offline'} size="sm" />
                </span>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: ex.enabled ? 'var(--text-primary)' : 'var(--text-disabled)' }}>{ex.name}</span>
              </div>
              <Badge level={ex.severity}>{sevLabel[ex.severity]}</Badge>
              {!ex.enabled && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', marginLeft: 'var(--space-2)' }}>已关闭</span>}
            </Card>
          ))}
        </div>
      </Card>

      {/* Detail panel */}
      <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Card style={{ flex: 1, padding: 'var(--space-6)', overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>事件组成</h3>
            {selected && (
              <Button variant="ghost" size="sm" icon={Plus} onClick={() => setEventMode('add')}>添加</Button>
            )}
          </div>
          {selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {selected.events.map((ev, i) => (
                <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-base)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{i + 1}. {ev}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button variant="ghost" size="sm" icon={Edit3} onClick={() => openEditEvent(i)} />
                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => doDeleteEvent(i)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-8)' }}>请选择左侧异常类型</div>
          )}
        </Card>

        <Card style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Button variant="secondary" style={{ width: '100%' }} disabled={!selected} onClick={() => setShowModal('level')}>设置异常等级</Button>
          <Button variant="secondary" style={{ width: '100%' }} disabled={!selected} onClick={() => selected && toggleEnabled(selected.id)}>
            {selected?.enabled ? '关闭告警' : '开启告警'}
          </Button>
          <Button variant="danger" style={{ width: '100%' }} disabled={!selected} onClick={() => setShowModal('deleteEx')}>删除异常</Button>
        </Card>
      </div>

      {/* Modals */}
      {/* Add exception type */}
      {showModal === 'add' && (
        <Modal onClose={() => setShowModal(null)} title="添加异常类型">
          <input style={inputStyle} placeholder="异常名称" value={addName} onChange={e => setAddName(e.target.value)} />
          <select style={inputStyle} value={addSev} onChange={e => setAddSev(e.target.value as ExceptionType['severity'])}>
            <option value="danger">高危</option><option value="warning">中危</option><option value="caution">低危</option>
          </select>
          <Button variant="primary" style={{ width: '100%' }} onClick={doAdd}>确认添加</Button>
        </Modal>
      )}

      {/* Edit exception */}
      {showModal === 'edit' && (
        <Modal onClose={() => setShowModal(null)} title="修改异常名称">
          <input style={inputStyle} value={editName} onChange={e => setEditName(e.target.value)} />
          <Button variant="primary" style={{ width: '100%' }} onClick={doEdit}>保存</Button>
        </Modal>
      )}

      {/* Set level */}
      {showModal === 'level' && (
        <Modal onClose={() => setShowModal(null)} title="设置异常等级">
          {(['danger', 'warning', 'caution'] as const).map(s => (
            <Card key={s} hoverable selected={selected?.severity === s} onClick={() => setLevel(s)}
              style={{ marginBottom: 'var(--space-2)', textAlign: 'center', padding: 'var(--space-3)' }}>
              <Badge level={s}>{sevLabel[s]}</Badge>
            </Card>
          ))}
        </Modal>
      )}

      {/* Delete confirm */}
      {showModal === 'deleteEx' && (
        <Modal onClose={() => setShowModal(null)} title="确认删除">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>确定要删除异常类型 "{selected?.name}" 吗？此操作不可撤销。</p>
          <Button variant="danger" style={{ width: '100%' }} onClick={deleteException}>确认删除</Button>
        </Modal>
      )}

      {/* Event add/edit/delete modals */}
      {eventMode === 'add' && (
        <Modal onClose={() => setEventMode(null)} title="添加事件">
          <input style={inputStyle} placeholder="事件名称" value={eventName} onChange={e => setEventName(e.target.value)} />
          <Button variant="primary" style={{ width: '100%' }} onClick={doAddEvent}>确认</Button>
        </Modal>
      )}
      {eventMode === 'edit' && editStep === 'pick' && selected && (
        <Modal onClose={() => setEventMode(null)} title="选择要修改的事件">
          {selected.events.map((ev, i) => (
            <Card key={i} hoverable onClick={() => openEditEvent(i)}
              style={{ marginBottom: 'var(--space-2)', padding: 'var(--space-3)', textAlign: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{ev}</span>
            </Card>
          ))}
        </Modal>
      )}
      {eventMode === 'edit' && editStep === 'edit' && (
        <Modal onClose={() => setEventMode(null)} title="修改事件">
          <input style={inputStyle} value={eventName} onChange={e => setEventName(e.target.value)} />
          <Button variant="primary" style={{ width: '100%' }} onClick={doEditEvent}>保存</Button>
        </Modal>
      )}
      {eventMode === 'delete' && selected && (
        <Modal onClose={() => setEventMode(null)} title="删除事件">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>选择一个事件来删除：</p>
          {selected.events.map((ev, i) => (
            <Card key={i} hoverable onClick={() => { doDeleteEvent(i); setEventMode(null); }}
              style={{ marginBottom: 'var(--space-2)', padding: 'var(--space-3)', textAlign: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{ev}</span>
            </Card>
          ))}
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
