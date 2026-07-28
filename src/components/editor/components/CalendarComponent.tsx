import React from 'react';
import type { UnifiedComponentInstance } from '../../../registry/ComponentRegistry';

interface CalendarComponentProps {
  component: UnifiedComponentInstance;
}

export const CalendarComponent: React.FC<CalendarComponentProps> = ({ component }) => {
  const props = component.props || {};
  const style = component.style || {};

  const now = new Date();
  const month = Number(props.month || now.getMonth() + 1);
  const year = Number(props.year || now.getFullYear());
  const weddingDay = Number(props.weddingDay || 20);
  const engagementDay = Number(props.engagementDay || 15);
  const showTwoDates = props.showTwoDates === true;
  const styleType = (props.styleType as string) || 'style1';
  const accentColor = (props.accentColor as string) || '#e11d48';

  const fontStyle: React.CSSProperties = {
    fontFamily: (style.fontFamily as string) || 'inherit',
    fontSize: typeof style.fontSize === 'number' ? `${style.fontSize}px` : (style.fontSize as string) || '14px',
    color: (style.color as string) || '#0f172a',
    backgroundColor: (style.backgroundColor as string) || '#ffffff',
    opacity: style.opacity !== undefined ? Number(style.opacity) : 1,
    padding: typeof style.padding === 'number' ? `${style.padding}px` : (style.padding as string) || '16px',
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : (style.borderRadius as string) || '16px',
    border: (style.border as string) || '1px solid #e2e8f0',
    boxShadow: (style.boxShadow as string) || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const startDayOfWeek = new Date(year, month - 1, 1).getDay();

  const daysArray = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div style={fontStyle} className="w-full h-full text-center font-sans select-none overflow-hidden flex flex-col">
      <div className="mb-3">
        <h4 
          style={{ color: accentColor }} 
          className={`font-bold tracking-wider uppercase ${styleType === 'style2' ? 'font-sans text-base tracking-widest' : 'font-serif text-lg'}`}
        >
          THÁNG {month} / {year}
        </h4>
        <div style={{ backgroundColor: accentColor }} className="w-12 h-0.5 mx-auto mt-1 rounded-full opacity-60" />
      </div>

      <div className="grid grid-cols-7 gap-1 font-bold text-xs text-slate-500 mb-2 border-b pb-1 border-slate-200">
        <span>CN</span>
        <span>T2</span>
        <span>T3</span>
        <span>T4</span>
        <span>T5</span>
        <span>T6</span>
        <span>T7</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs font-semibold flex-1">
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-8" />;
          }

          const isWedding = day === weddingDay;
          const isEngagement = showTwoDates && day === engagementDay;

          const activeStyle: React.CSSProperties = isWedding
            ? { backgroundColor: accentColor, color: '#ffffff' }
            : isEngagement
            ? { backgroundColor: '#f59e0b', color: '#ffffff' }
            : {};

          return (
            <div
              key={`day-${day}`}
              style={activeStyle}
              className={`h-8 flex flex-col items-center justify-center transition-all relative ${
                styleType === 'style2' ? 'rounded-md' : 'rounded-full'
              } ${
                isWedding || isEngagement
                  ? 'font-bold shadow-md scale-110 ring-2 ring-white/50'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>{day}</span>
              {isWedding && <span className="text-[6px] block leading-none font-bold uppercase">Lễ Cưới</span>}
              {isEngagement && <span className="text-[6px] block leading-none font-bold uppercase">Ăn Hỏi</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};