import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Shield, X, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Panel } from '../components/ui/Panel';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { UserResponse } from '../api/types';

export default function UserManagement() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await client.fetchUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const user = users.find(u => u.id === selected);

  // Add
  const [addForm, setAddForm] = useState({ username: '', password: '', role: 'security_guard', dingtalk_mobile: '', supervisor_id: 0 });
  const doAdd = async () => {
    if (!addForm.username.trim() || !addForm.password) return;
    setActionLoading(true);
    try {
      await client.createUser(addForm.username, addForm.password, addForm.role,
        addForm.dingtalk_mobile || undefined, addForm.supervisor_id || undefined);
      setShowAdd(false); setAddForm({ username: '', password: '', role: 'security_guard', dingtalk_mobile: '', supervisor_id: 0 });
      await fetchUsers();
    } catch (e) { alert('保存失败: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setActionLoading(false); }
  };

  // Edit
  const [editForm, setEditForm] = useState({ username: '', role: '', dingtalk_mobile: '', supervisor_id: 0 });
  const openEdit = () => {
    if (!user) return;
    setEditForm({ username: user.username, role: user.role, dingtalk_mobile: user.dingtalk_mobile || '', supervisor_id: user.supervisor_id || 0 });
    setShowEdit(true);
  };
  const doEdit = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (editForm.role !== user.role) {
        await client.updateUserRole(user.id, editForm.role);
      }
      setShowEdit(false);
      await fetchUsers();
    } catch (e) { alert('保存失败: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setActionLoading(false); }
  };

  // Deactivate
  const doDeactivate = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await client.deactivateUser(user.id);
      setSelected(null);
      await fetchUsers();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  // Role change
  const doSetRole = async (role: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      await client.updateUserRole(user.id, role);
      setShowRole(false);
      await fetchUsers();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
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
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)} disabled={actionLoading}>添加用户</Button>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ minHeight: 140 }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
            <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
            <Button variant="secondary" onClick={fetchUsers}>重试</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
            {users.map(u => (
              <Card key={u.id} hoverable selected={selected === u.id} onClick={() => setSelected(u.id)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>{u.username}</span>
              </Card>
            ))}
            {users.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-disabled)', padding: 'var(--space-8)' }}>暂无用户</div>
            )}
          </div>
        )}
      </div>

      <Panel open={!!user} onClose={() => setSelected(null)} title="用户详情">
        {user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ background: 'var(--bg-canvas)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>用户名：<span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>{user.username}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>角色：<span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>{roleLabel[user.role] || user.role}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>账号状态：<span style={{ color: user.is_active ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 'var(--font-medium)' }}>{user.is_active ? '正常' : '已停用'}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>钉钉手机：<span style={{ color: 'var(--text-primary)' }}>{user.dingtalk_mobile || '未绑定'}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>上级：<span style={{ color: 'var(--text-primary)' }}>{users.find(u => u.id === user.supervisor_id)?.username || '未设置'}</span></div>
            </div>
            <Button variant="secondary" icon={Edit3} style={{ width: '100%' }} onClick={openEdit} disabled={actionLoading}>修改信息</Button>
            <Button variant="secondary" icon={Shield} style={{ width: '100%' }} onClick={() => setShowRole(true)} disabled={actionLoading}>角色管理</Button>
            <Button variant="danger" icon={Trash2} style={{ width: '100%' }} onClick={doDeactivate} disabled={actionLoading}>停用用户</Button>
          </div>
        )}
      </Panel>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="添加用户">
          <input style={inputStyle} placeholder="用户名" value={addForm.username} onChange={e => setAddForm(f => ({ ...f, username: e.target.value }))} />
          <input style={inputStyle} type="password" placeholder="密码" value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))} />
          <select style={inputStyle} value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}>
            <option value="security_guard">安全员</option><option value="manager">管理员</option><option value="operator">运维员</option>
          </select>
          <input style={inputStyle} placeholder="钉钉手机号（可选）" value={addForm.dingtalk_mobile} onChange={e => setAddForm(f => ({ ...f, dingtalk_mobile: e.target.value }))} />
          {addForm.role === 'security_guard' && (
            <select style={inputStyle} value={addForm.supervisor_id} onChange={e => setAddForm(f => ({ ...f, supervisor_id: Number(e.target.value) }))}>
              <option value={0}>上级（可选）</option>
              {users.filter(u => u.role === 'manager').map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          )}
          <Button variant="primary" style={{ width: '100%' }} onClick={doAdd} disabled={actionLoading}>确认添加</Button>
        </Modal>
      )}

      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} title="修改信息">
          <input style={inputStyle} placeholder="用户名" value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} />
          <select style={inputStyle} value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}>
            <option value="security_guard">安全员</option><option value="manager">管理员</option><option value="operator">运维员</option>
          </select>
          <input style={inputStyle} placeholder="钉钉手机号" value={editForm.dingtalk_mobile} onChange={e => setEditForm(f => ({ ...f, dingtalk_mobile: e.target.value }))} />
          {user?.role === 'security_guard' && (
            <select style={inputStyle} value={editForm.supervisor_id} onChange={e => setEditForm(f => ({ ...f, supervisor_id: Number(e.target.value) }))}>
              <option value={0}>上级（无）</option>
              {users.filter(u => u.role === 'manager' && u.id !== user?.id).map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          )}
          <Button variant="primary" style={{ width: '100%' }} onClick={doEdit} disabled={actionLoading}>保存修改</Button>
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
