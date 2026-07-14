import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Play, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useAlerts } from '../context/AlertContext';
import * as client from '../api/client';
import type { EventResponse, RecordingResponse } from '../api/types';
import flvjs from 'flv.js';

type ReviewStatus = 'pending' | 'handled' | 'false_alarm' | 'acknowledged';

/**
 * EventReplay — 事件回放页面。
 * 路由参数 alertId 来自告警列表。事件和告警共享 situation_events 表，ID 相同。
 */
export default function EventReplay() {
  const { alertId } = useParams<{ alertId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { markHandled, markFalseAlarm } = useAlerts();

  const id = Number(alertId);
  const st = (location.state as any) || {};
  const from = st.from || '';
  const searchParams = new URLSearchParams(window.location.search);
  const urlStatus = searchParams.get('status') as ReviewStatus | null;
  const ackToken = searchParams.get('token');

  const [eventDetail, setEventDetail] = useState<EventResponse | null>(null);
  const [recordings, setRecordings] = useState<RecordingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review — init from URL param, fallback to alerts check
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    urlStatus === 'handled' || urlStatus === 'false_alarm' ? urlStatus : 'pending'
  );

  // Auto-ack via ?token=xxx from DingTalk message
  useEffect(() => {
    if (ackToken && !isNaN(id) && reviewStatus === 'pending') {
      fetch(`/api/v1/alerts/${id}/ack?token=${ackToken}`)
        .then(async (r) => {
          if (r.ok) {
            await client.acknowledgeAlert(id);
            setReviewStatus('acknowledged');
          }
        })
        .catch(() => {});
    }
  }, [ackToken, id]);

  // Video
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<flvjs.Player | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState('');
  const progressRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const activeRecording = recordings.find(r => r.id === eventDetail?.recording_id) || recordings[0];

  // Load event + recordings, then check review status
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const evt = await client.fetchEventById(id);
        setEventDetail(evt);
        const recs = await client.fetchRecordings(evt.view_id).catch(() => [] as RecordingResponse[]);
        setRecordings(recs);
      } catch (e) {
        setError(e instanceof Error ? e.message : '事件不存在');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // 定时轮询录制状态（录制中时每3秒刷新）
  useEffect(() => {
    if (!activeRecording?.end_time) {
      const timer = setInterval(async () => {
        try {
          const recs = await client.fetchRecordings(activeRecording.view_id).catch(() => [] as RecordingResponse[]);
          setRecordings(recs);
        } catch { /* ignore */ }
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [activeRecording?.id, activeRecording?.end_time]);

  // flv.js player
  useEffect(() => {
    if (!activeRecording || !videoRef.current) return;
    if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }

    setVideoError('');
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const url = client.getRecordingStreamUrl(activeRecording.id);
    const isLive = !activeRecording.end_time;  // 录制中→live模式，已完成→file模式
    const player = flvjs.createPlayer({ type: 'flv', url, isLive, hasAudio: false, hasVideo: true });
    player.attachMediaElement(videoRef.current);
    player.load();

    player.on(flvjs.Events.ERROR, (_e: unknown) => {
      const err = _e as Error;
      console.error('[EventReplay] flv.js error', err?.message || err);
      setVideoError('视频加载失败: ' + (err?.message || '未知错误'));
      setPlaying(false);
    });
    player.on(flvjs.Events.METADATA_ARRIVED, () => {
      const p = player.play();
      if (p) { p.then(() => setPlaying(true)).catch(() => setVideoError('播放失败')); }
      else { setPlaying(true); }
    });
    player.on(flvjs.Events.LOADING_COMPLETE, () => setPlaying(false));
    playerRef.current = player;

    return () => {
      try { player.detachMediaElement(); player.destroy(); } catch (_) {}
      playerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRecording?.id, activeRecording?.end_time]);

  // Time tracking
  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v) { setCurrentTime(v.currentTime); setDuration(v.duration || 0); }
  }, []);
  const onVideoEnded = useCallback(() => setPlaying(false), []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const p = v.play();
      if (p) { p.then(() => setPlaying(true)).catch(() => {}); }
      else { setPlaying(true); }
    } else { v.pause(); setPlaying(false); }
  }, []);

  // --- Draggable progress bar ---
  const updateFromClientX = useCallback((clientX: number) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
    setCurrentTime(v.currentTime);
  }, [duration]);

  const onBarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    updateFromClientX(e.clientX);
    const onMove = (ev: MouseEvent) => updateFromClientX(ev.clientX);
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [updateFromClientX]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMark = async (action: string) => {
    if (action === 'handled') await markHandled(id);
    else if (action === 'false_alarm') await markFalseAlarm(id);
    else if (action === 'acknowledged') await client.acknowledgeAlert(id);
    setReviewStatus(action as ReviewStatus);
    const url = new URL(window.location.href);
    url.searchParams.set('status', action);
    window.history.replaceState(null, '', url.toString());
    setTimeout(() => goBack(), 1500);
  };

  const goBack = () => { if (from) navigate(from); else navigate('/main'); };
  const isResolved = reviewStatus !== 'pending';

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', height: '100%', display: 'flex', gap: 'var(--space-4)' }}>
        <Skeleton style={{ flex: 1, borderRadius: 'var(--radius-md)' }} />
        <Skeleton style={{ width: 360, borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  if (error || !eventDetail) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-disabled)' }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>{error || `未找到该告警事件 (ID: ${alertId})`}</div>
        <Button variant="secondary" onClick={goBack}>返回</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      {/* Video area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,.06)', overflow: 'hidden', position: 'relative' }}>
        {activeRecording ? (
          videoError ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', color: 'var(--color-danger)' }}>
              <AlertTriangle size={48} />
              <div>{videoError}</div>
            </div>
          ) : (
            <>
              <video ref={videoRef} style={{ flex: 1, width: '100%', background: '#000', objectFit: 'contain' }}
                onTimeUpdate={onTimeUpdate} onEnded={onVideoEnded} onClick={togglePlay} />
              {!playing && (
                <div onClick={togglePlay} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.3)', cursor: 'pointer' }}>
                  <Play size={64} style={{ color: '#fff', opacity: .8 }} />
                </div>
              )}
            </>
          )
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', color: 'var(--text-disabled)' }}>
            <Camera size={80} />
            <div style={{ fontSize: 28, fontWeight: 'var(--font-bold)', color: 'var(--text-secondary)' }}>视图 {eventDetail.view_id} · 事件回放</div>
            <div style={{ fontSize: 'var(--text-lg)' }}>告警 #{id}（无录制文件）</div>
          </div>
        )}

        {/* Progress bar — draggable */}
        <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
          <div ref={progressRef} onMouseDown={onBarMouseDown}
            style={{ position: 'relative', height: 6, background: 'var(--bg-elevated)', borderRadius: 3, cursor: activeRecording ? 'pointer' : 'default' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${pct}%`, background: 'var(--color-info)', borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: `${pct}%`, top: -5, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '2px solid var(--color-info)', transform: 'translateX(-50%)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <span>{activeRecording ? fmt(currentTime) : '--:--'}</span>
            <span>{activeRecording ? fmt(duration) : '--:--'}</span>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ padding: 'var(--space-4)', background: 'var(--color-warning-dim)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-info)' }}>告警 #{id}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
            <div>发生时间：<span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{eventDetail.timestamp}</span></div>
            <div>关联视图：<span style={{ color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => navigate(`/view/${eventDetail.view_id}`, { state: { from: `/replay/${id}` } })}>视图 {eventDetail.view_id}</span></div>
            <div>异常定义：<Badge level="neutral">#{eventDetail.exception_id}</Badge></div>
            {activeRecording && <div>录制时长：<span style={{ color: 'var(--text-primary)' }}>{activeRecording.start_time} ~ {activeRecording.end_time || '录制中'}</span></div>}
            <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>处理状态</span>
              {reviewStatus === 'handled' ? <Badge level="success"><CheckCircle size={14} /> 已处理</Badge> :
               reviewStatus === 'false_alarm' ? <Badge level="neutral"><XCircle size={14} /> 误报</Badge> :
               reviewStatus === 'acknowledged' ? <Badge level="info">已确认</Badge> :
               <Badge level="danger">未处理</Badge>}
            </div>
          </div>
        </div>

        {!isResolved && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={() => handleMark('acknowledged')}>确认处理（取消上报）</Button>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => handleMark('false_alarm')}>设为误报</Button>
              <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => handleMark('handled')}>设为已处理</Button>
            </div>
          </div>
        )}

        {isResolved && (
          <div style={{ textAlign: 'center', padding: 'var(--space-2)', color: 'var(--color-success)', fontSize: 'var(--text-sm)' }}>
            处理完成，即将返回...
          </div>
        )}

        {from && <Button variant="ghost" size="sm" style={{ width: '100%' }} onClick={goBack}>返回</Button>}
      </div>
    </div>
  );
}
