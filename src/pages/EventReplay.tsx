import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAlerts } from '../context/AlertContext';
import * as client from '../api/client';
import type { EventResponse } from '../api/types';

/**
 * EventReplay — 事件回放页面。
 *
 * 路由参数 `alertId` 来自告警列表导航（如 `navigate('/replay/${alert.id}')`）。
 * 事件（Event）和告警（Alert）在 server 端共享同一张 situation_events 表，
 * 因此 alertId 可以直接用于：
 *   1. GET  /events/{alertId}   → 获取事件详情
 *   2. PUT  /alerts/{alertId}/handle → 标记告警已处理
 */
export default function EventReplay() {
  const { alertId } = useParams<{ alertId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { markHandled, markFalseAlarm } = useAlerts();

  const [eventDetail, setEventDetail] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const id = Number(alertId); // event/alert 共享 situation_events 表，ID 相同
  const st = (location.state as any) || {};
  const from = st.from || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await client.fetchEventById(id);
        setEventDetail(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : '事件不存在');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleMark = async (action: 'resolved' | 'false-alarm') => {
    if (action === 'resolved') await markHandled(id);
    else await markFalseAlarm(id);
  };

  const goBack = () => {
    if (from) navigate(from);
    else navigate('/main');
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', height: '100%', display: 'flex', gap: 'var(--space-4)' }}>
        <Skeleton style={{ flex: 1, borderRadius: 'var(--radius-md)' }} />
        <Skeleton style={{ width: 360, borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  if (error || !eventDetail) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-disabled)' }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>{error || `未找到该告警事件 (ID: ${alertId})`}</div>
        <Button variant="secondary" onClick={goBack}>返回</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.06)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', color: 'var(--text-disabled)' }}>
          <Camera size={80} />
          <div style={{ fontSize: 28, fontWeight: 'var(--font-bold)', color: 'var(--text-secondary)' }}>
            视图 {eventDetail.view_id} · 事件回放
          </div>
          <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-disabled)' }}>
            告警 #{id}
          </div>
        </div>
        <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
          <div style={{ position: 'relative', height: 6, background: 'var(--bg-elevated)', borderRadius: 3 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: '25%', background: 'var(--color-info)', borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: '25%', top: -5, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '2px solid var(--color-info)', transform: 'translateX(-50%)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <span>00:12</span><span>02:45</span>
          </div>
        </div>
      </div>

      <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ padding: 'var(--space-4)', background: 'var(--color-warning-dim)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-info)' }}>告警 #{id}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
            <div>发生时间：<span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{eventDetail.timestamp}</span></div>
            <div>关联视图：<span style={{ color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => navigate(`/view/${eventDetail.view_id}`, { state: { from: `/replay/${id}` } })}>视图 {eventDetail.view_id}</span></div>
            <div>异常定义：<Badge level="neutral">#{eventDetail.exception_id}</Badge></div>
            <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>处理状态</span>
              <Badge level="danger">未处理</Badge>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={() => handleMark('false-alarm')}>设为误报</Button>
          <Button variant="primary" size="lg" style={{ flex: 1 }} onClick={() => handleMark('resolved')}>设为已处理</Button>
        </div>

        {from && (
          <Button variant="ghost" size="sm" style={{ width: '100%' }} onClick={goBack}>返回</Button>
        )}
      </div>
    </div>
  );
}
