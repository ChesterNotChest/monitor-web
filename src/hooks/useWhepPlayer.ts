import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebRTC } from '../context/WebRTCContext';

interface WhepState {
  status: 'idle' | 'connecting' | 'playing' | 'error';
  error: string;
}

/**
 * WebRTC WHEP 直播播放器 hook。
 * 使用 WebRTCContext 连接池 —— 挂载时 acquire(url)，卸载时 release(url)。
 */
export function useWhepPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  webrtcUrl: string | null | undefined,
) {
  const { acquire, release } = useWebRTC();
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUrl = useRef<string | null>(null);
  const [state, setState] = useState<WhepState>({ status: 'idle', error: '' });

  const connect = useCallback(() => {
    if (!webrtcUrl) {
      console.log('[WHEP] skip: no URL');
      return;
    }
    if (!videoRef.current) {
      console.log('[WHEP] video element not ready, retry in 200ms');
      retryTimer.current = setTimeout(() => connect(), 200);
      return;
    }

    if (currentUrl.current === webrtcUrl) return; // 已在用
    if (currentUrl.current) release(currentUrl.current); // 释放旧的

    currentUrl.current = webrtcUrl;
    console.log('[WHEP] acquiring:', webrtcUrl);
    setState({ status: 'connecting', error: '' });

    acquire(webrtcUrl).then((result) => {
      if ('error' in result) {
        const msg = result.error;
        console.error('[WHEP] acquire failed:', msg);
        setState({ status: 'error', error: msg });
        currentUrl.current = null;
        return;
      }
      const v = videoRef.current;
      if (v) {
        v.srcObject = result.stream;
        console.log('[WHEP] playing');
      }
      setState({ status: 'playing', error: '' });
    });
  }, [webrtcUrl, acquire, release]);

  useEffect(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    connect();
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (currentUrl.current) {
        release(currentUrl.current);
        currentUrl.current = null;
      }
    };
  }, [connect, release]);

  return { ...state, connect };
}
