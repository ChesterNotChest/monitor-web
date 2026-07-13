import { useEffect, useRef, useState, useCallback } from 'react';

interface FlvState {
  status: 'idle' | 'connecting' | 'playing' | 'error';
  error: string;
}

/**
 * FLV 直播播放器 hook。
 * 传入 flv_url（HTTP-FLV 地址），通过 flv.js 播放到 <video> 元素。
 */
export function useFlvPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  flvUrl: string | null | undefined,
) {
  const playerRef = useRef<any>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<FlvState>({ status: 'idle', error: '' });

  const doConnect = useCallback(() => {
    if (!flvUrl) {
      console.log('[FLV] skip: no URL');
      return;
    }
    if (!videoRef.current) {
      console.log('[FLV] video element not ready, retry in 200ms');
      retryTimer.current = setTimeout(() => doConnect(), 200);
      return;
    }

    // Cleanup previous
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }

    console.log('[FLV] connecting to:', flvUrl);
    setState({ status: 'connecting', error: '' });

    try {
      import('flv.js').then((flvjs) => {
        if (!videoRef.current) return;
        const player = flvjs.default.createPlayer({
          type: 'flv',
          url: flvUrl,
          isLive: true,
        });
        player.attachMediaElement(videoRef.current);
        player.load();
        player.play();

        player.on(flvjs.default.Events.ERROR, (_e: any) => {
          console.error('[FLV] player error');
          setState({ status: 'error', error: 'FLV 播放错误' });
        });
        player.on(flvjs.default.Events.STATISTICS_INFO, () => {
          setState(s => s.status !== 'playing' ? { status: 'playing', error: '' } : s);
        });

        console.log('[FLV] player created');
        playerRef.current = player;
      }).catch((e) => {
        console.error('[FLV] flv.js load failed:', e);
        setState({ status: 'error', error: 'flv.js 加载失败' });
      });
    } catch (e) {
      console.error('[FLV] init failed:', e);
      setState({ status: 'error', error: 'FLV 播放器初始化失败' });
    }
  }, [flvUrl]);

  // Auto-connect when URL changes (ignores videoRef to avoid stale ref issue)
  useEffect(() => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    doConnect();
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, [doConnect]);

  return { ...state, connect: doConnect };
}
