import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { StatusDot } from '../components/ui/StatusDot';
import { Card } from '../components/ui/Card';
import { seedNodes } from '../api/seed';
import type { NodeResponse } from '../api/types';

export default function DeviceInfo() {
  return (
    <div style={{ padding: 'var(--space-6)', height: '100%', overflow: 'auto' }}>
      <Card style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>设备信息</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-4)' }}>
          {seedNodes.map(node => (
            <DeviceNodeCard key={node.id} node={node} />
          ))}
          {seedNodes.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-8)' }}>
              暂无节点数据
            </div>
          )}
        </div>
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
          <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-disabled)' }}>
            设备详情待 API 接入后展示
          </div>
        </div>
      )}
    </div>
  );
}
