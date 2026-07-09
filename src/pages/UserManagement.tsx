import { useState } from 'react';
import { Plus, Trash2, Edit3, Shield, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Panel } from '../components/ui/Panel';
import { seedUsers } from '../api/seed';
import type { UserResponse } from '../api/types';

export default function UserManagement() {
  const [users, setUsers] = useState<UserResponse[]>(seedUsers);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showRole, setShowRole] = useState(false);

  const user = users.find(u => u.id === selected);
  const nextId = () => Math.max(0, ...users.map(u => u.id)) + 1;

  // Add
  const [addForm, setAddForm] = useState({ username: '', role: 'security_guard' });
  const doAdd = () => {
    if (!addForm.username.trim()) return;
    const u: UserResponse = { id: nextId(), username: addForm.username, role: addForm.role, is_active: true };
    setUsers(prev => [...prev, u]);
    setShowAdd(false); setAddForm({ username: '', role: 'security_guard' });
  };

  // Edit
  const [editForm, setEditForm] = useState({ username: '', role: '' });
  const openEdit = () => {
    if (!user) return;
    setEditForm({ username: user.username, role: user.role });
    setShowEdit(true);
  };
  const doEdit = () => {
    if (!user) return;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, username: editForm.username || u.username, role: editForm.role } : u));
    setShowEdit(false);
  };

  // Delete
  const doDelete = () => {
    if (!user) return;
    setUsers(prev => prev.filter(u => u.id !== user.id));
    setSelected(null);
  };

  // Role change
  const doSetRole = (role: string) => {
    if (!user) return;
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role } : u));
    setShowRole(false);
  };

  const roleLabel: Record<string, string> = {
    security_guard: '安全员', manager: '管理员', operator: '运维员',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', marginBottom: 'var(--space-3)',
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
              <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>{u.username}</span>
            </Card>
          ))}
          {Array.from({ length: Math.max(0, 9 - users.length) }, (_, i) => (
            <Card key={`empty-${i}`} disabled style={{ minHeight: 140 }} />
          ))}
        </div>
      </div>

      <Panel open={!!user} onClose={() => setSelected(null)} title="用户详情">
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>用户名：<span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>{user.username}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>角色：<span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>{roleLabel[user.role] || user.role}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>账号状态：<span style={{ color: user.is_active ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 'var(--font-medium)' }}>{user.is_active ? '正常' : '已停用'}</span></div>
            </div>
            <Button variant="secondary" icon={Edit3} style={{ width: '100%' }} onClick={openEdit}>修改信息</Button>
            <Button variant="secondary" icon={Shield} style={{ width: '100%' }} onClick={() => setShowRole(true)}>角色管理</Button>
            <Button variant="danger" icon={Trash2} style={{ width: '100%' }} onClick={doDelete}>删除用户</Button>
          </div>
        )}
      </Panel>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="添加用户">
          <input style={inputStyle} placeholder="用户名" value={addForm.username} onChange={e => setAddForm(f => ({ ...f, username: e.target.value }))} />
          <select style={inputStyle} value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}>
            <option value="security_guard">安全员</option><option value="manager">管理员</option><option value="operator">运维员</option>
          </select>
          <Button variant="primary" style={{ width: '100%' }} onClick={doAdd}>确认添加</Button>
        </Modal>
      )}

      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} title="修改信息">
          <input style={inputStyle} placeholder="用户名" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} />
          <select style={inputStyle} value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
            <option value="security_guard">安全员</option><option value="manager">管理员</option><option value="operator">运维员</option>
          </select>
          <Button variant="primary" style={{ width: '100%' }} onClick={doEdit}>保存修改</Button>
        </Modal>
      )}

      {showRole && (
        <Modal onClose={() => setShowRole(false)} title="角色管理">
          {Object.entries(roleLabel).map(([value, label]) => (
            <Card key={value} hoverable selected={user?.role === value} onClick={() => doSetRole(value)}
              style={{ marginBottom: 'var(--space-2)', textAlign: 'center', padding: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)' }}>{label}</span>
            </Card>
          ))}
        </Modal>
      )}
    </div>
  );
}

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
