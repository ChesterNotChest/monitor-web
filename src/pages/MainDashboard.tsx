import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Monitor, AlertTriangle, Pencil, Trash2, PlusCircle, Video, Mic, Loader2 } from 'lucide-react';
import { useWhepPlayer } from '../hooks/useWhepPlayer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useAlerts } from '../context/AlertContext';
import { useCameras } from '../context/CameraContext';
import * as client from '../api/client';
import type { DashboardStats, ViewResponse, DashboardTrends } from '../api/types';
import { SeverityLabel, SeverityBadgeLevel } from '../api/enums';

export default function MainDashboard() {
  const navigate = useNavigate();
  const { alerts, refresh: refreshAlerts } = useAlerts();
  const { cameras: contextCameras, updateCamera, removeCamera } = useCameras();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [views, setViews] = useState<ViewResponse[]>([]);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const allViews = [...views, ...contextCameras.filter(c => !views.find(v => v.id === Number(c.id.split('-')[1]) || v.name === c.name))];
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const startRename = (id: string, name: string) => { setRenamingId(id); setRenameText(name); };
  const finishRename = (id: string) => { if (renameText.trim()) updateCamera(id, { name: renameText.trim() }); setRenamingId(null); };

  // Create view flow
  const [showCreate, setShowCreate] = useState(false);
  const [devices, setDevices] = useState<{videos: {id:number;name:string;nodeId:number;streaming:boolean}[], audios: {id:number;name:string;nodeId:number;streaming:boolean}[]}>({videos:[],audios:[]});
  const [createStep, setCreateStep] = useState<'select' | 'creating'>('select');
  const [selVideo, setSelVideo] = useState<number | null>(null);
  const [selAudio, setSelAudio] = useState<number | null>(null);
  const [createErr, setCreateErr] = useState('');

  const openCreate = async () => {
    setShowCreate(true); setCreateStep('select'); setSelVideo(null); setSelAudio(null); setCreateErr('');
    try {
      const nodes = await client.fetchNodes();
      const vProms = nodes.map(n => client.fetchNodeVideos(n.id).catch(() => []));
      const aProms = nodes.map(n => client.fetchNodeAudios(n.id).catch(() => []));
      const vAll = (await Promise.all(vProms)).flat();
      const aAll = (await Promise.all(aProms)).flat();
      setDevices({ videos: vAll, audios: aAll });
    } catch { setCreateErr('加载设备列表失败'); }
  };

  const doCreate = async () => {
    if (selVideo === null || selAudio === null) return;
    setCreateStep('creating'); setCreateErr('');
    try {
      const newView = await client.createView({ video_id: selVideo, audio_id: selAudio });
      setShowCreate(false);
      navigate(`/view/${newView.id}`, { state: { from: '/main' } });
    } catch (e) { setCreateErr(e instanceof Error ? e.message : '创建失败'); setCreateStep('select'); }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, v, t] = await Promise.all([
        client.fetchDashboardStats(),
        client.fetchViews(),
        client.fetchDashboardTrends(),
      ]);
      setStats(s);
      setViews(v);
      setTrends(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const goTo = (path: string, state?: unknown) => {
    if ((document as any).startViewTransition) {(document as any).startViewTransition(()=>navigate(path,{state}));}
    else navigate(path,{state});
  };

  const pendingAlerts = alerts;

  const kpiStats = stats ? [
    { label: '视图数', value: stats.total_views, icon: Camera },
    { label: '在线节点', value: stats.online_nodes, icon: Monitor },
    { label: '今日告警', value: stats.active_alerts, icon: null },
    { label: '已处理', value: 0, icon: null },
    { label: '待处理', value: pendingAlerts.length, icon: null },
  ] : [];

  return (
    <div style={{padding:'var(--space-6)',display:'flex',flexDirection:'column',gap:'var(--space-4)',height:'100%',overflow:'auto'}}>
      {/* KPI Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'var(--space-4)'}}>
        {loading ? (
          Array.from({length:5}).map((_,i)=>(
            <Skeleton key={i} style={{height:88,borderRadius:'var(--radius-md)'}} />
          ))
        ) : error ? (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:'var(--space-6)',color:'var(--color-danger)'}}>
            <AlertTriangle size={24} style={{marginBottom:'var(--space-2)'}} />
            <div>{error}</div>
            <Button variant="secondary" size="sm" style={{marginTop:'var(--space-3)'}} onClick={fetchData}>重试</Button>
          </div>
        ) : (
          kpiStats.map((s,i)=>{
            const colors=['var(--color-info-dim)','var(--color-success-dim)','var(--color-danger-dim)','var(--color-success-dim)','var(--color-warning-dim)'];
            const iconColors=['var(--color-info)','var(--color-success)','var(--color-danger)','var(--color-success)','var(--color-warning)'];
            return (
              <div key={s.label} style={{display:'flex',alignItems:'center',gap:'var(--space-4)',
                background:'var(--bg-surface)',borderRadius:'var(--radius-md)',padding:'var(--space-4) var(--space-5)',
                border:'1px solid rgba(255,255,255,.06)'}}>
                {s.icon && <div style={{width:48,height:48,borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',background:colors[i],color:iconColors[i],flexShrink:0}}>
                  <s.icon size={24}/>
                </div>}
                {!s.icon && <div style={{width:48,height:48,borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',background:colors[i],color:iconColors[i],flexShrink:0,fontWeight:'var(--font-bold)',fontSize:'var(--text-xl)'}}>{s.value}</div>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'var(--text-3xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)',lineHeight:1.2}}>{s.value}</div>
                  <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginTop:2}}>{s.label}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Trend Chart */}
      {!loading && !error && trends && trends.points.length > 0 && <TrendChart points={trends.points} />}

      {/* Views Grid + Actions + Alerts Panel */}
      <div style={{display:'flex',gap:'var(--space-4)',flex:1,minHeight:0}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:'var(--space-4)',minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'var(--space-4)',marginBottom:'var(--space-2)'}}>
            <span style={{fontSize:'var(--text-base)',fontWeight:'var(--font-semibold)',color:'var(--text-primary)'}}>监控视图</span>
            <Button variant="primary" size="sm" icon={PlusCircle} onClick={openCreate}>创建监控视图</Button>
            <Button variant="secondary" size="sm" onClick={async () => {
              try { await client.debugTriggerAlert(); alert('测试告警已触发，请检查钉钉群'); refreshAlerts(); }
              catch (e) { alert('触发失败: ' + (e instanceof Error ? e.message : String(e))); }
            }}>🔔 Debug 告警</Button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-4)',overflowY:'auto',alignContent:'start',maxHeight:440}}>
            {loading ? (
              Array.from({length:2}).map((_,i)=>(
                <Skeleton key={i} style={{height:160,borderRadius:'var(--radius-md)'}} />
              ))
            ) : views.length === 0 && allViews.length === 0 && !error ? (
              <div style={{gridColumn:'1/-1',textAlign:'center',color:'var(--text-disabled)',padding:'var(--space-8)'}}>暂无视图数据</div>
            ) : (
              allViews.map(view=>(
                <MiniViewCard key={view.id} view={view} renamingId={renamingId} renameText={renameText}
                  startRename={startRename} finishRename={finishRename}
                  removeCamera={removeCamera} fetchData={fetchData}
                  onClick={()=>goTo(`/view/${view.id}`,{from:'/main'})} />
              ))
            )}
          </div>
        </div>

        <div style={{width:360,flexShrink:0,background:'var(--bg-surface)',borderRadius:'var(--radius-md)',
          padding:'var(--space-4)',border:'1px solid rgba(255,255,255,.06)',overflowY:'auto',display:'flex',flexDirection:'column',gap:'var(--space-3)'}}>
          <div style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-semibold)',paddingBottom:'var(--space-2)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>实时告警列表</div>
          {pendingAlerts.map(a=>{
            const sev = (a.severity || 'WARNING').toUpperCase();
            const badgeLevel = sev === 'EMERGENCY' || sev === 'CRITICAL' ? 'danger' : sev === 'WARNING' ? 'warning' : 'neutral';
            const sevLabel = sev === 'EMERGENCY' ? '紧急' : sev === 'CRITICAL' ? '严重' : sev === 'WARNING' ? '中危' : '低危';
            const borderColor = sev === 'EMERGENCY' || sev === 'CRITICAL' ? 'var(--color-danger)' : sev === 'WARNING' ? 'var(--color-warning)' : 'var(--text-disabled)';
            const meta = [a.timestamp, `视图 ${a.view_id}`];
            if (a.track_id) meta.unshift(`Track #${a.track_id}`);
            return (
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:'var(--space-3)',
              padding:'var(--space-3)',borderRadius:'var(--radius-sm)',background:'var(--bg-canvas)',
              borderLeft:`3px solid ${borderColor}`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'var(--text-sm)',fontWeight:'var(--font-medium)',color:'var(--text-primary)'}}>{a.exception_name || `告警 #${a.id}`}</div>
                <div style={{fontSize:'var(--text-xs)',color:'var(--text-secondary)',marginTop:2}}>{meta.join(' · ')}</div>
              </div>
              <Badge level={badgeLevel}>{sevLabel}</Badge>
              <Button variant="ghost" size="sm" onClick={()=>goTo(`/view/${a.view_id}`,{from:'/main'})}>进入视图</Button>
            </div>
            );
          })}
          {pendingAlerts.length===0&&<div style={{color:'var(--text-disabled)',textAlign:'center',padding:'var(--space-8)'}}>暂无未处理告警</div>}
        </div>
      </div>

      {/* Create View Modal */}
      {showCreate && (
        <>
          <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 70 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 80,
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,.1)',
            padding: 'var(--space-6)', minWidth: 480, maxHeight: '80vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>创建监控视图</h3>
              <div style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowCreate(false)}>✕</div>
            </div>

            {createStep === 'creating' ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-info)', marginBottom: 'var(--space-3)' }} />
                <div style={{ color: 'var(--text-secondary)' }}>正在创建视图，等待节点推流...</div>
                <div style={{ color: 'var(--text-disabled)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>约需 8 秒</div>
              </div>
            ) : (
              <>
                {createErr && <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>{createErr}</div>}

                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>选择视频设备</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-4)', maxHeight: 160, overflowY: 'auto' }}>
                  {devices.videos.length === 0 && <div style={{ color: 'var(--text-disabled)', padding: 'var(--space-2)' }}>无可用视频设备</div>}
                  {devices.videos.map(d => (
                    <Card key={d.id} selected={selVideo === d.id} hoverable onClick={() => setSelVideo(d.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)' }}>
                      <Video size={14} style={{ color: d.streaming ? 'var(--color-success)' : 'var(--text-disabled)' }} />
                      <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{d.name}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: d.streaming ? 'var(--color-success)' : 'var(--text-disabled)' }}>
                        {d.streaming ? '推送中' : '空闲'}
                      </span>
                    </Card>
                  ))}
                </div>

                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>选择音频设备</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginBottom: 'var(--space-4)', maxHeight: 160, overflowY: 'auto' }}>
                  {devices.audios.length === 0 && <div style={{ color: 'var(--text-disabled)', padding: 'var(--space-2)' }}>无可用音频设备</div>}
                  {devices.audios.map(d => (
                    <Card key={d.id} selected={selAudio === d.id} hoverable onClick={() => setSelAudio(d.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)' }}>
                      <Mic size={14} style={{ color: d.streaming ? 'var(--color-success)' : 'var(--text-disabled)' }} />
                      <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{d.name}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: d.streaming ? 'var(--color-success)' : 'var(--text-disabled)' }}>
                        {d.streaming ? '推送中' : '空闲'}
                      </span>
                    </Card>
                  ))}
                </div>

                <Button variant="primary" style={{ width: '100%' }} disabled={selVideo === null || selAudio === null} onClick={doCreate}>
                  创建视图
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Trend Chart (pure SVG, zero dependencies) ──

const SEVERITY_COLORS: Record<string, string> = {
  INFO: 'var(--color-info)',
  WARNING: 'var(--color-warning)',
  CRITICAL: 'var(--color-danger)',
  EMERGENCY: '#ff4444',
};

function TrendChart({ points }: { points: { date: string; severity: string; count: number }[] }) {
  const maxCount = Math.max(...points.map(p => p.count), 1);
  const barWidth = 12;
  const gap = 4;
  const totalWidth = points.length * (barWidth + gap);
  const chartH = 120;

  return (
    <div style={{
      background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4) var(--space-5)',
      border: '1px solid rgba(255,255,255,.06)',
    }}>
      <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
        告警趋势
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg width={Math.max(totalWidth, 300)} height={chartH + 30} style={{ display: 'block' }}>
          {/* Bars */}
          {points.map((p, i) => {
            const barH = Math.max((p.count / maxCount) * chartH, 2);
            const x = i * (barWidth + gap);
            const y = chartH - barH;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill={SEVERITY_COLORS[p.severity] || 'var(--color-info)'}
                rx={2}
              >
                <title>{p.date} {p.severity}: {p.count}</title>
              </rect>
            );
          })}
          {/* Baseline */}
          <line x1={0} y1={chartH} x2={totalWidth} y2={chartH} stroke="rgba(255,255,255,.1)" strokeWidth={1} />
          {/* Date labels (every ~7th) */}
          {points.map((p, i) => {
            if (i % Math.max(Math.floor(points.length / 6), 1) !== 0) return null;
            return (
              <text
                key={`lbl-${i}`}
                x={i * (barWidth + gap) + barWidth / 2}
                y={chartH + 16}
                textAnchor="middle"
                fill="var(--text-disabled)"
                fontSize={10}
              >
                {p.date.slice(5)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Mini view card with live video ──

function MiniViewCard({ view, renamingId, renameText, startRename, finishRename, removeCamera, fetchData, onClick }: {
  view: any; renamingId: string | null; renameText: string;
  startRename: (id: string, name: string) => void; finishRename: (id: string) => void;
  removeCamera: (id: string) => void; fetchData: () => void; onClick: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const webrtcUrl = (view as any).webrtc_url || `http://127.0.0.1:1985/rtc/v1/whep/?app=live&stream=${view.id}`;
  const { status } = useWhepPlayer(videoRef, webrtcUrl);

  return (
    <div onClick={onClick}
      style={{display:'flex',flexDirection:'column',background:'var(--bg-surface)',
        borderRadius:'var(--radius-md)',border:'1px solid rgba(255,255,255,.06)',overflow:'hidden',cursor:'pointer'}}>
      <div style={{flex:1,background:'var(--bg-elevated)',minHeight:100,position:'relative'}}>
        <video ref={videoRef} style={{width:'100%',height:'100%',objectFit:'cover',background:'#000',
          display: status==='playing'?'block':'none'}} muted playsInline autoPlay />
        {status !== 'playing' && (
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {status === 'connecting' ? (
              <Loader2 size={24} style={{animation:'spin 1s linear infinite',color:'var(--text-info)'}} />
            ) : (
              <Camera size={32} style={{color:'var(--text-disabled)'}} />
            )}
            <span style={{position:'absolute',bottom:4,fontSize:10,color:'var(--text-disabled)'}}>{status}</span>
          </div>
        )}
        <span style={{position:'absolute',bottom:2,right:4,fontSize:9,color:'rgba(255,255,255,.3)',zIndex:5}}>{status}</span>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'var(--space-3) var(--space-4)',borderTop:'1px solid rgba(255,255,255,.04)'}}
        onClick={e=>e.stopPropagation()}>
        {renamingId===String(view.id) ? (
          <input autoFocus value={renameText}
            onChange={e=>startRename(String(view.id), (e.target as HTMLInputElement).value)}
            onKeyDown={e=>{if(e.key==='Enter')finishRename(String(view.id));if(e.key==='Escape'){e.currentTarget.blur();}}}
            style={{flex:1,padding:'4px 8px',background:'var(--bg-canvas)',border:'1px solid var(--color-info)',
              borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'var(--text-sm)',outline:'none'}} />
        ) : (
          <span style={{fontSize:'var(--text-sm)',fontWeight:'var(--font-medium)',color:'var(--text-primary)',display:'flex',alignItems:'center',gap:4,flex:1,minWidth:0}}>
            <span className="truncate" style={{flex:1}}>{(view as any).name || `视图 ${view.id}`}</span>
            <Pencil size={12} style={{color:'var(--text-disabled)',cursor:'pointer',flexShrink:0}} onClick={()=>startRename(String(view.id),(view as any).name||'')} />
            <Trash2 size={12} style={{color:'var(--text-disabled)',cursor:'pointer',flexShrink:0}}
              onClick={e=>{e.stopPropagation();
                if (typeof view.id === 'number') client.deleteView(view.id).then(fetchData).catch(()=>{});
                else removeCamera(String(view.id));
              }} />
          </span>
        )}
      </div>
    </div>
  );
}
