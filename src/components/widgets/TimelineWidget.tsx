import React, { useRef, useEffect, useState } from 'react';
import { Clock, Sparkles, Heart } from 'lucide-react';

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
  style?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    borderRadius?: number;
    fontFamily?: string;
    width?: string | number;
    height?: string | number;
  };
}

export const TimelineWidget: React.FC<TimelineWidgetProps> = ({
  id,
  weddingDate = '2026-10-24',
  events = [
    { id: '1', time: '09:00 AM', title: 'Lễ Vu Quy & Thành Hôn', description: 'Nghi lễ gia tiên hai họ' },
    { id: '2', time: '11:30 AM', title: 'Tiệc Cưới Mừng Cưới', description: 'Đón khách & Khai tiệc mừng' },
  ],
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Kích thước cơ sở
  const BASE_WIDTH = 480;
  const BASE_HEIGHT = 560;

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const currentWidth = container.clientWidth;
      const currentHeight = container.clientHeight;
      
      if (currentWidth === 0 || currentHeight === 0) return;
      
      const widthRatio = currentWidth / BASE_WIDTH;
      const heightRatio = currentHeight / BASE_HEIGHT;
      const newScale = Math.min(widthRatio, heightRatio, 1);
      setScale(Math.max(0.3, newScale));
    };

    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);
    
    return () => {
      window.removeEventListener('resize', updateScale);
      resizeObserver.disconnect();
    };
  }, []);

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

  const fontFamily = (style.fontFamily as string) || "'Be Vietnam Pro', 'Arial', sans-serif";
  const bgColor = (style.backgroundColor as string) || '#0f172a';
  const textColor = (style.color as string) || '#f8fafc';

  const containerStyle: React.CSSProperties = {
    fontFamily: fontFamily,
    backgroundColor: bgColor,
    color: textColor,
    fontSize: typeof style.fontSize === 'number' ? `${style.fontSize}px` : (style.fontSize as string) || '14px',
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : (style.borderRadius as string) || '24px',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
  };

  const contentStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    padding: '20px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  // Kiểm tra ngày hiện tại
  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div ref={containerRef} style={containerStyle} className="w-full h-full overflow-hidden">
      <div style={contentStyle} className="bg-slate-900 rounded-3xl shadow-2xl">
        {/* TIMELINE EVENTS LIST */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm">
            <Clock className="w-4 h-4 text-rose-500" />
            <span style={{ fontFamily }}>Lịch Trình Tiệc Cưới</span>
          </div>

          <div className="space-y-2.5">
            {events.map((evt) => (
              <div key={evt.id} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-left transition-all hover:border-rose-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-[11px]">{evt.title}</h4>
                    {evt.description && <p className="text-[10px] text-slate-400">{evt.description}</p>}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 shrink-0">
                  {evt.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* MONTHLY CALENDAR WITH HEART */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-center">
          {/* Header - Tháng + Năm */}
          <div className="flex items-center justify-between px-2 text-xs font-bold text-white">
            <span className="font-serif text-sm tracking-wide text-rose-300">
              {monthNames[month]} {year}
            </span>
            <span className="text-rose-400 text-[10px] flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span>Ngày cưới: {selectedDay}/{month + 1}/{year}</span>
            </span>
          </div>

          {/* Thứ trong tuần */}
          <div className="grid grid-cols-7 gap-1 text-[9px] font-bold text-slate-500 py-1 border-y border-slate-800">
            <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
          </div>

          {/* Grid ngày */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((day, idx) => {
              const isWeddingDay = day === selectedDay;
              const isCurrentDay = day !== null && isToday(day);

              return (
                <div
                  key={idx}
                  className={`h-9 flex items-center justify-center rounded-xl text-[11px] font-bold transition-all ${
                    !day
                      ? 'text-transparent'
                      : isWeddingDay
                      ? 'bg-gradient-to-br from-rose-600 to-rose-500 shadow-lg shadow-rose-500/30 scale-105 ring-2 ring-rose-400/50'
                      : isCurrentDay
                      ? 'bg-slate-700/50 text-slate-300 ring-1 ring-slate-600'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {day !== null ? (
                    isWeddingDay ? (
                      <div className="relative flex items-center justify-center">
                        <Heart className="w-5 h-5 fill-rose-400 text-rose-400 animate-pulse" />
                        <span className="absolute text-[9px] font-bold text-white">{day}</span>
                      </div>
                    ) : (
                      <span>{day}</span>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Footer chú thích */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-center gap-3 text-[8px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span>Ngày cưới</span>
            </span>
            <span className="w-px h-3 bg-slate-700" />
            <span>💕 {monthNames[month]} {year}</span>
            {isToday(selectedDay) && (
              <>
                <span className="w-px h-3 bg-slate-700" />
                <span className="text-rose-400">Hôm nay ❤️</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};