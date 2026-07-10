import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { StatusDot } from '../components/ui/StatusDot';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { NodeResponse } from '../api/types';

export default function DeviceInfo() {
  const [nodes, setNodes] = useState<NodeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await client.fetchNodes();
      setNodes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div style={{ padding: 'var(--space-6)', height: '100%', overflow: 'auto' }}>
      <Card style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>设备信息</h2>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-4)' }}>
            <Skeleton style={{ height: 120 }} />
            <Skeleton style={{ height: 120 }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
            <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
            <Button variant="secondary" onClick={fetchData}>重试</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-4)' }}>
            {nodes.map(node => (
              <DeviceNodeCard key={node.id} node={node} />
            ))}
            {nodes.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-8)' }}>
                暂无节点数据
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function DeviceNodeCard({ node }: { node: NodeResponse }) {
  const [collapsed, setCollapsed] = useState(false);
  const isAbnormal = !node.is_connected;

  return (
    <div style={{
      background: isAbnormal ? 'var(--color-danger-dim)' : 'var(--bg-canvas)',
      borderRadius: 'var(--radius-md)',
      border: `1px solid ${isAbnormal ? 'rgba(240,71,71,.3)' : 'rgba(255,255,255,.06)'}`,
      overflow: 'hidden',
    }}>
      <div onClick={() => setCollapsed(c => !c)} style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        padding: 'var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)',
      }}>
        {collapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        <span>Node {node.id}</span>
        <StatusDot status={node.is_connected ? 'online' : 'offline'} pulse={isAbnormal} size="sm" />
      </div>
      {!collapsed && (
        <div style={{ padding: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div>状态：<span style={{ color: node.is_connected ? 'var(--color-success)' : 'var(--color-danger)' }}>{node.is_connected ? '在线' : '离线'}</span></div>
            <div>最后上线：<span style={{ color: 'var(--text-primary)' }}>{node.last_seen || '未知'}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
