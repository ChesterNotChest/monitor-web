import { useEffect, useRef, useState, useCallback } from 'react';

interface WhepState {
  status: 'idle' | 'connecting' | 'playing' | 'error';
  error: string;
}

/**
 * WebRTC WHEP 直播播放器 hook。
 * 传入 webrtc_url (SRS WHEP endpoint)，按 WHEP 协议完成握手并挂载到 <video> 元素。
 *
 * WHEP 协议（客户端先发 offer）：
 *   1. 创建 RTCPeerConnection + addTransceiver
 *   2. pc.createOffer() → pc.setLocalDescription(offer)
 *   3. POST offer SDP → SRS 返回 answer SDP
 *   4. pc.setRemoteDescription(answer)
 *   5. ontrack → 绑定到 video 元素
 */
export function useWhepPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  webrtcUrl: string | null | undefined,
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [state, setState] = useState<WhepState>({ status: 'idle', error: '' });

  const connect = useCallback(() => {
    if (!webrtcUrl || !videoRef.current) return;

    // Cleanup previous
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

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
        // 1. Create offer with BUNDLE
        const offer = await pc.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true,
        });
        await pc.setLocalDescription(offer);

        // 2. POST offer to SRS, get answer
        const resp = await fetch(webrtcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
          body: pc.localDescription!.sdp,
        });
        if (!resp.ok) {
          const errText = await resp.text().catch(() => '');
          throw new Error(`SRS returned ${resp.status}${errText ? ': ' + errText : ''}`);
        }
        const answerSdp = await resp.text();

        // 3. Set remote answer
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
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
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [connect]);

  return { ...state, connect };
}
