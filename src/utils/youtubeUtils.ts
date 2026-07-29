export interface VideoEmbedOptions {
  autoplay?: boolean;
  mute?: boolean;
  loop?: boolean;
}

/**
 * Extract YouTube / Vimeo Video ID and return valid embed URL with options
 */
export const getEmbedVideoUrl = (url?: string, options: VideoEmbedOptions = {}): string | null => {
  if (!url) return null;

  const { autoplay = false, mute = false, loop = false } = options;

  // YouTube match
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  if (ytMatch && ytMatch[2].length === 11) {
    const videoId = ytMatch[2];
    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', '1');
    if (mute) params.set('mute', '1');
    if (loop) {
      params.set('loop', '1');
      params.set('playlist', videoId);
    }
    params.set('rel', '0');
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  // Vimeo match
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    const params = new URLSearchParams();
    if (autoplay) params.set('autoplay', '1');
    if (mute) params.set('muted', '1');
    if (loop) params.set('loop', '1');
    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  }

  return null;
};

export const getYouTubeEmbedUrl = (url?: string): string | null => {
  return getEmbedVideoUrl(url);
};

export const isValidVideoUrl = (url?: string): boolean => {
  return getEmbedVideoUrl(url) !== null;
};
