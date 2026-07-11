import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, Plus, Camera, Video, Mic, X } from 'lucide-react';
import { StatusDot } from '../components/ui/StatusDot';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Panel } from '../components/ui/Panel';
import { Skeleton } from '../components/ui/Skeleton';
import { useCameras } from '../context/CameraContext';
import type { CameraView } from '../context/CameraContext';
import * as client from '../api/client';
import type { NodeResponse } from '../api/types';

export default function DeviceInfo() {
  const [nodes, setNodes] = useState<NodeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addCamera } = useCameras();

  // Add view state
  const [showPanel, setShowPanel] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{name:string;nodeId:number} | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<{name:string;nodeId:number} | null>(null);
  const [viewName, setViewName] = useState('');
  const [pickerMode, setPickerMode] = useState<'video' | 'audio' | null>(null);

  // Flat device lists
  const allVideos = nodes.flatMap(n => getNodeDevices(n.id,'video').map(d=>({...d,nodeId:n.id,nodeName:`Node ${n.id}`})));
  const allAudios = nodes.flatMap(n => getNodeDevices(n.id,'audio').map(d=>({...d,nodeId:n.id,nodeName:`Node ${n.id}`})));

  const fetchData = async () => {
    setLoading(true); setError('');
    try { const data = await client.fetchNodes(); setNodes(data); }
    catch (e) { setError(e instanceof Error ? e.message : '加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = () => {
    if (!selectedVideo || !selectedAudio) return;
    const name = viewName.trim() || `视图-${selectedVideo.name}/${selectedAudio.name}`;
    const cam: CameraView = {
      id: `cam-${Date.now()}`,
      name,
      status: 'online',
      videoDevice: selectedVideo.name,
      audioDevice: selectedAudio.name,
    };
    addCamera(cam);
    setShowPanel(false);
    setViewName('');
    setSelectedVideo(null);
    setSelectedAudio(null);
  };

  const handleSelect = (item: {name:string;nodeId:number}) => {
    if (pickerMode === 'video') setSelectedVideo(item);
    else if (pickerMode === 'audio') setSelectedAudio(item);
    setPickerMode(null);
  };

  const inputStyle: React.CSSProperties = {
    width:'100%',padding:'12px 16px',background:'var(--bg-canvas)',
    border:'1px solid rgba(255,255,255,.12)',borderRadius:'var(--radius-md)',
    color:'var(--text-primary)',fontSize:'var(--text-base)',outline:'none',
  };

  return (
    <div style={{ padding: 'var(--space-6)', height: '100%', overflow: 'auto' }}>
      <Card style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>设备信息</h2>
          <Button variant="primary" icon={Plus} onClick={() => setShowPanel(true)}>增添视图</Button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-4)' }}>
            <Skeleton style={{ height: 120 }} /><Skeleton style={{ height: 120 }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
            <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
            <Button variant="secondary" onClick={fetchData}>重试</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 'var(--space-4)' }}>
            {nodes.map(node => <DeviceNodeCard key={node.id} node={node} />)}
            {nodes.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-8)' }}>
                暂无节点数据
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add view panel */}
      <Panel open={showPanel} onClose={() => { setShowPanel(false); setSelectedVideo(null); setSelectedAudio(null); setViewName(''); }} title="增添监控视图" width={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* View name */}
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>视图名称</div>
            <input style={inputStyle} placeholder="输入视图名称（留空自动生成）" value={viewName}
              onChange={e => setViewName(e.target.value)} />
          </div>

          {/* Preview */}
          <div style={{
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,.08)', overflow: 'hidden',
          }}>
            <div style={{
              minHeight: 180, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
              color: 'var(--text-disabled)', padding: 'var(--space-6)',
            }}>
              <Camera size={56} />
              {selectedVideo || selectedAudio ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
                    {selectedVideo ? selectedVideo.name : '—'} / {selectedAudio ? selectedAudio.name : '—'}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-disabled)' }}>未选择设备</div>
                  <div style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>请选择 Video 和 Audio 设备</div>
                </div>
              )}
            </div>
            {/* Device labels */}
            <div style={{
              display: 'flex', borderTop: '1px solid rgba(255,255,255,.06)',
              padding: 'var(--space-3) var(--space-4)', gap: 'var(--space-4)',
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <Video size={14} style={{ color: selectedVideo ? 'var(--color-success)' : 'var(--text-disabled)' }} />
                <span style={{ color: selectedVideo ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                  {selectedVideo ? selectedVideo.name : '未选 Video'}
                </span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                <Mic size={14} style={{ color: selectedAudio ? 'var(--color-success)' : 'var(--text-disabled)' }} />
                <span style={{ color: selectedAudio ? 'var(--text-primary)' : 'var(--text-disabled)' }}>
                  {selectedAudio ? selectedAudio.name : '未选 Audio'}
                </span>
              </div>
            </div>
          </div>

          {/* Selection buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Button variant="secondary" icon={Video} style={{ width: '100%' }}
              onClick={() => setPickerMode('video')}>
              {selectedVideo ? `Video: ${selectedVideo.name}` : '选择 Video'}
            </Button>
            <Button variant="secondary" icon={Mic} style={{ width: '100%' }}
              onClick={() => setPickerMode('audio')}>
              {selectedAudio ? `Audio: ${selectedAudio.name}` : '选择 Audio'}
            </Button>
          </div>

          {/* Save */}
          <Button variant="primary" size="lg" style={{ width: '100%' }}
            disabled={!selectedVideo || !selectedAudio}
            onClick={handleSave}>
            保存
          </Button>
        </div>
      </Panel>

      {/* Device picker Modal */}
      {pickerMode && (
        <>
          <div onClick={() => setPickerMode(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 80 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 90,
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,.1)',
            padding: 'var(--space-6)', minWidth: 380, boxShadow: 'var(--shadow-lg)', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>
                选择 {pickerMode === 'video' ? 'Video' : 'Audio'} 设备
              </h3>
              <X size={20} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setPickerMode(null)} />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {(pickerMode==='video'?allVideos:allAudios).map((d,i) => (
                <Card key={`${d.nodeId}-${d.name}-${i}`} hoverable onClick={() => handleSelect(d)}
                  style={{ marginBottom: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)',
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <StatusDot status={d.status} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>
                      {d.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {d.nodeName} · {d.status==='online'?'在线':d.status==='alert'?'告警':'离线'}
                    </div>
                  </div>
                  {(pickerMode==='video' && selectedVideo?.name===d.name) ||
                   (pickerMode==='audio' && selectedAudio?.name===d.name) ? (
                    <div style={{ color: 'var(--color-success)', fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)' }}>已选</div>
                  ) : (
                    <div style={{ color: 'var(--color-info)', fontSize: 'var(--text-sm)' }}>选择</div>
                  )}
                </Card>
              ))}
              {(pickerMode==='video'?allVideos.length:allAudios.length) === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-disabled)' }}>暂无可用设备</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface DeviceItem { name: string; status: 'online' | 'offline' | 'alert'; }

function getNodeDevices(nodeId: number, type: 'video' | 'audio'): DeviceItem[] {
  if (type === 'video') {
    if (nodeId <= 3) return [
      { name: `Camera-${nodeId}A`, status: 'online' },
      { name: `Camera-${nodeId}B`, status: 'online' },
    ];
    return [{ name: `Camera-${nodeId}`, status: nodeId % 2 === 0 ? 'online' : 'offline' }];
  }
  if (nodeId <= 2) return [
    { name: `Mic-${nodeId}A`, status: 'online' },
    { name: `Mic-${nodeId}B`, status: 'online' },
  ];
  return [
    { name: `Mic-${nodeId}A`, status: 'online' },
    { name: `Mic-${nodeId}B`, status: nodeId % 3 === 0 ? 'alert' : 'online' },
  ];
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
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
            <div>状态：<span style={{ color: node.is_connected ? 'var(--color-success)' : 'var(--color-danger)' }}>{node.is_connected ? '在线' : '离线'}</span></div>
            <div style={{marginTop:2}}>最后上线：<span style={{ color: 'var(--text-primary)' }}>{node.last_seen || '未知'}</span></div>
          </div>
          {/* Video / Audio device groups */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Video size={14} /> Video
              </div>
              {getNodeDevices(node.id, 'video').map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', marginBottom: 4 }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{d.name}</span>
                  <StatusDot status={d.status} size="sm" />
                </div>
              ))}
            </div>
            <div style={{ flex: 1, background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mic size={14} /> Audio
              </div>
              {getNodeDevices(node.id, 'audio').map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', marginBottom: 4 }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{d.name}</span>
                  <StatusDot status={d.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
