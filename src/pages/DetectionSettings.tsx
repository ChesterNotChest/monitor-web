import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { DetectionTypeCreate, DetectionTypeResponse } from '../api/types';

type TabKey = 'entity' | 'action' | 'sound' | 'fence-event';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'entity', label: '实体类型' },
  { key: 'action', label: '行为类型' },
  { key: 'sound', label: '声音类型' },
  { key: 'fence-event', label: '围栏事件类型' },
];

const fetchers: Record<TabKey, () => Promise<DetectionTypeResponse[]>> = {
  'entity': client.fetchEntityTypes,
  'action': client.fetchActionTypes,
  'sound': client.fetchSoundTypes,
  'fence-event': client.fetchFenceEventTypes,
};

const creators: Record<TabKey, (body: DetectionTypeCreate) => Promise<DetectionTypeResponse>> = {
  'entity': client.createEntityType,
  'action': client.createActionType,
  'sound': client.createSoundType,
  'fence-event': client.createFenceEventType,
};

const deleters: Record<TabKey, (id: number) => Promise<void>> = {
  'entity': client.deleteEntityType,
  'action': client.deleteActionType,
  'sound': client.deleteSoundType,
  'fence-event': client.deleteFenceEventType,
};

export default function DetectionSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>('entity');
  const [items, setItems] = useState<DetectionTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchers[activeTab]();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [activeTab]);

  const doAdd = async () => {
    if (!addName.trim()) return;
    setActionLoading(true);
    try {
      await creators[activeTab]({ name: addName.trim() });
      setShowAdd(false);
      setAddName('');
      await fetchItems();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '添加失败';
      if (msg.includes('403')) setError('无权限操作');
      else setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const doDelete = async (id: number, name: string) => {
    if (!window.confirm(`确认删除"${name}"？`)) return;
    setActionLoading(true);
    setError('');
    try {
      await deleters[activeTab](id);
      await fetchItems();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '删除失败';
      if (msg.includes('403')) setError('无权限删除');
      else setError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', marginBottom: 'var(--space-3)',
  };

  const tabBarStyle: React.CSSProperties = {
    display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-6)',
    borderBottom: '1px solid rgba(255,255,255,.06)', paddingBottom: 'var(--space-1)',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: 'var(--space-2) var(--space-4)', background: active ? 'var(--bg-hover)' : 'transparent',
    border: 'none', borderBottom: active ? '2px solid var(--color-info)' : '2px solid transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontSize: 'var(--text-base)', cursor: 'pointer', fontWeight: active ? 'var(--font-semibold)' : undefined,
    transition: 'color 120ms ease, border-color 120ms ease',
  });

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <Card style={{ flex: 1, padding: 'var(--space-6)', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>检测类型管理</h2>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)} disabled={actionLoading}>添加</Button>
        </div>

        <div style={tabBarStyle}>
          {TABS.map(t => (
            <button key={t.key} style={tabStyle(activeTab === t.key)} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: 80 }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
            <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
            <Button variant="secondary" onClick={fetchItems}>重试</Button>
          </div>
        ) : items.length === 0 ? (
          <div style={{ color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-12)' }}>
            暂无可用的检测类型，点击"添加"创建
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
            {items.map(item => (
              <Card key={item.id} hoverable style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => doDelete(item.id, item.name)} disabled={actionLoading}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 70 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 80,
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,.1)',
            padding: 'var(--space-6)', minWidth: 360, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>添加{TABS.find(t => t.key === activeTab)?.label}</h3>
              <div style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowAdd(false)}>✕</div>
            </div>
            <input style={inputStyle} placeholder="名称" value={addName} autoFocus
              onChange={e => setAddName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doAdd(); }} />
            <Button variant="primary" style={{ width: '100%' }} onClick={doAdd} disabled={actionLoading || !addName.trim()}>
              确认添加
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
