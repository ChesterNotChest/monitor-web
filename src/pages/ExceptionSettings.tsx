import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusDot } from '../components/ui/StatusDot';
import { Skeleton } from '../components/ui/Skeleton';
import * as client from '../api/client';
import type { ExceptionResponse, ExceptionCreate, AlertGroupResponse, DetectionTypeResponse } from '../api/types';
import { SeverityLabel, SeverityBadgeLevel, SeverityLevel } from '../api/enums';

export default function ExceptionSettings() {
  const [exceptions, setExceptions] = useState<ExceptionResponse[]>([]);
  const [alertGroups, setAlertGroups] = useState<AlertGroupResponse[]>([]);
  const [entityTypes, setEntityTypes] = useState<DetectionTypeResponse[]>([]);
  const [actionTypes, setActionTypes] = useState<DetectionTypeResponse[]>([]);
  const [soundTypes, setSoundTypes] = useState<DetectionTypeResponse[]>([]);
  const [fenceEventTypes, setFenceEventTypes] = useState<DetectionTypeResponse[]>([]);
  const [faceResults, setFaceResults] = useState<DetectionTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, groups, entities, actions, sounds, fenceTypes, faceRes] = await Promise.all([
        client.fetchExceptions(),
        client.fetchAlertGroups(),
        client.fetchEntityTypes(),
        client.fetchActionTypes(),
        client.fetchSoundTypes(),
        client.fetchFenceEventTypes(),
        client.fetchFaceRecognitionResults(),
      ]);
      setExceptions(data);
      setAlertGroups(groups);
      setEntityTypes(entities);
      setActionTypes(actions);
      setSoundTypes(sounds);
      setFenceEventTypes(fenceTypes);
      setFaceResults(faceRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const selectedEx = exceptions.find(e => e.id === selected);

  // Add form
  const [addForm, setAddForm] = useState<ExceptionCreate>({ name: '', severity: SeverityLevel.WARNING, group_id: null, entity_ids: [], action_ids: [], sound_ids: [], face_result_id: null, fence_event_id: null, cooldown_seconds: 30, max_recording_seconds: 10, wind_down_seconds: 10});
  const doAdd = async () => {
    if (!addForm.name.trim()) return;
    setActionLoading(true);
    try {
      await client.createException(addForm);
      setShowAdd(false);
      setAddForm({ name: '', severity: SeverityLevel.WARNING, group_id: null, entity_ids: [], action_ids: [], sound_ids: [], face_result_id: null, fence_event_id: null, cooldown_seconds: 30, max_recording_seconds: 10, wind_down_seconds: 10});
      await fetchData();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  // Edit form
  const [editForm, setEditForm] = useState<ExceptionCreate>({ name: '', severity: SeverityLevel.WARNING, group_id: null, entity_ids: [], action_ids: [], sound_ids: [], face_result_id: null, fence_event_id: null, cooldown_seconds: 30, max_recording_seconds: 10, wind_down_seconds: 10});
  const openEdit = () => {
    if (!selectedEx) return;
    setEditForm({ name: selectedEx.name, severity: selectedEx.severity, group_id: selectedEx.group_id, entity_ids: selectedEx.entity_ids ?? [], action_ids: selectedEx.action_ids ?? [], sound_ids: selectedEx.sound_ids ?? [], face_result_id: selectedEx.face_result_id, fence_event_id: selectedEx.fence_event_id, cooldown_seconds: selectedEx.cooldown_seconds ?? 30, max_recording_seconds: selectedEx.max_recording_seconds ?? 10, wind_down_seconds: selectedEx.wind_down_seconds ?? 10 });
    setShowEdit(true);
  };
  const doEdit = async () => {
    if (!selectedEx) return;
    setActionLoading(true);
    try {
      await client.updateException(selectedEx.id, editForm);
      setShowEdit(false);
      await fetchData();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const doDelete = async () => {
    if (!selectedEx) return;
    setActionLoading(true);
    try {
      await client.deleteException(selectedEx.id);
      setSelected(null);
      await fetchData();
    } catch { /* ignore */ }
    finally { setActionLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-canvas)',
    border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    fontSize: 'var(--text-base)', outline: 'none', marginBottom: 'var(--space-3)',
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <Card style={{ flex: 1, padding: 'var(--space-6)', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>异常设置</h2>
          <Button variant="primary" icon={Plus} onClick={() => setShowAdd(true)} disabled={actionLoading}>添加异常</Button>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: 100 }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={32} style={{ marginBottom: 'var(--space-3)' }} />
            <div style={{ marginBottom: 'var(--space-3)' }}>{error}</div>
            <Button variant="secondary" onClick={fetchData}>重试</Button>
          </div>
        ) : exceptions.length === 0 ? (
          <div style={{ color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-12)' }}>
            暂无异常定义，点击"添加异常"创建
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)' }}>
            {exceptions.map(ex => (
              <Card key={ex.id} selected={selected === ex.id} hoverable onClick={() => setSelected(ex.id)}
                style={{ padding: 'var(--space-4)', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <StatusDot status="online" size="sm" />
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--text-primary)' }}>{ex.name}</span>
                </div>
                <Badge level={SeverityBadgeLevel[ex.severity as keyof typeof SeverityBadgeLevel] || 'warning'}>
                  {SeverityLabel[ex.severity as keyof typeof SeverityLabel] || `级别 ${ex.severity}`}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <div style={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Card style={{ flex: 1, padding: 'var(--space-6)', overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>详情</h3>
          </div>
          {selectedEx ? <ExceptionDetail selectedEx={selectedEx} alertGroups={alertGroups} fenceEventTypes={fenceEventTypes} faceResults={faceResults} /> : (
            <div style={{ color: 'var(--text-disabled)', textAlign: 'center', padding: 'var(--space-8)' }}>
              请选择左侧异常类型
            </div>
          )}
        </Card>

        <Card style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Button variant="secondary" style={{ width: '100%' }} disabled={!selected || actionLoading} onClick={openEdit}>修改异常</Button>
          <Button variant="danger" style={{ width: '100%' }} disabled={!selected || actionLoading} onClick={doDelete}>删除异常</Button>
        </Card>
      </div>

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="添加异常">
          <input style={inputStyle} placeholder="异常名称" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
          <select style={inputStyle} value={addForm.severity} onChange={e => setAddForm(f => ({ ...f, severity: Number(e.target.value) }))}>
            {Object.entries(SeverityLabel).map(([k, v]) => <option key={k} value={Number(k)}>{v}</option>)}
          </select>
          <MultiSelect label="实体条件" options={entityTypes} selected={addForm.entity_ids ?? []}
            onChange={ids => setAddForm(f => ({ ...f, entity_ids: ids }))} />
          <MultiSelect label="行为条件" options={actionTypes} selected={addForm.action_ids ?? []}
            onChange={ids => setAddForm(f => ({ ...f, action_ids: ids }))} />
          <MultiSelect label="声音条件" options={soundTypes} selected={addForm.sound_ids ?? []}
            onChange={ids => setAddForm(f => ({ ...f, sound_ids: ids }))} />
          <select style={inputStyle} value={addForm.face_result_id ?? ''} onChange={e => setAddForm(f => ({ ...f, face_result_id: e.target.value ? Number(e.target.value) : null }))}>
            <option value="">人脸识别条件（无）</option>
            {faceResults.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select style={inputStyle} value={addForm.fence_event_id ?? ''} onChange={e => setAddForm(f => ({ ...f, fence_event_id: e.target.value ? Number(e.target.value) : null }))}>
            <option value="">围栏事件条件（无）</option>
            {fenceEventTypes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>冷却时间（秒）</label>
            <input style={inputStyle} type="number" min="0" value={addForm.cooldown_seconds ?? 30} onChange={e => setAddForm(f => ({ ...f, cooldown_seconds: Number(e.target.value) }))} /></div>
          <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>录制时间上限（秒，0=不限）</label>
            <input style={inputStyle} type="number" min="0" value={addForm.max_recording_seconds ?? 10} onChange={e => setAddForm(f => ({ ...f, max_recording_seconds: Number(e.target.value) }))} /></div>
          <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>空闲等待（秒）</label>
            <input style={inputStyle} type="number" min="0" value={addForm.wind_down_seconds ?? 10} onChange={e => setAddForm(f => ({ ...f, wind_down_seconds: Number(e.target.value) }))} /></div>
          <Button variant="primary" style={{ width: '100%' }} onClick={doAdd} disabled={actionLoading}>确认添加</Button>
        </Modal>
      )}

      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} title="修改异常">
          <input style={inputStyle} placeholder="异常名称" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          <select style={inputStyle} value={editForm.severity} onChange={e => setEditForm(f => ({ ...f, severity: Number(e.target.value) }))}>
            {Object.entries(SeverityLabel).map(([k, v]) => <option key={k} value={Number(k)}>{v}</option>)}
          </select>
          <MultiSelect label="实体条件" options={entityTypes} selected={editForm.entity_ids ?? []}
            onChange={ids => setEditForm(f => ({ ...f, entity_ids: ids }))} />
          <MultiSelect label="行为条件" options={actionTypes} selected={editForm.action_ids ?? []}
            onChange={ids => setEditForm(f => ({ ...f, action_ids: ids }))} />
          <MultiSelect label="声音条件" options={soundTypes} selected={editForm.sound_ids ?? []}
            onChange={ids => setEditForm(f => ({ ...f, sound_ids: ids }))} />
          <select style={inputStyle} value={editForm.face_result_id ?? ''} onChange={e => setEditForm(f => ({ ...f, face_result_id: e.target.value ? Number(e.target.value) : null }))}>
            <option value="">人脸识别条件（无）</option>
            {faceResults.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select style={inputStyle} value={editForm.fence_event_id ?? ''} onChange={e => setEditForm(f => ({ ...f, fence_event_id: e.target.value ? Number(e.target.value) : null }))}>
            <option value="">围栏事件条件（无）</option>
            {fenceEventTypes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>冷却时间（秒）</label>
            <input style={inputStyle} type="number" min="0" value={editForm.cooldown_seconds ?? 30} onChange={e => setEditForm(f => ({ ...f, cooldown_seconds: Number(e.target.value) }))} /></div>
          <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>录制时间上限（秒，0=不限）</label>
            <input style={inputStyle} type="number" min="0" value={editForm.max_recording_seconds ?? 10} onChange={e => setEditForm(f => ({ ...f, max_recording_seconds: Number(e.target.value) }))} /></div>
          <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>空闲等待（秒）</label>
            <input style={inputStyle} type="number" min="0" value={editForm.wind_down_seconds ?? 10} onChange={e => setEditForm(f => ({ ...f, wind_down_seconds: Number(e.target.value) }))} /></div>
          <Button variant="primary" style={{ width: '100%' }} onClick={doEdit} disabled={actionLoading}>保存修改</Button>
        </Modal>
      )}
    </div>
  );
}

function ExceptionDetail({ selectedEx, alertGroups, entityTypes, actionTypes, soundTypes, fenceEventTypes, faceResults }: {
  selectedEx: ExceptionResponse;
  alertGroups: AlertGroupResponse[];
  entityTypes: DetectionTypeResponse[];
  actionTypes: DetectionTypeResponse[];
  soundTypes: DetectionTypeResponse[];
  fenceEventTypes: DetectionTypeResponse[];
  faceResults: DetectionTypeResponse[];
}) {
  const group = alertGroups.find(g => g.id === selectedEx.group_id);
  const fenceName = selectedEx.fence_event_id != null
    ? fenceEventTypes.find(f => f.id === selectedEx.fence_event_id)?.name ?? `#${selectedEx.fence_event_id}`
    : null;
  const faceName = selectedEx.face_result_id != null
    ? faceResults.find(f => f.id === selectedEx.face_result_id)?.name ?? `#${selectedEx.face_result_id}`
    : null;
  const entityNames = (selectedEx.entity_ids ?? []).map(id => entityTypes.find(e => e.id === id)?.name ?? `#${id}`).join(', ') || '无';
  const actionNames = (selectedEx.action_ids ?? []).map(id => actionTypes.find(a => a.id === id)?.name ?? `#${id}`).join(', ') || '无';
  const soundNames = (selectedEx.sound_ids ?? []).map(id => soundTypes.find(s => s.id === id)?.name ?? `#${id}`).join(', ') || '无';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
      <div>名称：<span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-medium)' }}>{selectedEx.name}</span></div>
      <div>严重级别：<Badge level={SeverityBadgeLevel[selectedEx.severity as keyof typeof SeverityBadgeLevel] || 'warning'}>{SeverityLabel[selectedEx.severity as keyof typeof SeverityLabel] || selectedEx.severity}</Badge></div>
      <div>告警分组：<span style={{ color: 'var(--text-primary)' }}>{group ? group.name : selectedEx.group_id ? `#${selectedEx.group_id}` : '无'}</span></div>
      <div>实体条件：<span style={{ color: 'var(--text-primary)' }}>{entityNames}</span></div>
      <div>行为条件：<span style={{ color: 'var(--text-primary)' }}>{actionNames}</span></div>
      <div>声音条件：<span style={{ color: 'var(--text-primary)' }}>{soundNames}</span></div>
      {faceName != null && <div>人脸识别结果：<span style={{ color: 'var(--text-primary)' }}>{faceName}</span></div>}
      {fenceName != null && <div>围栏事件类型：<span style={{ color: 'var(--text-primary)' }}>{fenceName}</span></div>}
      <div>冷却时间：<span style={{ color: 'var(--text-primary)' }}>{selectedEx.cooldown_seconds ?? 30} 秒</span></div>
      <div>录制上限：<span style={{ color: 'var(--text-primary)' }}>{selectedEx.max_recording_seconds ?? 10} 秒</span></div>
      <div>空闲等待：<span style={{ color: 'var(--text-primary)' }}>{selectedEx.wind_down_seconds ?? 10} 秒</span></div>
      <div>创建时间：<span style={{ color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>{selectedEx.created_at}</span></div>
    </div>
  );
}

function MultiSelect({ label, options, selected, onChange }: {
  label: string;
  options: DetectionTypeResponse[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const toggle = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else onChange([...selected, id]);
  };
  const labelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' };
  const chipWrap: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-3)' };
  const chip: React.CSSProperties = { padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', cursor: 'pointer', border: '1px solid rgba(255,255,255,.15)', background: 'var(--bg-canvas)', color: 'var(--text-secondary)' };
  const chipOn: React.CSSProperties = { ...chip, background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' };
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={chipWrap}>
        {options.map(o => (
          <span key={o.id} style={selected.includes(o.id) ? chipOn : chip} onClick={() => toggle(o.id)}>{o.name}</span>
        ))}
      </div>
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
          <div style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={onClose}>✕</div>
        </div>
        {children}
      </div>
    </>
  );
}
