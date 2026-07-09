import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAlerts } from '../context/AlertContext';
import { mockCameras } from '../data/mock';

const sevLabel: Record<string,string> = { danger:'高危',warning:'中危',caution:'低危' };

export default function LiveMonitor() {
  const { cameraId } = useParams<{ cameraId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { alerts } = useAlerts();
  const camera = mockCameras.find(c=>c.id===cameraId);
  const viewAlerts = alerts.filter(a=>a.status==='pending' && a.cameraId===cameraId);
  const from = (location.state as any)?.from || '/main';

  return (
    <div style={{display:'flex',height:'100%',gap:'var(--space-4)',padding:'var(--space-4)'}}>
      <div className="camera-feed-view" style={{flex:1,display:'flex',flexDirection:'column',
        background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid rgba(255,255,255,.06)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'var(--space-4)',left:'var(--space-4)',
          background:'var(--color-danger)',color:'#fff',padding:'2px 10px',borderRadius:'var(--radius-sm)',
          fontSize:'var(--text-xs)',fontWeight:'var(--font-bold)',letterSpacing:1,display:'flex',alignItems:'center',gap:'var(--space-1)'}}>
          <span style={{width:6,height:6,background:'#fff',borderRadius:'50%',animation:'pulse-ring 1.4s ease-out infinite'}}/>LIVE
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'var(--space-4)',color:'var(--text-disabled)'}}>
          <Camera size={80}/>
          <div style={{fontSize:28,fontWeight:'var(--font-bold)',color:'var(--text-secondary)'}}>
            {camera?.name || `视图 ${cameraId}`}
          </div>
        </div>
      </div>

      <div style={{width:360,flexShrink:0,display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
        <div style={{flex:1,background:'var(--bg-surface)',borderRadius:'var(--radius-md)',
          padding:'var(--space-4)',border:'1px solid rgba(255,255,255,.06)',overflowY:'auto',display:'flex',flexDirection:'column',gap:'var(--space-3)'}}>
          <div style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-semibold)',paddingBottom:'var(--space-2)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
            本视图告警 ({viewAlerts.length})
          </div>
          {viewAlerts.length===0 && (
            <div style={{color:'var(--text-disabled)',textAlign:'center',padding:'var(--space-8)'}}>当前视图无未处理告警</div>
          )}
          {viewAlerts.map(a=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:'var(--space-3)',
              padding:'var(--space-3)',borderRadius:'var(--radius-sm)',background:'var(--bg-canvas)',
              borderLeft:`3px solid var(--color-${a.severity})`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'var(--text-sm)',fontWeight:'var(--font-medium)'}}>{a.title}</div>
                <div style={{fontSize:'var(--text-xs)',color:'var(--text-secondary)',marginTop:2}}>{a.timestamp}</div>
              </div>
              <Badge level={a.severity}>{sevLabel[a.severity]}</Badge>
              <Button variant="danger" size="sm" onClick={()=>navigate(`/replay/${a.id}`,{state:{from:location.pathname}})}>查看回放</Button>
            </div>
          ))}
        </div>

        <div style={{background:'var(--bg-surface)',borderRadius:'var(--radius-md)',padding:'var(--space-4)',border:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginBottom:'var(--space-3)'}}>固定可用操作</div>
          <div style={{display:'flex',gap:'var(--space-3)'}}>
            <Button variant="secondary" onClick={()=>navigate(`/view/${cameraId}/edit`,{state:{from:location.pathname}})}>编辑电子围栏</Button>
            <Button variant="primary">手动录制</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
