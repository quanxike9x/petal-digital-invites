import React, { useState, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

export interface GalleryWidgetProps {
  id: string;
  content?: string;
  images?: string[];
  mode?: 'grid' | 'carousel' | 'slider';
  autoplay?: boolean;
  loop?: boolean;
  intervalMs?: number;
  maxImages?: number;
  settings?: Record<string, any>;
}

const DEFAULT_GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600',
];

export const GalleryWidget: React.FC<GalleryWidgetProps> = ({
  id,
  content,
  images = [],
  mode: propMode,
  autoplay: propAutoplay,
  settings = {},
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const galleryMode = settings.mode || propMode || 'grid';
  const isAutoplay = settings.autoplay !== false;

  // Resolve image URLs from content string (comma-separated), settings.images array, or images prop
  let parsedImages: string[] = [];
  if (Array.isArray(settings.images) && settings.images.length > 0) {
    parsedImages = settings.images;
  } else if (Array.isArray(images) && images.length > 0) {
    parsedImages = images;
  } else if (content && typeof content === 'string') {
    parsedImages = content.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (parsedImages.length === 0) {
    parsedImages = DEFAULT_GALLERY_IMAGES;
  }

  // Autoplay Slider Ticker
  useEffect(() => {
    if (!isAutoplay || galleryMode === 'grid' || parsedImages.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev >= parsedImages.length - 1 ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [isAutoplay, galleryMode, parsedImages.length]);

  return (
    <div id={id} className="gallery-widget w-full h-full p-2 overflow-y-auto font-sans">
      {/* GRID MODE */}
      {galleryMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-2">
          {parsedImages.map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxImg(imgUrl)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 cursor-pointer group shadow border border-white/10"
            >
              <img
                src={imgUrl}
                alt={`Album ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* CAROUSEL MODE */
        <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-xl group">
          <img
            src={parsedImages[activeSlide] || parsedImages[0]}
            alt="Carousel Slide"
            className="w-full h-full object-cover transition-all duration-500"
          />

          {parsedImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev === 0 ? parsedImages.length - 1 : prev - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((prev) => (prev === parsedImages.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-950/60 px-3 py-1 rounded-full backdrop-blur-sm">
                {parsedImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide(i);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeSlide === i ? 'bg-rose-500 w-4' : 'bg-slate-400/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-rose-600 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImg} alt="Lightbox View" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}
    </div>
  );
};
