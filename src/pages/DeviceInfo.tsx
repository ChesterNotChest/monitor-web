import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { StatusDot } from '../components/ui/StatusDot';
import { Card } from '../components/ui/Card';
import { mockDeviceNodes } from '../data/mock';

export default function DeviceInfo() {
  return (
    <div style={{padding:'var(--space-6)',height:'100%',overflow:'auto'}}>
      <Card style={{padding:'var(--space-6)'}}>
        <h2 style={{fontSize:'var(--text-2xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)',marginBottom:'var(--space-6)'}}>设备信息</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'var(--space-4)'}}>
          {mockDeviceNodes.map(node=>(
            <DeviceNodeCard key={node.id} node={node} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function DeviceNodeCard({ node }: { node: typeof mockDeviceNodes[0] }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{background:node.abnormal?'var(--color-danger-dim)':'var(--bg-canvas)',
      borderRadius:'var(--radius-md)',border:`1px solid ${node.abnormal?'rgba(240,71,71,.3)':'rgba(255,255,255,.06)'}`,overflow:'hidden'}}>
      <div onClick={()=>setCollapsed(c=>!c)} style={{display:'flex',alignItems:'center',gap:'var(--space-2)',
        padding:'var(--space-4)',cursor:'pointer',fontSize:'var(--text-xl)',fontWeight:'var(--font-semibold)',color:'var(--text-primary)'}}>
        {collapsed?<ChevronRight size={20}/>:<ChevronDown size={20}/>}<span>{node.name}</span>
        {node.abnormal && <StatusDot status="alert" pulse size="sm"/>}
      </div>
      {!collapsed && (
        <div style={{padding:'var(--space-4)',display:'flex',gap:'var(--space-3)'}}>
          {/* Video group */}
          <div style={{flex:1,background:'var(--bg-surface)',borderRadius:'var(--radius-sm)',padding:'var(--space-3)'}}>
            <div style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-semibold)',marginBottom:'var(--space-2)',textAlign:'center',color:'var(--text-primary)'}}>video</div>
            {node.video.map((d,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'var(--space-3)',background:'var(--bg-elevated)',borderRadius:'var(--radius-sm)',marginBottom:'var(--space-2)'}}>
                <span style={{fontSize:'var(--text-base)',color:'var(--text-primary)'}}>{d.name}</span>
                <StatusDot status={d.status} pulse={d.status==='alert'} size="sm"/>
              </div>
            ))}
          </div>
          {/* Audio group */}
          <div style={{flex:1,background:'var(--bg-surface)',borderRadius:'var(--radius-sm)',padding:'var(--space-3)'}}>
            <div style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-semibold)',marginBottom:'var(--space-2)',textAlign:'center',color:'var(--text-primary)'}}>audio</div>
            {node.audio.map((d,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'var(--space-3)',background:'var(--bg-elevated)',borderRadius:'var(--radius-sm)',marginBottom:'var(--space-2)'}}>
                <span style={{fontSize:'var(--text-base)',color:'var(--text-primary)'}}>{d.name}</span>
                <StatusDot status={d.status} pulse={d.status==='alert'} size="sm"/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
