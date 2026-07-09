import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusDot } from '../components/ui/StatusDot';
import { mockExceptionTypes } from '../data/mock';

const sevLabel: Record<string,string> = { danger:'高危',warning:'中危',caution:'低危' };

export default function ExceptionSettings() {
  const [exceptions, setExceptions] = useState(mockExceptionTypes);
  const selected = exceptions.find(e=>e.selected);

  const toggleSelect = (id: string) => {
    setExceptions(prev=>prev.map(e=>({...e,selected:e.id===id?!e.selected:false})));
  };

  return (
    <div style={{display:'flex',height:'100%',gap:'var(--space-4)',padding:'var(--space-4)'}}>
      <Card style={{flex:1,padding:'var(--space-6)',overflow:'auto'}}>
        <h2 style={{fontSize:'var(--text-2xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)',marginBottom:'var(--space-6)'}}>异常设置</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-4)'}}>
          {exceptions.map(ex=>(
            <Card key={ex.id} selected={ex.selected} disabled={!ex.enabled} hoverable onClick={()=>toggleSelect(ex.id)}
              style={{padding:'var(--space-4)',position:'relative'}}>
              <div style={{display:'flex',alignItems:'center',gap:'var(--space-2)',marginBottom:'var(--space-3)'}}>
                <StatusDot status={ex.enabled?'online':'offline'} size="sm"/>
                <span style={{fontSize:'var(--text-base)',fontWeight:'var(--font-medium)',color:ex.enabled?'var(--text-primary)':'var(--text-disabled)'}}>{ex.name}</span>
              </div>
              <Badge level={ex.severity}>{sevLabel[ex.severity]}</Badge>
              {!ex.enabled && <span style={{fontSize:'var(--text-xs)',color:'var(--text-disabled)',marginLeft:'var(--space-2)'}}>已关闭</span>}
            </Card>
          ))}
        </div>
      </Card>

      {/* Detail panel */}
      <div style={{width:380,flexShrink:0,display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
        <Card style={{flex:1,padding:'var(--space-6)',overflow:'auto'}}>
          <h3 style={{fontSize:'var(--text-lg)',fontWeight:'var(--font-bold)',marginBottom:'var(--space-4)',color:'var(--text-primary)'}}>事件组成</h3>
          {selected ? (
            <div style={{display:'flex',flexDirection:'column',gap:'var(--space-2)'}}>
              {selected.events.map((ev,i)=>(
                <div key={i} style={{padding:'var(--space-3)',background:'var(--bg-canvas)',borderRadius:'var(--radius-sm)',fontSize:'var(--text-base)',color:'var(--text-primary)'}}>
                  {i+1}. {ev}
                </div>
              ))}
            </div>
          ) : (
            <div style={{color:'var(--text-disabled)',textAlign:'center',padding:'var(--space-8)'}}>请选择左侧异常类型</div>
          )}
        </Card>

        <Card style={{padding:'var(--space-4)',display:'flex',flexDirection:'column',gap:'var(--space-2)'}}>
          <Button variant="secondary" style={{width:'100%'}}>添加事件</Button>
          <Button variant="secondary" style={{width:'100%'}}>修改事件</Button>
          <Button variant="secondary" style={{width:'100%'}}>删除事件</Button>
          <Button variant="secondary" style={{width:'100%'}}>设置异常等级</Button>
          <Button variant="secondary" style={{width:'100%'}}>异常告警开关</Button>
          <Button variant="danger" style={{width:'100%'}}>删除异常</Button>
        </Card>
      </div>
    </div>
  );
}
