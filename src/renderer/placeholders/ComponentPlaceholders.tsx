import React from 'react';
import type { ComponentInstance } from '../../types/renderer';

interface PlaceholderProps {
  component: ComponentInstance;
}

export const TextPlaceholder: React.FC<PlaceholderProps> = ({ component }) => {
  const content = typeof component.props.content === 'string' ? component.props.content : 'Text Component Placeholder';
  return (
    <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-xl text-center">
      <p className="font-bold text-sky-900 text-sm">{content}</p>
    </div>
  );
};

export const ImagePlaceholder: React.FC<PlaceholderProps> = ({ component }) => {
  const src = typeof component.props.src === 'string' 
    ? component.props.src 
    : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600';
  return (
    <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col items-center justify-center">
      <img src={src} alt="Image Placeholder" className="max-h-36 rounded-lg object-cover shadow-sm" />
      <span className="text-xs font-semibold text-emerald-700 mt-2">Image Placeholder</span>
    </div>
  );
};

export const GalleryPlaceholder: React.FC<PlaceholderProps> = () => (
  <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-center text-purple-800 font-bold text-xs">
    🖼️ Gallery Placeholder (Album Slide)
  </div>
);

export const CountdownPlaceholder: React.FC<PlaceholderProps> = () => (
  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-center text-amber-800 font-bold text-xs font-mono">
    ⏳ Countdown Placeholder (Đếm ngược)
  </div>
);

export const TimelinePlaceholder: React.FC<PlaceholderProps> = () => (
  <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl text-center text-rose-800 font-bold text-xs">
    📅 Timeline Placeholder (Lịch trình)
  </div>
);

export const MapPlaceholder: React.FC<PlaceholderProps> = () => (
  <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-center text-indigo-800 font-bold text-xs">
    📍 Map Placeholder (Bản đồ Google Maps)
  </div>
);

export const MusicPlaceholder: React.FC<PlaceholderProps> = () => (
  <div className="p-3 bg-pink-50/80 border border-pink-200 rounded-xl text-center text-pink-800 font-bold text-xs">
    🎵 Music Placeholder (Nhạc nền)
  </div>
);

export const QRPlaceholder: React.FC<PlaceholderProps> = () => (
  <div className="p-3 bg-cyan-50/80 border border-cyan-200 rounded-xl text-center text-cyan-800 font-bold text-xs">
    🔲 QR Placeholder (Mã QR VietQR)
  </div>
);

export const VideoPlaceholder: React.FC<PlaceholderProps> = () => (
  <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl text-center text-red-800 font-bold text-xs">
    🎥 Video Placeholder (Video Kỷ niệm)
  </div>
);

export const DividerPlaceholder: React.FC<PlaceholderProps> = () => (
  <div className="my-2 border-t-2 border-dashed border-slate-300 w-full" />
);

export const SpacerPlaceholder: React.FC<PlaceholderProps> = () => (
  <div className="h-8 bg-slate-100/60 border border-slate-200/60 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-mono">
    Spacer Placeholder (32px)
  </div>
);
