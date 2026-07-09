import { useNavigate } from 'react-router-dom';
import { Eye, Radio, Bell, CheckCircle, AlertTriangle, ScrollText, Users, UserSquare, Monitor, Settings, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockKpiStats, mockCameras, mockAlerts } from '../data/mock';

const kpiIcons: Record<string, typeof Eye> = { Eye, Radio, Bell, CheckCircle, AlertTriangle };
const kpiColors = ['var(--color-info-dim)','var(--color-success-dim)','var(--color-danger-dim)','var(--color-success-dim)','var(--color-warning-dim)'];
const kpiIconColors = ['var(--color-info)','var(--color-success)','var(--color-danger)','var(--color-success)','var(--color-warning)'];

const quickActions = [
  { label:'查看日志',icon:ScrollText,path:'/log' },{ label:'用户管理',icon:Users,path:'/users' },
  { label:'人物管理',icon:UserSquare,path:'/characters' },{ label:'设备信息',icon:Monitor,path:'/equipment' },
  { label:'异常设置',icon:Settings,path:'/exception-settings' },
];

const severityLabel: Record<string,string> = { danger:'高危',warning:'中危',caution:'低危' };

export default function MainDashboard() {
  const navigate = useNavigate();

  const goTo = (path: string) => {
    // @ts-expect-error View Transition API
    if (document.startViewTransition) { /* @ts-expect-error */ document.startViewTransition(() => navigate(path)); }
    else navigate(path);
  };

  return (
    <div style={{padding:'var(--space-6)',display:'flex',flexDirection:'column',gap:'var(--space-4)',height:'100%',overflow:'auto'}}>
      {/* KPI Bar */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'var(--space-4)'}}>
        {mockKpiStats.map((s,i)=>{
          const Icon=kpiIcons[s.iconName];
          return (
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:'var(--space-4)',
              background:'var(--bg-surface)',borderRadius:'var(--radius-md)',padding:'var(--space-4) var(--space-5)',
              border:'1px solid rgba(255,255,255,.06)'}}>
              <div style={{width:48,height:48,borderRadius:'var(--radius-md)',
                display:'flex',alignItems:'center',justifyContent:'center',background:kpiColors[i],color:kpiIconColors[i],flexShrink:0}}>
                {Icon&&<Icon size={24}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'var(--text-3xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)',lineHeight:1.2}}>{s.value}</div>
                <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginTop:2}}>{s.label}</div>
                {s.trend!==0&&(
                  <div style={{fontSize:'var(--text-xs)',fontWeight:'var(--font-medium)',marginTop:2,color:s.trend>0?'var(--color-success)':'var(--color-danger)'}}>
                    {s.trend>0?'↑':'↓'}{Math.abs(s.trend)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Content: Camera + Alert */}
      <div style={{display:'flex',gap:'var(--space-4)',flex:1,minHeight:0}}>
        {/* Camera Grid */}
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:'var(--space-4)',minWidth:0}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-4)',flex:1,overflowY:'auto',alignContent:'start'}}>
            {mockCameras.map(cam=>(
              <div key={cam.id} className="camera-feed-main"
                onClick={()=>goTo('/view')}
                style={{display:'flex',flexDirection:'column',background:'var(--bg-surface)',
                  borderRadius:'var(--radius-md)',border:'1px solid rgba(255,255,255,.06)',overflow:'hidden',cursor:'pointer'}}>
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

          {/* Quick Actions */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'var(--space-3)',paddingTop:'var(--space-2)'}}>
            {quickActions.map(qa=>(
              <div key={qa.label} onClick={()=>navigate(qa.path)}
                style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'var(--space-2)',
                  padding:'var(--space-4)',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',
                  border:'1px solid rgba(255,255,255,.06)',cursor:'pointer',color:'var(--text-secondary)'}}>
                <qa.icon size={22}/>
                <span style={{fontSize:'var(--text-sm)'}}>{qa.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Panel */}
        <div style={{width:360,flexShrink:0,background:'var(--bg-surface)',borderRadius:'var(--radius-md)',
          padding:'var(--space-4)',border:'1px solid rgba(255,255,255,.06)',overflowY:'auto',display:'flex',flexDirection:'column',gap:'var(--space-3)'}}>
          <div style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-semibold)',paddingBottom:'var(--space-2)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>实时告警列表</div>
          {mockAlerts.map(a=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:'var(--space-3)',
              padding:'var(--space-3)',borderRadius:'var(--radius-sm)',background:'var(--bg-canvas)',
              borderLeft:`3px solid var(--color-${a.severity})`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'var(--text-sm)',fontWeight:'var(--font-medium)',color:'var(--text-primary)'}}>{a.title}</div>
                <div style={{fontSize:'var(--text-xs)',color:'var(--text-secondary)',marginTop:2}}>{a.timestamp} · {a.cameraView}</div>
              </div>
              <Badge level={a.severity}>{severityLabel[a.severity]}</Badge>
              <Button variant="ghost" size="sm" onClick={()=>navigate('/view')}>进入视图</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
