import React from 'react';
import { Video } from 'lucide-react';

export interface VideoWidgetProps {
  id: string;
  content?: string;
  url?: string;
  settings?: {
    autoplay?: boolean;
    loop?: boolean;
    mute?: boolean;
  };
}

export const VideoWidget: React.FC<VideoWidgetProps> = ({
  id,
  content,
  url,
  settings = {},
}) => {
  const rawUrl = (content || url || '').trim();

  // Helper: Convert raw YouTube or Vimeo URL into embeddable iframe URL
  const getEmbedUrl = (link: string) => {
    if (!link) return '';
    if (link.includes('youtube.com/watch')) {
      const v = new URLSearchParams(link.split('?')[1]).get('v');
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=${settings.autoplay ? 1 : 0}&loop=${settings.loop ? 1 : 0}&mute=${settings.mute ? 1 : 0}`;
    }
    if (link.includes('youtu.be/')) {
      const v = link.split('youtu.be/')[1]?.split('?')[0];
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=${settings.autoplay ? 1 : 0}&loop=${settings.loop ? 1 : 0}&mute=${settings.mute ? 1 : 0}`;
    }
    if (link.includes('vimeo.com/')) {
      const id = link.split('vimeo.com/')[1]?.split('?')[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return link;
  };

  const embedUrl = getEmbedUrl(rawUrl);
  const isDirectMp4 = rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm');

  if (!rawUrl) {
    return (
      <div id={id} className="w-full h-full bg-slate-900 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-4 space-y-2">
        <Video className="w-8 h-8 text-rose-500" />
        <p className="text-xs font-bold">Chưa có URL Video (YouTube / Vimeo / MP4)</p>
      </div>
    );
  }

  return (
    <div id={id} className="video-widget w-full h-full rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800">
      {isDirectMp4 ? (
        <video
          src={rawUrl}
          controls
          autoPlay={settings.autoplay}
          loop={settings.loop}
          muted={settings.mute}
          className="w-full h-full object-cover"
        />
      ) : (
        <iframe
          src={embedUrl}
          title="Video Player"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};
