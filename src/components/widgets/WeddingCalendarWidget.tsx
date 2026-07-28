import React, { useState } from 'react';
import { Calendar as CalendarIcon, Heart } from 'lucide-react';

export interface WeddingCalendarWidgetProps {
  id: string;
  content?: string; // Wedding Date e.g. 2026-10-24
  settings?: {
    lunarDateText?: string;
    solarDateText?: string;
    highlightDay?: number; // e.g. 24
  };
}

export const WeddingCalendarWidget: React.FC<WeddingCalendarWidgetProps> = ({
  id,
  content = '2026-10-24',
  settings = {},
}) => {
  const [calendarMode, setCalendarMode] = useState<'solar' | 'lunar'>('solar');

  const highlightDay = settings.highlightDay || 24;

  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div id={id} className="wedding-calendar-widget w-full h-full p-4 bg-slate-900/90 text-white rounded-3xl border border-slate-800 shadow-xl font-sans overflow-hidden space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
          <CalendarIcon className="w-4 h-4" />
          <span>Tháng 10 / 2026</span>
        </div>

        {/* Solar / Lunar Toggle */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            onClick={() => setCalendarMode('solar')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              calendarMode === 'solar' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400'
            }`}
          >
            Dương Lịch
          </button>
          <button
            onClick={() => setCalendarMode('lunar')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              calendarMode === 'lunar' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400'
            }`}
          >
            Âm Lịch
          </button>
        </div>
      </div>

      {/* Grid Calendar */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {daysOfWeek.map((d, idx) => (
          <span key={idx} className="font-bold text-slate-400">{d}</span>
        ))}

        {/* Dummy offset for start day */}
        <span />
        <span />
        <span />

        {monthDays.map((day) => {
          const isHighlight = day === highlightDay;
          return (
            <div
              key={day}
              className={`p-1.5 rounded-xl font-bold font-mono transition-all flex flex-col items-center justify-center ${
                isHighlight
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400 animate-pulse'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span>{day}</span>
              {isHighlight && <Heart className="w-2.5 h-2.5 fill-white mt-0.5" />}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-center text-slate-400 italic">
        {calendarMode === 'solar'
          ? (settings.solarDateText || 'Thứ Bảy, ngày 24 tháng 10 năm 2026')
          : (settings.lunarDateText || 'Tức ngày 15 tháng 09 năm Bính Ngọ')}
      </p>
    </div>
  );
};
