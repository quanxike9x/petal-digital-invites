import React from 'react';
import { Clock, Heart, GlassWater, Sparkles, MapPin } from 'lucide-react';

export interface TimelineItem {
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface WeddingTimelineWidgetProps {
  id: string;
  content?: string;
  settings?: {
    items?: TimelineItem[];
  };
}

const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  { time: '07:30', title: 'Lễ Vu Quy', description: 'Tại tư gia nhà gái' },
  { time: '11:00', title: 'Lễ Thành Hôn', description: 'Lễ gia tiên tại nhà trai' },
  { time: '11:30', title: 'Tiệc Cưới Trọng Thể', description: 'Đón tiếp quan khách tại Trung tâm Tiệc cưới' },
];

export const WeddingTimelineWidget: React.FC<WeddingTimelineWidgetProps> = ({
  id,
  settings = {},
}) => {
  const items = settings.items && settings.items.length > 0 ? settings.items : DEFAULT_TIMELINE_ITEMS;

  return (
    <div id={id} className="wedding-timeline-widget w-full h-full p-4 bg-slate-900/90 text-white rounded-3xl border border-slate-800 shadow-xl font-sans overflow-y-auto space-y-4">
      <div className="text-center space-y-1 pb-2 border-b border-slate-800">
        <h4 className="font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center justify-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Chương Trình Lễ Cưới</span>
        </h4>
      </div>

      <div className="relative border-l-2 border-rose-500/40 ml-4 space-y-4 pl-4 py-1">
        {items.map((item, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-slate-900 shadow-md group-hover:scale-125 transition-transform" />
            <div className="space-y-0.5">
              <span className="font-mono text-rose-400 font-bold text-xs">{item.time}</span>
              <h5 className="font-bold text-xs text-white">{item.title}</h5>
              {item.description && <p className="text-[11px] text-slate-400">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
