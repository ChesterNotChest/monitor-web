import { useState } from 'react';
import { Plus, Trash2, Edit3, Shield, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Panel } from '../components/ui/Panel';
import { mockUsers } from '../data/mock';
import type { User } from '../data/mock';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPerm, setShowPerm] = useState(false);

  const user = users.find(u => u.id === selected);
  const newId = () => `user-${Date.now()}`;

  // Add
  const [addForm, setAddForm] = useState({ name: '', role: '安全员', permission: '二级' });
  const doAdd = () => {
    if (!addForm.name.trim()) return;
    const u: User = { id: newId(), name: addForm.name, role: addForm.role, permission: addForm.permission, accountStatus: '正常' };
    setUsers(prev => [...prev, u]);
    setShowAdd(false); setAddForm({ name: '', role: '安全员', permission: '二级' });
  };

  // Edit
  const [editForm, setEditForm] = useState({ name: '', role: '', permission: '' });
  const openEdit = () => {
    if (!user) return;
    setEditForm({ name: user.name === '张三' ? user.name : user.name, role: user.role, permission: user.permission });
    setShowEdit(true);
  };
  const doEdit = () => {
    if (!user) return;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, name: editForm.name || u.name, role: editForm.role, permission: editForm.permission } : u));
    setShowEdit(false);
  };

  // Delete
  const doDelete = () => {
    if (!user) return;
    setUsers(prev => prev.filter(u => u.id !== user.id));
    setSelected(null);
  };

  // Permission
  const doSetPerm = (perm: string) => {
    if (!user) return;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, permission: perm } : u));
    setShowPerm(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', marginBottom: 'var(--space-3)'
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>用户管理</h2>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)}>添加用户</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
          {users.map(u => (
            <Card key={u.id} hoverable selected={selected === u.id} onClick={() => setSelected(u.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
              <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>{u.name}</span>
            </Card>
          ))}
          {Array.from({ length: Math.max(0, 9 - users.length) }, (_, i) => (
            <Card key={`empty-${i}`} disabled style={{ minHeight: 140 }} />
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <Panel open={!!user} onClose={() => setSelected(null)} title="用户详情">
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>用户姓名：<span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>{user.name === '用户1' ? '张三' : user.name}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>用户角色：<span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>{user.role}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>权限等级：<span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>{user.permission}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>账号状态：<span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>{user.accountStatus}</span></div>
            </div>
            <Button variant="secondary" icon={Edit3} style={{ width: '100%' }} onClick={openEdit}>修改信息</Button>
            <Button variant="secondary" icon={Shield} style={{ width: '100%' }} onClick={() => setShowPerm(true)}>权限管理</Button>
            <Button variant="danger" icon={Trash2} style={{ width: '100%' }} onClick={doDelete}>删除用户</Button>
          </div>
        )}
      </Panel>

      {/* Add modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="添加用户">
          <input style={inputStyle} placeholder="用户姓名" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
          <select style={inputStyle} value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}>
            <option>安全员</option><option>管理员</option><option>观察员</option>
          </select>
          <select style={inputStyle} value={addForm.permission} onChange={e => setAddForm(f => ({ ...f, permission: e.target.value }))}>
            <option>一级</option><option>二级</option><option>三级</option>
          </select>
          <Button variant="primary" style={{ width: '100%' }} onClick={doAdd}>确认添加</Button>
        </Modal>
      )}

      {/* Edit modal */}
      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} title="修改信息">
          <input style={inputStyle} placeholder="用户姓名" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          <select style={inputStyle} value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
            <option>安全员</option><option>管理员</option><option>观察员</option>
          </select>
          <Button variant="primary" style={{ width: '100%' }} onClick={doEdit}>保存修改</Button>
        </Modal>
      )}

      {/* Permission modal */}
      {showPerm && (
        <Modal onClose={() => setShowPerm(false)} title="权限管理">
          {['一级', '二级', '三级'].map(p => (
            <Card key={p} hoverable selected={user?.permission === p} onClick={() => doSetPerm(p)}
              style={{ marginBottom: 'var(--space-2)', textAlign: 'center', padding: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)' }}>{p}权限</span>
            </Card>
          ))}
        </Modal>
      )}
    </div>
  );
}

// Inline modal component
function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 70 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 80,
        background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,.1)',
        padding: 'var(--space-6)', minWidth: 360, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>{title}</h3>
          <X size={20} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={onClose} />
        </div>
        {children}
      </div>
    </>
  );
}
