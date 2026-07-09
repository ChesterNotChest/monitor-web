import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAlerts } from '../context/AlertContext';

export default function EventReplay() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts, markHandled, markFalseAlarm } = useAlerts();
  const alertId = Number(eventId);
  const alert = alerts.find(a => a.id === alertId);
  const st = (location.state as any) || {};
  const from = st.from || '';

  if (!alert) {
    return (
      <div style={{padding:'var(--space-8)',textAlign:'center',color:'var(--text-disabled)'}}>
        未找到该告警事件 (ID: {eventId})
      </div>
    );
  }

  const handleMark = (action: 'resolved' | 'false-alarm') => {
    if (action === 'resolved') markHandled(alert.id);
    else markFalseAlarm(alert.id);
  };

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
            视图 {alert.view_id} · 事件回放
          </div>
          <div style={{fontSize:'var(--text-lg)',color:'var(--text-disabled)'}}>
            告警 #{alert.id}
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
            <div style={{fontSize:'var(--text-xl)',fontWeight:'var(--font-bold)',color:'var(--color-info)'}}>告警 #{alert.id}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'var(--space-3)',fontSize:'var(--text-base)',color:'var(--text-secondary)'}}>
            <div>告警级别：<Badge level="warning">中危</Badge></div>
            <div>发生时间：<span style={{color:'var(--text-primary)',fontFamily:'var(--font-mono)'}}>{alert.timestamp}</span></div>
            <div>关联视图：<span style={{color:'var(--text-primary)',cursor:'pointer'}} onClick={()=>navigate(`/view/${alert.view_id}`,{state:{from:`/replay/${alert.id}`}})}>视图 {alert.view_id}</span></div>
            <div>异常定义：<Badge level="neutral">#{alert.exception_id}</Badge></div>
            <div style={{marginTop:'var(--space-2)',padding:'var(--space-3)',background:'var(--bg-canvas)',borderRadius:'var(--radius-sm)',
              display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{color:'var(--text-secondary)'}}>处理状态</span>
              <Badge level="danger">未处理</Badge>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:'var(--space-3)'}}>
          <Button variant="secondary" size="lg" style={{flex:1}} onClick={()=>handleMark('false-alarm')}>设为误报</Button>
          <Button variant="primary" size="lg" style={{flex:1}} onClick={()=>handleMark('resolved')}>设为已处理</Button>
        </div>

        {from && (
          <Button variant="ghost" size="sm" style={{width:'100%'}} onClick={goBack}>返回</Button>
        )}
      </div>
    </div>
  );
}
