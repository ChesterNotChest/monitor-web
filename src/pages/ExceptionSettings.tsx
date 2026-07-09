import { useState } from 'react';
import { X, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusDot } from '../components/ui/StatusDot';
import { seedExceptions } from '../api/seed';
import { seedAlertGroups } from '../api/seed';
import type { ExceptionResponse } from '../api/types';

export default function ExceptionSettings() {
  const [exceptions, setExceptions] = useState<ExceptionResponse[]>(seedExceptions);
  const [selected, setSelected] = useState<number | null>(null);

  const toggleSelect = (id: number) => setExceptions(prev => prev.map(e => ({
    ...e, selected: e.id === id ? !(selected === id) : false,
  } as ExceptionResponse & { selected?: boolean })));

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <Card style={{ flex: 1, padding: 'var(--space-6)', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>异常设置</h2>
        </div>
        {exceptions.length === 0 ? (
          <div style={{ color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-12)' }}>
            异常定义待 server ExceptionResponse schema 补全后可用
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
            {exceptions.map(ex => (
              <Card key={ex.id} selected={selected === ex.id} hoverable onClick={() => toggleSelect(ex.id)}
                style={{ padding: 'var(--space-4)', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <StatusDot status="online" size="sm" />
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>异常 #{ex.id}</span>
                </div>
                <Badge level="warning">中危</Badge>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Card style={{ flex: 1, padding: 'var(--space-6)', overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>事件组成</h3>
          </div>
          <div style={{ color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-8)' }}>
            请选择左侧异常类型
          </div>
        </Card>

        <Card style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Button variant="secondary" style={{ width: '100%' }} disabled={!selected}>设置异常等级</Button>
          <Button variant="secondary" style={{ width: '100%' }} disabled={!selected}>开启/关闭告警</Button>
          <Button variant="danger" style={{ width: '100%' }} disabled={!selected}>删除异常</Button>
        </Card>
      </div>
    </div>
  );
}
