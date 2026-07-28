import React from 'react';
import { Calendar, Heart, Clock, Gift, Sparkles } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface TimelineWidgetProps {
  id: string;
  weddingDate?: string; // YYYY-MM-DD
  events?: TimelineEvent[];
}

export const TimelineWidget: React.FC<TimelineWidgetProps> = ({
  id,
  weddingDate = '2026-10-24',
  events = [
    { id: '1', time: '09:00 AM', title: 'Lễ Vu Quy & Thành Hôn', description: 'Nghi lễ gia tiên hai họ' },
    { id: '2', time: '11:30 AM', title: 'Tiệc Cưới Mừng Cưới', description: 'Đón khách & Khai tiệc mừng' },
  ],
}) => {
  // Generate Monthly Calendar Grid
  const dateObj = new Date(weddingDate);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const selectedDay = dateObj.getDate();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const daysGrid = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    daysGrid.push(day);
  }

  return (
    <div id={id} className="timeline-widget p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-8 my-6 shadow-2xl">
      {/* TIMELINE EVENTS LIST */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
          <Clock className="w-5 h-5 text-rose-500" />
          <span>Lịch Trình Tiệc Cưới</span>
        </div>

        <div className="space-y-3">
          {events.map((evt) => (
            <div key={evt.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{evt.title}</h4>
                  {evt.description && <p className="text-[11px] text-slate-400">{evt.description}</p>}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
                {evt.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MONTHLY CALENDAR WITH HIGHLIGHTED WEDDING DATE */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-center">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-white">
          <span>{monthNames[month]} - {year}</span>
          <span className="text-rose-400 text-[11px]">Ngày chọn: {selectedDay}/{month + 1}/{year}</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-slate-400 py-1 border-y border-slate-800">
          <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs font-mono">
          {daysGrid.map((day, idx) => (
            <div
              key={idx}
              className={`h-8 flex items-center justify-center rounded-xl text-[11px] font-bold ${
                !day
                  ? 'text-transparent'
                  : day === selectedDay
                  ? 'bg-rose-600 text-white shadow-lg ring-2 ring-rose-400 animate-pulse'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {day || ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
