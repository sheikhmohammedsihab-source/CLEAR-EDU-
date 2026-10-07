import React, { useEffect, useRef, useState } from 'react';
import { loadYouTubeIFrameAPI } from '../lib/youtube';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  initialTimeSeconds?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onPaused?: (currentTime: number) => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  initialTimeSeconds = 0,
  onTimeUpdate,
  onEnded,
  onPaused,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Keep latest callbacks in refs to avoid recreating player when handlers change
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const onPausedRef = useRef(onPaused);
  onPausedRef.current = onPaused;

  useEffect(() => {
    let isMounted = true;
    const playerId = `yt-player-${Math.random().toString(36).substring(2, 9)}`;

    if (containerRef.current) {
      containerRef.current.innerHTML = `<div id="${playerId}" class="w-full h-full"></div>`;
    }

    loadYouTubeIFrameAPI()
      .then(() => {
        if (!isMounted || !window.YT || !window.YT.Player) return;

        playerRef.current = new window.YT.Player(playerId, {
          videoId,
          playerVars: {
            autoplay: 0,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              setIsReady(true);

              // Restore saved position if positive
              if (initialTimeSeconds && initialTimeSeconds > 5) {
                try {
                  event.target.seekTo(initialTimeSeconds, true);
                } catch (e) {
                  console.warn('Seek error on ready:', e);
                }
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              const state = event.data;

              // YT.PlayerState.PLAYING = 1
              if (state === 1) {
                // Start 10-15s throttled periodic position check
                if (!intervalRef.current) {
                  intervalRef.current = setInterval(() => {
                    try {
                      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                        const curTime = playerRef.current.getCurrentTime();
                        const dur = playerRef.current.getDuration() || 0;
                        if (curTime !== undefined && onTimeUpdateRef.current) {
                          onTimeUpdateRef.current(curTime, dur);
                        }
                      }
                    } catch (e) {
                      console.warn('Progress check error:', e);
                    }
                  }, 12000);
                }
              } else {
                // Clear periodic interval when not actively playing
                if (intervalRef.current) {
                  clearInterval(intervalRef.current);
                  intervalRef.current = null;
                }
              }

              // YT.PlayerState.PAUSED = 2
              if (state === 2) {
                try {
                  if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    const curTime = playerRef.current.getCurrentTime();
                    if (onPausedRef.current) {
                      onPausedRef.current(curTime);
                    }
                  }
                } catch (e) {
                  console.warn('Pause handler error:', e);
                }
              }

              // YT.PlayerState.ENDED = 0
              if (state === 0) {
                if (onEndedRef.current) {
                  onEndedRef.current();
                }
              }
            },
          },
        });
      })
      .catch((err) => {
        console.error('Failed to initialize YouTube IFrame Player:', err);
      });

    // Cleanup on unmount or videoId change: save current position
    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const curTime = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration() || 0;
          if (curTime > 0 && onTimeUpdateRef.current) {
            onTimeUpdateRef.current(curTime, dur);
          }
          playerRef.current.destroy();
        }
      } catch (e) {
        // Ignored during unmount
      }
    };
  }, [videoId]);

  // Handle page visibility change (tab hidden or window minimized)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const curTime = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration() || 0;
          if (curTime > 0 && onTimeUpdateRef.current) {
            onTimeUpdateRef.current(curTime, dur);
          }
        } catch (e) {
          // ignore
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className={`relative aspect-video w-full bg-slate-950 rounded-3xl overflow-hidden shadow-lg border border-slate-800 ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {!isReady && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-2 text-white">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-400">Loading YouTube stream...</span>
        </div>
      )}
    </div>
  );
};
