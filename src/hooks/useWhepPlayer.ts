import { useEffect, useRef, useState, useCallback } from 'react';

interface WhepState {
  status: 'idle' | 'connecting' | 'playing' | 'error';
  error: string;
}

/**
 * WebRTC WHEP 直播播放器 hook。
 * 传入 webrtc_url (SRS WHEP endpoint)，自动完成 WHEP 握手并挂载到 <video> 元素。
 */
export function useWhepPlayer(videoRef: React.RefObject<HTMLVideoElement | null>, webrtcUrl: string | null | undefined) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [state, setState] = useState<WhepState>({ status: 'idle', error: '' });
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!webrtcUrl || !videoRef.current) return;

    // Cleanup previous
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }

    setState({ status: 'connecting', error: '' });

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    pc.ontrack = (e: RTCTrackEvent) => {
      const v = videoRef.current;
      if (v && e.streams[0]) {
        v.srcObject = e.streams[0];
        setState({ status: 'playing', error: '' });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        setState(s => s.status === 'playing' ? s : { status: 'error', error: 'ICE 连接失败' });
      }
    };

    pcRef.current = pc;

    // WHEP handshake
    (async () => {
      try {
        // Step 1: POST → get SDP offer
        const offerResp = await fetch(webrtcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
        });
        if (!offerResp.ok) throw new Error(`SRS returned ${offerResp.status}`);
        const offerSdp = await offerResp.text();
        await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp });

        // Step 2: Create answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Step 3: PATCH answer back
        const patchResp = await fetch(webrtcUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/sdp' },
          body: pc.localDescription!.sdp,
        });
        if (!patchResp.ok) throw new Error(`SRS PATCH returned ${patchResp.status}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'WHEP 握手失败';
        setState({ status: 'error', error: msg });
        pc.close();
        pcRef.current = null;
      }
    })();
  }, [webrtcUrl, videoRef]);

  // Auto-connect when URL changes
  useEffect(() => {
    connect();
    return () => {
      if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [connect]);

  return { ...state, connect };
}
