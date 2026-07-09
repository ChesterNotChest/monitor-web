import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAlerts } from '../context/AlertContext';

const sevLabel: Record<string,string> = { danger:'高危',warning:'中危',caution:'低危' };

export default function EventReplay() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts, updateAlert } = useAlerts();
  const alert = alerts.find(a=>a.id===eventId);
  const st = (location.state as any) || {};
  const from = st.from || '';
  const reportStatus = st.reportStatus as string|undefined;

  if (!alert) {
    return <div style={{padding:'var(--space-8)',textAlign:'center',color:'var(--text-disabled)'}}>未找到该告警事件</div>;
  }

  const displayStatus = reportStatus
    ? (reportStatus==='已处理'?'resolved':reportStatus==='标记误报'?'false-alarm':'pending')
    : alert.status;
  const isFromReport = from.startsWith('/report') || from.startsWith('/weekly-report');
  const isResolved = displayStatus==='resolved' || displayStatus==='false-alarm';

  const handleMark = (status: 'resolved' | 'false-alarm') => {
    updateAlert(alert.id, { status });
  };

  const statusText: Record<string,string> = { pending:'未处理',resolved:'已处理','false-alarm':'标记误报' };

  const goBack = () => {
    if (from) navigate(from);
    else navigate('/main');
  };

  return (
    <div style={{display:'flex',height:'100%',gap:'var(--space-4)',padding:'var(--space-4)'}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',
        background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid rgba(255,255,255,.06)',overflow:'hidden',position:'relative'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'var(--space-3)',color:'var(--text-disabled)'}}>
          <Camera size={80}/>
          <div style={{fontSize:28,fontWeight:'var(--font-bold)',color:'var(--text-secondary)'}}>
            {alert.cameraView} · 事件回放
          </div>
          <div style={{fontSize:'var(--text-lg)',color:'var(--text-disabled)'}}>
            告警：{alert.title}
          </div>
        </div>
        <div style={{padding:'var(--space-4) var(--space-6)'}}>
          <div style={{position:'relative',height:6,background:'var(--bg-elevated)',borderRadius:3}}>
            <div style={{position:'absolute',left:0,top:0,height:6,width:'25%',background:'var(--color-info)',borderRadius:3}}/>
            <div style={{position:'absolute',left:'25%',top:-5,width:16,height:16,borderRadius:'50%',background:'#fff',border:'2px solid var(--color-info)',transform:'translateX(-50%)'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:'var(--space-1)',fontSize:'var(--text-xs)',color:'var(--text-secondary)'}}>
            <span>00:12</span><span>02:45</span>
          </div>
        </div>
      </div>

      <div style={{width:360,flexShrink:0,display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
        <div style={{background:'var(--bg-surface)',borderRadius:'var(--radius-md)',padding:'var(--space-4)',border:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{padding:'var(--space-4)',background:'var(--color-warning-dim)',borderRadius:'var(--radius-md)',marginBottom:'var(--space-4)',textAlign:'center'}}>
            <div style={{fontSize:'var(--text-xl)',fontWeight:'var(--font-bold)',color:'var(--color-info)'}}>{alert.title}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'var(--space-3)',fontSize:'var(--text-base)',color:'var(--text-secondary)'}}>
            <div>告警级别：<Badge level={alert.severity}>{sevLabel[alert.severity]}</Badge></div>
            <div>告警类型：<span style={{color:'var(--text-primary)'}}>{alert.type}</span></div>
            <div>发生时间：<span style={{color:'var(--text-primary)',fontFamily:'var(--font-mono)'}}>{alert.timestamp}</span></div>
            <div>关联视图：<span style={{color:'var(--text-primary)',cursor:'pointer'}} onClick={()=>navigate(`/view/${alert.cameraId}`,{state:{from:`/replay/${alert.id}`}})}>{alert.cameraView}</span></div>
            {/* Status display - always visible */}
            <div style={{marginTop:'var(--space-2)',padding:'var(--space-3)',background:'var(--bg-canvas)',borderRadius:'var(--radius-sm)',
              display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{color:'var(--text-secondary)'}}>处理状态</span>
              <Badge level={isResolved?(displayStatus==='false-alarm'?'caution':'success'):'danger'}>{statusText[displayStatus]}</Badge>
            </div>
          </div>
        </div>

        {/* Buttons: show action buttons from monitor, status only from reports */}
        {!isFromReport && !isResolved && (
          <div style={{display:'flex',gap:'var(--space-3)'}}>
            <Button variant="secondary" size="lg" style={{flex:1}} onClick={()=>handleMark('false-alarm')}>设为误报</Button>
            <Button variant="primary" size="lg" style={{flex:1}} onClick={()=>handleMark('resolved')}>设为已处理</Button>
          </div>
        )}
        {!isFromReport && isResolved && (
          <div style={{textAlign:'center',padding:'var(--space-3)',background:'var(--bg-surface)',borderRadius:'var(--radius-md)',
            color:displayStatus==='false-alarm'?'var(--color-caution)':'var(--color-success)',fontWeight:'var(--font-medium)'}}>
            此告警已{statusText[displayStatus]}
          </div>
        )}
        {(from && !isFromReport) && (
          <Button variant="ghost" size="sm" style={{width:'100%'}} onClick={goBack}>返回</Button>
        )}
      </div>
    </div>
  );
}
