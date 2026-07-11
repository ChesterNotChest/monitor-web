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
  const [state, setState] = useState<FlvState>({ status: 'idle', error: '' });

  const connect = useCallback(() => {
    if (!flvUrl || !videoRef.current) return;

    // Cleanup previous
    if (playerRef.current) {
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }

    setState({ status: 'connecting', error: '' });

    try {
      // Dynamic import of flv.js
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
          setState({ status: 'error', error: 'FLV 播放错误' });
        });
        player.on(flvjs.default.Events.STATISTICS_INFO, () => {
          setState(s => s.status !== 'playing' ? { status: 'playing', error: '' } : s);
        });

        playerRef.current = player;
      }).catch(() => {
        setState({ status: 'error', error: 'flv.js 加载失败' });
      });
    } catch (e) {
      setState({ status: 'error', error: 'FLV 播放器初始化失败' });
    }
  }, [flvUrl, videoRef]);

  // Auto-connect when URL changes
  useEffect(() => {
    connect();
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
    };
  }, [connect]);

  return { ...state, connect };
}
