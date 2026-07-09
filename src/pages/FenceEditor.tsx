import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function FenceEditor() {
  const { viewId } = useParams<{ viewId: string }>();
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const zones = ['区域1','区域2'];

  return (
    <div style={{display:'flex',height:'100%',gap:'var(--space-4)',padding:'var(--space-4)'}}>
      {/* Video placeholder */}
      <div style={{flex:1,display:'flex',flexDirection:'column',
        background:'var(--bg-surface)',borderRadius:'var(--radius-md)',border:'1px solid rgba(255,255,255,.06)',position:'relative',overflow:'hidden'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'var(--space-3)',color:'var(--text-disabled)'}}>
          <Camera size={80}/>
          <div style={{fontSize:48,fontWeight:'var(--font-bold)',color:'var(--text-secondary)'}}>实时雷霆监控画面</div>
          <div style={{fontSize:'var(--text-xl)',color:'var(--text-secondary)'}}>（点了编辑后允许点击画框）</div>
        </div>
        <div style={{padding:'var(--space-4)',textAlign:'center',fontSize:'var(--text-sm)',color:'var(--text-disabled)'}}>
          摄像机: {viewId}
        </div>
      </div>

      {/* Fence zone sidebar */}
      <div style={{width:360,flexShrink:0,display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
        {/* Zone list */}
        <div style={{flex:1,background:'var(--bg-surface)',borderRadius:'var(--radius-md)',
          padding:'var(--space-4)',border:'1px solid rgba(255,255,255,.06)',overflowY:'auto',display:'flex',flexDirection:'column',gap:'var(--space-3)'}}>
          <div style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-semibold)',paddingBottom:'var(--space-2)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>围栏区域</div>
          {zones.map(z=>(
            <Card key={z} selected={selectedZone===z} hoverable onClick={()=>setSelectedZone(s=>s===z?null:z)}
              style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'var(--space-4)'}}>
              <span style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-medium)'}}>{z}</span>
              <Button variant="secondary" size="sm">编辑</Button>
            </Card>
          ))}

          {/* Point instruction */}
          {selectedZone && (
            <div style={{marginTop:'var(--space-4)',padding:'var(--space-4)',background:'var(--bg-elevated)',borderRadius:'var(--radius-md)',textAlign:'center'}}>
              <div style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-semibold)',color:'var(--text-primary)'}}>请在实时画面点击4点</div>
              <div style={{fontSize:'var(--text-sm)',color:'var(--text-secondary)',marginTop:'var(--space-2)'}}>（只在点击了编辑后显示）</div>
            </div>
          )}
        </div>

        {/* Bottom buttons */}
        <div style={{display:'flex',gap:'var(--space-3)'}}>
          <Button variant="danger" onClick={()=>navigate(-1)}>删除</Button>
          <Button variant="primary" style={{flex:1}}>保存</Button>
        </div>
      </div>
    </div>
  );
}
