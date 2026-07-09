import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Panel } from '../components/ui/Panel';
import { mockUsers } from '../data/mock';

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const user = mockUsers.find(u=>u.id===selectedUser);

  return (
    <div style={{display:'flex',height:'100%',gap:'var(--space-4)',padding:'var(--space-4)'}}>
      {/* Left: user grid */}
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:'var(--space-4)',overflow:'auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:'var(--space-4)'}}>
          <h2 style={{fontSize:'var(--text-2xl)',fontWeight:'var(--font-bold)',color:'var(--text-primary)'}}>用户管理</h2>
          <Button variant="primary" icon={Plus}>添加用户</Button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'var(--space-4)'}}>
          {mockUsers.map(u=>(
            <Card key={u.id} hoverable selected={selectedUser===u.id} onClick={()=>setSelectedUser(u.id)}
              style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:140}}>
              <span style={{fontSize:'var(--text-2xl)',fontWeight:'var(--font-semibold)',color:'var(--text-primary)'}}>{u.name}</span>
            </Card>
          ))}
          {/* Empty slots */}
          {Array.from({length:6},(_,i)=>(
            <Card key={`empty-${i}`} disabled style={{minHeight:140,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {i===0?<span style={{fontSize:'var(--text-3xl)',color:'var(--text-disabled)'}}>◦ ◦ ◦</span>:null}
            </Card>
          ))}
        </div>
      </div>

      {/* Right: detail panel */}
      <Panel open={!!user} onClose={()=>setSelectedUser(null)} title="用户详情">
        {user && (
          <div style={{display:'flex',flexDirection:'column',gap:'var(--space-6)'}}>
            <div style={{background:'var(--bg-canvas)',borderRadius:'var(--radius-md)',padding:'var(--space-6)',display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
              <div style={{fontSize:'var(--text-lg)',color:'var(--text-secondary)'}}>用户姓名：<span style={{color:'var(--text-primary)',fontWeight:'var(--font-medium)'}}>张三</span></div>
              <div style={{fontSize:'var(--text-lg)',color:'var(--text-secondary)'}}>用户角色：<span style={{color:'var(--text-primary)',fontWeight:'var(--font-medium)'}}>{user.role}</span></div>
              <div style={{fontSize:'var(--text-lg)',color:'var(--text-secondary)'}}>权限等级：<span style={{color:'var(--text-primary)',fontWeight:'var(--font-medium)'}}>{user.permission}</span></div>
              <div style={{fontSize:'var(--text-lg)',color:'var(--text-secondary)'}}>账号状态：<span style={{color:'var(--text-primary)',fontWeight:'var(--font-medium)'}}>{user.accountStatus}</span></div>
            </div>
            <Button variant="secondary" style={{width:'100%'}}>修改信息</Button>
            <Button variant="secondary" style={{width:'100%'}}>权限管理</Button>
            <Button variant="danger" style={{width:'100%'}}>删除用户</Button>
          </div>
        )}
      </Panel>
    </div>
  );
}
