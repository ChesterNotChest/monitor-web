import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollText, Users, UserSquare, Monitor, Settings, Camera, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAlerts } from '../context/AlertContext';
import { useCameras } from '../context/CameraContext';
import * as client from '../api/client';
import type { DashboardStats, ViewResponse, DashboardTrends } from '../api/types';
import { SeverityLabel, SeverityBadgeLevel } from '../api/enums';

const quickActions = [
  { label:'查看日志',icon:ScrollText,path:'/log' },{ label:'用户管理',icon:Users,path:'/users' },
  { label:'人物管理',icon:UserSquare,path:'/characters' },{ label:'设备信息',icon:Monitor,path:'/equipment' },
  { label:'异常设置',icon:Settings,path:'/exception-settings' },
];

export default function MainDashboard() {
  const navigate = useNavigate();
  const { alerts } = useAlerts();
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
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-4)',overflowY:'auto',alignContent:'start',maxHeight:340}}>
            {loading ? (
              Array.from({length:2}).map((_,i)=>(
                <Skeleton key={i} style={{height:160,borderRadius:'var(--radius-md)'}} />
              ))
            ) : views.length === 0 && allViews.length === 0 && !error ? (
              <div style={{gridColumn:'1/-1',textAlign:'center',color:'var(--text-disabled)',padding:'var(--space-8)'}}>暂无视图数据</div>
            ) : (
              allViews.map(view=>(
                <div key={view.id}
                  onClick={()=>goTo(`/view/${view.id}`,{from:'/main'})}
                  style={{display:'flex',flexDirection:'column',background:'var(--bg-surface)',
                    borderRadius:'var(--radius-md)',border:'1px solid rgba(255,255,255,.06)',overflow:'hidden',cursor:'pointer'}}>
                  <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',
                    background:'var(--bg-elevated)',minHeight:100}}>
                    <Camera size={32} style={{color:'var(--text-disabled)'}}/>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'var(--space-3) var(--space-4)',borderTop:'1px solid rgba(255,255,255,.04)'}}
                    onClick={e=>e.stopPropagation()}>
                    {renamingId===String(view.id) ? (
                      <input autoFocus value={renameText}
                        onChange={e=>setRenameText(e.target.value)}
                        onKeyDown={e=>{if(e.key==='Enter')finishRename(String(view.id));if(e.key==='Escape')setRenamingId(null);}}
                        onBlur={()=>finishRename(String(view.id))}
                        style={{flex:1,padding:'4px 8px',background:'var(--bg-canvas)',border:'1px solid var(--color-info)',
                          borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'var(--text-sm)',outline:'none'}}
                      />
                    ) : (
                      <span style={{fontSize:'var(--text-sm)',fontWeight:'var(--font-medium)',color:'var(--text-primary)',display:'flex',alignItems:'center',gap:4,flex:1,minWidth:0}}>
                        <span className="truncate" style={{flex:1}}>{(view as any).name || `视图 ${view.id}`}</span>
                        <Pencil size={12} style={{color:'var(--text-disabled)',cursor:'pointer',flexShrink:0}}
                          onClick={()=>startRename(String(view.id),(view as any).name||'')} />
                        <Trash2 size={12} style={{color:'var(--text-disabled)',cursor:'pointer',flexShrink:0}}
                          onClick={e=>{e.stopPropagation();removeCamera(String(view.id));}} />
                      </span>
                    )}
                    <Button variant="ghost" size="sm">进入视图</Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'var(--space-3)',paddingTop:'var(--space-2)'}}>
            {quickActions.map(qa=>(
              <div key={qa.label} onClick={()=>navigate(qa.path)}
                style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'var(--space-2)',
                  padding:'var(--space-4)',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',
                  border:'1px solid rgba(255,255,255,.06)',cursor:'pointer',color:'var(--text-secondary)'}}>
                <qa.icon size={22}/><span style={{fontSize:'var(--text-sm)'}}>{qa.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{width:360,flexShrink:0,background:'var(--bg-surface)',borderRadius:'var(--radius-md)',
          padding:'var(--space-4)',border:'1px solid rgba(255,255,255,.06)',overflowY:'auto',display:'flex',flexDirection:'column',gap:'var(--space-3)'}}>
          <div style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-semibold)',paddingBottom:'var(--space-2)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>实时告警列表</div>
          {pendingAlerts.map(a=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:'var(--space-3)',
              padding:'var(--space-3)',borderRadius:'var(--radius-sm)',background:'var(--bg-canvas)',
              borderLeft:'3px solid var(--color-danger)'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'var(--text-sm)',fontWeight:'var(--font-medium)',color:'var(--text-primary)'}}>告警 #{a.id}</div>
                <div style={{fontSize:'var(--text-xs)',color:'var(--text-secondary)',marginTop:2}}>{a.timestamp} · 视图 {a.view_id}</div>
              </div>
              <Badge level="danger">待处理</Badge>
              <Button variant="ghost" size="sm" onClick={()=>goTo(`/view/${a.view_id}`,{from:'/main'})}>进入视图</Button>
            </div>
          ))}
          {pendingAlerts.length===0&&<div style={{color:'var(--text-disabled)',textAlign:'center',padding:'var(--space-8)'}}>暂无未处理告警</div>}
        </div>
      </div>
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
