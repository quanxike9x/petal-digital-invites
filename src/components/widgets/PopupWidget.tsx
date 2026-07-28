import React, { useState } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';

export interface PopupWidgetProps {
  id: string;
  triggerType?: 'auto' | 'click';
  triggerDelay?: number; // in seconds
  title?: string;
  content?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

export const PopupWidget: React.FC<PopupWidgetProps> = ({
  id,
  triggerType = 'click',
  title = 'Thông Báo Đặc Biệt',
  content = 'Trân trọng kính mời quý khách tham dự lễ thành hôn!',
  overlayColor = '#0f172a',
  overlayOpacity = 0.7,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id={id} className="popup-widget w-full h-full font-sans">
      {/* Editor / Canvas Trigger Card */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-full p-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl shadow-lg font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/20"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Mở Popup Thiệp Mời ({title})</span>
      </button>

      {/* Popup Modal Window */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all animate-widget-zoom"
          style={{ backgroundColor: overlayColor, opacity: 1 }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-rose-100 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-rose-900">{title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{content}</p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
