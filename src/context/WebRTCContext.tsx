import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react';

interface PoolEntry {
  pc: RTCPeerConnection;
  stream: MediaStream;
  lastUsed: number;
  refCount: number;
  url: string;
}

interface WebRTCContextType {
  acquire: (url: string) => Promise<{ stream: MediaStream } | { error: string }>;
  release: (url: string) => void;
}

const WebRTCContext = createContext<WebRTCContextType | null>(null);

const TTL_MS = 30_000;
const CLEANUP_INTERVAL = 10_000;

export function WebRTCProvider({ children }: { children: React.ReactNode }) {
  const poolRef = useRef<Map<string, PoolEntry>>(new Map());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const now = Date.now();
      for (const [url, entry] of poolRef.current) {
        if (entry.refCount <= 0 && now - entry.lastUsed > TTL_MS) {
          console.log('[WRTC-Pool] TTL expired, closing:', url);
          entry.pc.close();
          poolRef.current.delete(url);
        }
      }
    }, CLEANUP_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const acquire = useCallback(async (url: string) => {
    const pool = poolRef.current;
    const existing = pool.get(url);
    if (existing) {
      existing.refCount++;
      existing.lastUsed = Date.now();
      console.log('[WRTC-Pool] REUSE refCount=%d url=%s', existing.refCount, url);
      return { stream: existing.stream };
    }

    console.log('[WRTC-Pool] CREATE url=%s', url);
    const tStart = Date.now();
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    const stream = new MediaStream();

    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    // ── 详细 ICE 状态追踪 ──
    pc.oniceconnectionstatechange = () => {
      console.log('[WRTC-Pool] ICE state: %s (t=%dms) url=%s',
        pc.iceConnectionState, Date.now() - tStart, url);
    };
    pc.onicegatheringstatechange = () => {
      console.log('[WRTC-Pool] ICE gathering: %s (t=%dms)',
        pc.iceGatheringState, Date.now() - tStart);
    };
    pc.onconnectionstatechange = () => {
      console.log('[WRTC-Pool] Connection state: %s (t=%dms)',
        pc.connectionState, Date.now() - tStart);
    };
    pc.onsignalingstatechange = () => {
      console.log('[WRTC-Pool] Signaling state: %s (t=%dms)',
        pc.signalingState, Date.now() - tStart);
    };

    pc.ontrack = (e: RTCTrackEvent) => {
      console.log('[WRTC-Pool] TRACK kind=%s id=%s streams=%d (t=%dms)',
        e.track.kind, e.track.id, e.streams.length, Date.now() - tStart);
      if (e.streams[0]) {
        for (const track of e.streams[0].getTracks()) {
          stream.addTrack(track);
          console.log('[WRTC-Pool] TRACK added: %s readyState=%s',
            track.kind, track.readyState);
        }
      }
    };

    try {
      const offer = await pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true });
      console.log('[WRTC-Pool] Offer created, SDP lines=%d', offer.sdp!.split('\n').length);
      await pc.setLocalDescription(offer);

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10_000);
      console.log('[WRTC-Pool] POST to WHEP: %s', url);
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription!.sdp,
        signal: ctrl.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        pc.close();
        console.error('[WRTC-Pool] WHEP HTTP %d: %s', resp.status, errText);
        return { error: `SRS ${resp.status}${errText ? ': ' + errText : ''}` };
      }
      const answerSdp = await resp.text();
      if (!answerSdp) { pc.close(); return { error: 'SRS returned empty answer' }; }

      // 分析 SDP answer
      const answerLines = answerSdp.split('\n');
      const videoLine = answerLines.find(l => l.startsWith('m=video'));
      const audioLine = answerLines.find(l => l.startsWith('m=audio'));
      const candidateLines = answerLines.filter(l => l.startsWith('a=candidate'));
      console.log('[WRTC-Pool] SDP answer: %d lines | video=%s audio=%s candidates=%d',
        answerLines.length,
        videoLine ? videoLine.trim() : 'NONE',
        audioLine ? audioLine.trim() : 'NONE',
        candidateLines.length);
      candidateLines.forEach(l => console.log('[WRTC-Pool]   %s', l.trim()));

      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      // 等待 ICE 连接或 track 到达
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(() => {
          console.error('[WRTC-Pool] ICE timeout after 10s, state=%s', pc.iceConnectionState);
          reject(new Error('ICE timeout'));
        }, 10_000);

        // 先检查是否 oniceconnectionstatechange 已经错过了
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          clearTimeout(t); resolve(); return;
        }
        if (pc.iceConnectionState === 'failed') {
          clearTimeout(t); reject(new Error('ICE failed')); return;
        }
        if (stream.getVideoTracks().length > 0) {
          console.log('[WRTC-Pool] Tracks already present before ICE wait');
          clearTimeout(t); resolve(); return;
        }

        pc.oniceconnectionstatechange = () => {
          console.log('[WRTC-Pool] ICE→%s (t=%dms)',
            pc.iceConnectionState, Date.now() - tStart);
          if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
            clearTimeout(t); resolve();
          } else if (pc.iceConnectionState === 'failed') {
            clearTimeout(t); reject(new Error('ICE failed'));
          }
        };
      });

      const elapsed = Date.now() - tStart;
      const entry: PoolEntry = { pc, stream, lastUsed: Date.now(), refCount: 1, url };
      pool.set(url, entry);
      console.log('[WRTC-Pool] READY in %dms | vTracks=%d aTracks=%d | ICE=%s conn=%s',
        elapsed, stream.getVideoTracks().length, stream.getAudioTracks().length,
        pc.iceConnectionState, pc.connectionState);
      return { stream };
    } catch (e) {
      pc.close();
      const msg = e instanceof Error ? e.message : 'WHEP 握手失败';
      if (msg === 'AbortError' || msg === 'ICE timeout') return { error: '连接超时' };
      return { error: msg };
    }
  }, []);

  const release = useCallback((url: string) => {
    const entry = poolRef.current.get(url);
    if (!entry) return;
    entry.refCount = Math.max(0, entry.refCount - 1);
    entry.lastUsed = Date.now();
    console.log('[WRTC-Pool] RELEASE refCount=%d url=%s', entry.refCount, url);
  }, []);

  return (
    <WebRTCContext.Provider value={{ acquire, release }}>
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTC() {
  const ctx = useContext(WebRTCContext);
  if (!ctx) throw new Error('useWebRTC must be inside WebRTCProvider');
  return ctx;
}
