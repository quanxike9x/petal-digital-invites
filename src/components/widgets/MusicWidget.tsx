import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export interface MusicWidgetProps {
  id: string;
  content?: string;
  url?: string;
  settings?: {
    autoplay?: boolean;
    loop?: boolean;
    volume?: number; // 0 to 1
    pinPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    alwaysOnTop?: boolean;
  };
}

export const MusicWidget: React.FC<MusicWidgetProps> = ({
  id,
  content,
  url,
  settings = {},
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Safe URL extractor & Dropbox URL converter to direct stream URL
  const getCleanAudioUrl = (rawUrl?: string): string => {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    let trimmed = rawUrl.trim();
    if (!trimmed) return '';
    if (trimmed.includes('dropbox.com')) {
      trimmed = trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=0', 'dl=1');
    }
    return trimmed;
  };

  const audioUrl = getCleanAudioUrl(content) || getCleanAudioUrl(url) || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume !== undefined ? settings.volume : 0.8;
      audioRef.current.loop = settings.loop !== false;
      if (settings.autoplay) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [audioUrl, settings.volume, settings.loop, settings.autoplay]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  return (
    <div id={id} className="music-widget w-full h-full flex items-center justify-center font-sans">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* Sleek Floating Circular Disc Button */}
      <button
        onClick={togglePlay}
        className={`w-full h-full aspect-square rounded-full bg-slate-900 border-2 border-amber-400/80 shadow-2xl flex items-center justify-center text-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 relative group overflow-hidden ${
          isPlaying ? 'animate-spin' : ''
        }`}
        style={{ animationDuration: '8s' }}
      >
        <div className="absolute inset-1 rounded-full border border-dashed border-amber-400/30" />
        {isPlaying ? (
          <Music className="w-5 h-5 text-amber-400" />
        ) : (
          <Play className="w-5 h-5 text-amber-400 translate-x-0.5" />
        )}
      </button>
    </div>
  );
};
