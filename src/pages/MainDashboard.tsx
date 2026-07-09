import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Radio, Bell, CheckCircle, AlertTriangle, ScrollText, Users, UserSquare, Monitor, Settings, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAlerts } from '../context/AlertContext';
import { mockKpiStats, mockCameras } from '../data/mock';

const kpiIcons: Record<string,typeof Eye> = { Eye,Radio,Bell,CheckCircle,AlertTriangle };
const kpiColors = ['var(--color-info-dim)','var(--color-success-dim)','var(--color-danger-dim)','var(--color-success-dim)','var(--color-warning-dim)'];
const kpiIconColors = ['var(--color-info)','var(--color-success)','var(--color-danger)','var(--color-success)','var(--color-warning)'];
const sevOrder = { danger:3,warning:2,caution:1 } as const;

const quickActions = [
  { label:'查看日志',icon:ScrollText,path:'/log' },{ label:'用户管理',icon:Users,path:'/users' },
  { label:'人物管理',icon:UserSquare,path:'/characters' },{ label:'设备信息',icon:Monitor,path:'/equipment' },
  { label:'异常设置',icon:Settings,path:'/exception-settings' },
];
const sevLabel: Record<string,string> = { danger:'高危',warning:'中危',caution:'低危' };

export default function MainDashboard() {
  const navigate = useNavigate();
  const { alerts } = useAlerts();

  const kpiStats = useMemo(()=>{
    const total = alerts.length;
    const resolved = alerts.filter(a=>a.status==='resolved'||a.status==='false-alarm').length;
    const pending = alerts.filter(a=>a.status==='pending').length;
    return mockKpiStats.map((s,i)=>{
      if (i===2) return {...s,value:total};
      if (i===3) return {...s,value:resolved};
      if (i===4) return {...s,value:pending};
      return s;
    });
  },[alerts]);

  const camAlertSev = useMemo(()=>{
    const m: Record<string,keyof typeof sevOrder> = {};
    for (const a of alerts) {
      if (a.status!=='pending') continue;
      if (!m[a.cameraId]||sevOrder[a.severity]>sevOrder[m[a.cameraId]]) m[a.cameraId]=a.severity;
    }
    return m;
  },[alerts]);

  const sevBorder = (camId:string) => {
    const s=camAlertSev[camId];
    return s?`2px solid var(--color-${s})`:'1px solid rgba(255,255,255,.06)';
  };

  const goTo = (path:string, state?:any) => {
    if ((document as any).startViewTransition) {(document as any).startViewTransition(()=>navigate(path,{state}));}
    else navigate(path,{state});
  };

  const pendingAlerts = alerts.filter(a=>a.status==='pending');

  return (
    <div style={{padding:'var(--space-6)',display:'flex',flexDirection:'column',gap:'var(--space-4)',height:'100%',overflow:'auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'var(--space-4)'}}>
        {kpiStats.map((s,i)=>{
          const Icon=kpiIcons[s.iconName];
          const trendCls=s.trend>0?'var(--color-success)':s.trend<0?'var(--color-danger)':'var(--text-disabled)';
          return (
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:'var(--space-4)',
              background:'var(--bg-surface)',borderRadius:'var(--radius-md)',padding:'var(--space-4) var(--space-5)',
              border:'1px solid rgba(255,255,255,.06)'}}>
              <div style={{width:48,height:48,borderRadius:'var(--radius-md)',display:'flex',alignItems:'center',justifyContent:'center',background:kpiColors[i],color:kpiIconColors[i],flexShrink:0}}>
                {Icon&&<Icon size={24}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'var(--text-3xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)',lineHeight:1.2}}>{s.value}</div>
                <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginTop:2}}>{s.label}</div>
                {s.trend!==0&&<div style={{fontSize:'var(--text-xs)',fontWeight:'var(--font-medium)',marginTop:2,color:trendCls}}>{s.trend>0?'↑':'↓'}{Math.abs(s.trend)}%</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{display:'flex',gap:'var(--space-4)',flex:1,minHeight:0}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:'var(--space-4)',minWidth:0}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-4)',flex:1,overflowY:'auto',alignContent:'start'}}>
            {mockCameras.map(cam=>(
              <div key={cam.id} className="camera-feed-main"
                onClick={()=>goTo(`/view/${cam.id}`,{from:'/main'})}
                style={{display:'flex',flexDirection:'column',background:'var(--bg-surface)',
                  borderRadius:'var(--radius-md)',border:sevBorder(cam.id),overflow:'hidden',cursor:'pointer'}}>
                <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',
                  background:'var(--bg-elevated)',minHeight:100}}>
                  <Camera size={32} style={{color:'var(--text-disabled)'}}/>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'var(--space-3) var(--space-4)',borderTop:'1px solid rgba(255,255,255,.04)'}}>
                  <span style={{fontSize:'var(--text-sm)',fontWeight:'var(--font-medium)',color:'var(--text-primary)'}}>{cam.name}</span>
                  <Button variant="ghost" size="sm">进入视图</Button>
                </div>
              </div>
            ))}
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
              borderLeft:`3px solid var(--color-${a.severity})`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'var(--text-sm)',fontWeight:'var(--font-medium)',color:'var(--text-primary)'}}>{a.title}</div>
                <div style={{fontSize:'var(--text-xs)',color:'var(--text-secondary)',marginTop:2}}>{a.timestamp} · {a.cameraView}</div>
              </div>
              <Badge level={a.severity}>{sevLabel[a.severity]}</Badge>
              <Button variant="ghost" size="sm" onClick={()=>goTo(`/view/${a.cameraId}`,{from:'/main'})}>进入视图</Button>
            </div>
          ))}
          {pendingAlerts.length===0&&<div style={{color:'var(--text-disabled)',textAlign:'center',padding:'var(--space-8)'}}>暂无未处理告警</div>}
        </div>
      </div>
    </div>
  );
}
