import { useEffect, useState } from 'react';
import { Plus, Trash2, Video, Mic, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Panel } from '../components/ui/Panel';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { NodeResponse, DeviceCreateResponse } from '../api/types';

export default function StreamManagement() {
  const [virtualNode, setVirtualNode] = useState<NodeResponse | null>(null);
  const [devices, setDevices] = useState<DeviceCreateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add device panel
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [deviceType, setDeviceType] = useState<'video' | 'audio'>('video');
  const [deviceName, setDeviceName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const nodes = await client.fetchNodes();
      const vNode = nodes.find(n => n.is_virtual);
      setVirtualNode(vNode || null);
      if (vNode) {
        const devs = await client.fetchStreamDevices(vNode.id);
        setDevices(devs);
      }
    } catch (e: any) {
      setError(e?.detail || e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!virtualNode || !deviceName.trim() || !streamUrl.trim()) return;
    setSaving(true); setSaveError('');
    try {
      await client.createStreamDevice(virtualNode.id, {
        device_type: deviceType,
        name: deviceName.trim(),
        stream_url: streamUrl.trim(),
      });
      setShowAddPanel(false);
      setDeviceName('');
      setStreamUrl('');
      setDeviceType('video');
      await fetchData();
    } catch (e: any) {
      setSaveError(e?.detail || e?.message || '添加失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deviceId: number, devType: string) => {
    if (!virtualNode || !confirm(`确定删除此设备？`)) return;
    try {
      await client.deleteStreamDevice(virtualNode.id, deviceId, devType);
      await fetchData();
    } catch (e: any) {
      alert(e?.detail || '删除失败');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.12)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: 'var(--text-base)', outline: 'none',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle, cursor: 'pointer',
  };

  if (loading) {
    return <div style={{ padding: 'var(--space-6)' }}><Skeleton variant="card" count={3} /></div>;
  }

  if (!virtualNode) {
    return (
      <div style={{ padding: 'var(--space-6)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ padding: 'var(--space-8)', textAlign: 'center', maxWidth: 500 }}>
          <AlertTriangle size={48} style={{ color: 'var(--color-warning)', marginBottom: 'var(--space-4)' }} />
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            虚拟 Node 未初始化
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            请确保服务器已启动并执行了 seed 初始化。虚拟 Node 用于承载外部 RTMP 流设备。
          </p>
          <Button variant="primary" onClick={fetchData}>刷新</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)', height: '100%', overflow: 'auto' }}>
      <Card style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
              自定义流管理
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
              管理虚拟 Node 上的外部 RTMP 流设备（IPC 摄像头、OBS 推流等）
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddPanel(true)}>添加流设备</Button>
        </div>

        {error && (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
            <div>{error}</div>
            <Button variant="secondary" style={{ marginTop: 'var(--space-3)' }} onClick={fetchData}>重试</Button>
          </div>
        )}

        {!error && devices.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-disabled)' }}>
            <ExternalLink size={48} style={{ marginBottom: 'var(--space-4)' }} />
            <div style={{ fontSize: 'var(--text-lg)' }}>暂无自定义流设备</div>
            <div style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
              点击「添加流设备」注册外部 RTMP 流
            </div>
          </div>
        )}

        {devices.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {devices.map((d, i) => (
              <Card key={`${d.device_type}-${d.id}-${i}`} style={{
                padding: 'var(--space-4)', display: 'flex', alignItems: 'center',
                gap: 'var(--space-4)', background: 'var(--bg-canvas)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: d.device_type === 'video' ? 'rgba(77,171,247,.15)' : 'rgba(129,199,132,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {d.device_type === 'video' ? <Video size={20} style={{ color: 'var(--color-info)' }} /> : <Mic size={20} style={{ color: 'var(--color-success)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {d.device_type === 'video' ? '视频' : '音频'} · ID: {d.id}
                    {d.stream_url && <span> · <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-info)', wordBreak: 'break-all' }}>{d.stream_url}</code></span>}
                  </div>
                </div>
                <Button variant="danger" size="sm" icon={Trash2}
                  onClick={() => handleDelete(d.id, d.device_type)}>
                  删除
                </Button>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Add device panel */}
      <Panel open={showAddPanel} onClose={() => { setShowAddPanel(false); setSaveError(''); }} title="添加外部流设备" width={450}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Device type */}
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>设备类型</div>
            <select value={deviceType} onChange={e => setDeviceType(e.target.value as 'video' | 'audio')} style={selectStyle}>
              <option value="video">Video（视频）</option>
              <option value="audio">Audio（音频）</option>
            </select>
          </div>

          {/* Device name */}
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>设备名称</div>
            <input style={inputStyle} placeholder="例: IPC-大门、OBS-推流1" value={deviceName}
              onChange={e => setDeviceName(e.target.value)} />
          </div>

          {/* Stream URL */}
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>RTMP 流地址</div>
            <input style={inputStyle} placeholder="例: rtmp://10.0.0.5/live/main" value={streamUrl}
              onChange={e => setStreamUrl(e.target.value)} />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-disabled)', marginTop: 'var(--space-1)' }}>
              对方负责将该 RTMP 流推送到 SRS 服务
            </div>
          </div>

          {saveError && (
            <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', padding: 'var(--space-2)', background: 'var(--color-danger-dim)', borderRadius: 'var(--radius-sm)' }}>
              {saveError}
            </div>
          )}

          <Button variant="primary" size="lg" style={{ width: '100%' }}
            disabled={!deviceName.trim() || !streamUrl.trim() || saving}
            onClick={handleAdd}>
            {saving ? '验证并添加中...' : '添加设备'}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
