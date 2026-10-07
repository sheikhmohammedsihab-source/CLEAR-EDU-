/**
 * YouTube Utility Helper
 * Securely parses YouTube URLs, extracts video IDs, formats playback timestamps,
 * and dynamically loads the official YouTube IFrame Player API.
 */

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // If the user already pasted a clean 11-char alphanumeric/dash/underscore video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    // 1. Standard watch: youtube.com/watch?v=ID
    const watchMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }

    // 2. Short links: youtu.be/ID
    const shortMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch && shortMatch[1]) {
      return shortMatch[1];
    }

    // 3. Shorts: youtube.com/shorts/ID
    const shortsMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch && shortsMatch[1]) {
      return shortsMatch[1];
    }

    // 4. Embed: youtube.com/embed/ID
    const embedMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) {
      return embedMatch[1];
    }

    // 5. General fallback URL object parsing
    let parsedUrl: URL;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      parsedUrl = new URL(trimmed);
    } else {
      parsedUrl = new URL(`https://${trimmed}`);
    }

    if (parsedUrl.hostname.includes('youtube.com')) {
      const v = parsedUrl.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'shorts' && pathParts[1] && /^[a-zA-Z0-9_-]{11}$/.test(pathParts[1])) {
        return pathParts[1];
      }
      if (pathParts[0] === 'embed' && pathParts[1] && /^[a-zA-Z0-9_-]{11}$/.test(pathParts[1])) {
        return pathParts[1];
      }
    } else if (parsedUrl.hostname.includes('youtu.be')) {
      const id = parsedUrl.pathname.replace(/^\//, '');
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Returns safe official YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return '';
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
}

/**
 * Returns official YouTube thumbnail URL
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'hq' | 'mq' | 'default' = 'hq'): string {
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return '';
  }
  const prefix = quality === 'mq' ? 'mqdefault' : quality === 'default' ? 'default' : 'hqdefault';
  return `https://img.youtube.com/vi/${videoId}/${prefix}.jpg`;
}

/**
 * Formats duration seconds into readable string (e.g. 5200 -> "1h 26m", 1500 -> "25m", 45 -> "45s")
 */
export function formatDuration(seconds: number | undefined | null): string {
  if (!seconds || seconds <= 0) return '0m';

  const totalSecs = Math.round(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const remainingSecs = totalSecs % 60;

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSecs > 0 && minutes < 5 ? `${remainingSecs}s` : ''}`.trim();
  }
  return `${remainingSecs}s`;
}

/**
 * Formats resume position into friendly text (e.g. "Continue from 1h 47m" or "Continue from 24m")
 */
export function formatResumePosition(seconds: number | undefined | null): string {
  if (!seconds || seconds <= 0) return '0:00';

  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs > 0 ? `${secs}s` : ''}`.trim();
  }
  return `0:${secs < 10 ? `0${secs}` : secs}`;
}

/**
 * Dynamic loader for the official YouTube IFrame Player API.
 * Ensures the script is added to document head once and returns a promise.
 */
let ytPromise: Promise<void> | null = null;

export function loadYouTubeIFrameAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  // If already loaded and available on window
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }

  if (ytPromise) {
    return ytPromise;
  }

  ytPromise = new Promise((resolve) => {
    // Check if script tag already exists
    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) previousReady();
      resolve();
    };

    // Polling fallback in case callback already fired
    const interval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });

  return ytPromise;
}
