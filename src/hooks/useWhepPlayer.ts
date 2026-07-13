import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebRTC } from '../context/WebRTCContext';

interface WhepState {
  status: 'idle' | 'connecting' | 'playing' | 'error';
  error: string;
}

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

    if (currentUrl.current === webrtcUrl) return;
    if (currentUrl.current) release(currentUrl.current);

    currentUrl.current = webrtcUrl;
    console.log('[WHEP] acquiring:', webrtcUrl);
    setState({ status: 'connecting', error: '' });

    acquire(webrtcUrl).then((result) => {
      if ('error' in result) {
        console.error('[WHEP] acquire failed:', result.error);
        setState({ status: 'error', error: result.error });
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
