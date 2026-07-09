import { useState } from 'react';
import { Plus, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Panel } from '../components/ui/Panel';
import { mockCharacters } from '../data/mock';

export default function CharacterManagement() {
  const [selected, setSelected] = useState<string | null>(null);
  const char = mockCharacters.find(c=>c.id===selected);

  return (
    <div style={{display:'flex',height:'100%',gap:'var(--space-4)',padding:'var(--space-4)'}}>
      {/* Character grid */}
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:'var(--space-4)',overflow:'auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:'var(--space-4)'}}>
          <h2 style={{fontSize:'var(--text-2xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)'}}>命名人物管理</h2>
          <Button variant="primary" icon={Plus}>添加人物</Button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-4)'}}>
          {mockCharacters.map(c=>(
            <Card key={c.id} hoverable selected={selected===c.id} onClick={()=>setSelected(c.id)}
              style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:140}}>
              <span style={{fontSize:'var(--text-2xl)',fontWeight:'var(--font-semibold)',color:'var(--text-primary)'}}>{c.name}</span>
            </Card>
          ))}
          {Array.from({length:6},(_,i)=>(
            <Card key={`e-${i}`} disabled style={{minHeight:140,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {i===0?<span style={{fontSize:'var(--text-3xl)',color:'var(--text-disabled)'}}>◦ ◦ ◦</span>:null}
            </Card>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <Panel open={!!char} onClose={()=>setSelected(null)} title="人物详情">
        {char && (
          <div style={{display:'flex',flexDirection:'column',gap:'var(--space-6)'}}>
            <div style={{background:'var(--bg-canvas)',borderRadius:'var(--radius-md)',padding:'var(--space-6)',
              display:'flex',alignItems:'center',justifyContent:'center',minHeight:220,flexDirection:'column',gap:'var(--space-3)'}}>
              <Camera size={48} style={{color:'var(--text-disabled)'}}/>
              <span style={{fontSize:'var(--text-lg)',color:'var(--text-disabled)'}}>选中的人物的图片</span>
            </div>
            <div style={{textAlign:'center',fontSize:'var(--text-2xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)'}}>{char.name}</div>
            <Button variant="secondary" style={{width:'100%'}}>修改信息</Button>
            <Button variant="secondary" style={{width:'100%'}}>更改照片</Button>
            <Button variant="danger" style={{width:'100%'}}>删除人物</Button>
          </div>
        )}
      </Panel>
    </div>
  );
}
