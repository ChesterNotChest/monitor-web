import { useEffect, useRef, useState, useCallback } from 'react';

interface WhepState {
  status: 'idle' | 'connecting' | 'playing' | 'error';
  error: string;
}

/**
 * WebRTC WHEP 直播播放器 hook。
 * 传入 webrtc_url (SRS WHEP endpoint)，按 WHEP 协议完成握手并挂载到 <video> 元素。
 */
export function useWhepPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  webrtcUrl: string | null | undefined,
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<WhepState>({ status: 'idle', error: '' });

  const doConnect = useCallback(() => {
    if (!webrtcUrl) {
      console.log('[WHEP] skip: no URL');
      return;
    }
    if (!videoRef.current) {
      console.log('[WHEP] video element not ready, retry in 200ms');
      retryTimer.current = setTimeout(() => doConnect(), 200);
      return;
    }

    // Cleanup previous
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    console.log('[WHEP] connecting to:', webrtcUrl);
    setState({ status: 'connecting', error: '' });

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    pc.ontrack = (e: RTCTrackEvent) => {
      const v = videoRef.current;
      if (v && e.streams[0]) {
        console.log('[WHEP] track received, playing');
        v.srcObject = e.streams[0];
        setState({ status: 'playing', error: '' });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WHEP] ICE state:', pc.iceConnectionState);
      if (
        pc.iceConnectionState === 'failed' ||
        pc.iceConnectionState === 'disconnected'
      ) {
        setState((s) =>
          s.status === 'playing' ? s : { status: 'error', error: 'ICE 连接失败' },
        );
      }
    };

    pcRef.current = pc;

    // WHEP handshake: client sends offer first
    (async () => {
      try {
        const offer = await pc.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true,
        });
        await pc.setLocalDescription(offer);
        console.log('[WHEP] offer created, POST to SRS...');

        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 8000);
        const resp = await fetch(webrtcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
          body: pc.localDescription!.sdp,
          signal: ctrl.signal,
        });
        clearTimeout(timeout);
        if (!resp.ok) {
          const errText = await resp.text().catch(() => '');
          throw new Error(`SRS returned ${resp.status}${errText ? ': ' + errText : ''}`);
        }
        const answerSdp = await resp.text();
        console.log('[WHEP] answer received, len=%d', answerSdp.length);
        if (!answerSdp) throw new Error('SRS returned empty answer');

        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
        console.log('[WHEP] remote description set');
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'WHEP 握手失败';
        console.error('[WHEP] error:', msg);
        setState({ status: 'error', error: msg });
        pc.close();
        pcRef.current = null;
      }
    })();
  }, [webrtcUrl]);

  // Auto-connect when URL changes (ignores videoRef to avoid stale ref issue)
  useEffect(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    doConnect();
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [doConnect]);

  return { ...state, connect: doConnect };
}
