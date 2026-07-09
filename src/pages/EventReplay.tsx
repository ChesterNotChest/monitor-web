import { useNavigate, useParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockAlerts } from '../data/mock';

export default function EventReplay() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const alert = mockAlerts.find(a=>a.id===eventId) || mockAlerts[0];
  const sevLabel: Record<string,string> = { danger:'高危',warning:'中危',caution:'低危' };

  return (
    <div style={{display:'flex',height:'100%',gap:'var(--space-4)',padding:'var(--space-4)'}}>
      {/* Replay video */}
      <div style={{flex:1,display:'flex',flexDirection:'column',
        background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid rgba(255,255,255,.06)',overflow:'hidden',position:'relative'}}>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Camera size={80} style={{color:'var(--text-disabled)'}}/>
          <span style={{fontSize:40,fontWeight:'var(--font-bold)',color:'var(--text-secondary)',marginLeft:'var(--space-4)'}}>事件的雷霆回放画面</span>
        </div>
        {/* Progress bar */}
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

      {/* Event detail panel */}
      <div style={{width:360,flexShrink:0,display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
        <div style={{background:'var(--bg-surface)',borderRadius:'var(--radius-md)',padding:'var(--space-4)',border:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{padding:'var(--space-4)',background:'var(--color-warning-dim)',borderRadius:'var(--radius-md)',marginBottom:'var(--space-4)',textAlign:'center'}}>
            <div style={{fontSize:'var(--text-xl)',fontWeight:'var(--font-bold)',color:'var(--color-info)'}}>{alert.title} 雷霆事件</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'var(--space-3)',fontSize:'var(--text-base)',color:'var(--text-secondary)'}}>
            <div>告警级别：<Badge level={alert.severity}>{sevLabel[alert.severity]}</Badge></div>
            <div>告警类型：<span style={{color:'var(--text-primary)'}}>{alert.type}</span></div>
            <div>发生时间：<span style={{color:'var(--text-primary)',fontFamily:'var(--font-mono)'}}>{alert.timestamp}</span></div>
            <div>关联视图：<span style={{color:'var(--text-primary)'}}>{alert.cameraView}</span></div>
          </div>
        </div>

        <div style={{display:'flex',gap:'var(--space-3)'}}>
          <Button variant="secondary" icon={Camera} size="lg" style={{flex:1}} onClick={()=>navigate(-1)}>设为误报</Button>
          <Button variant="primary" size="lg" style={{flex:1}}>设为已处理</Button>
        </div>
      </div>
    </div>
  );
}
