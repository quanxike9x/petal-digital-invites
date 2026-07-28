import React, { useEffect, useState } from 'react';
import type { UnifiedComponentInstance } from '../../../registry/ComponentRegistry';

interface CountdownComponentProps {
  component: UnifiedComponentInstance;
}

export const CountdownComponent: React.FC<CountdownComponentProps> = ({ component }) => {
  const props = component.props || {};
  const style = component.style || {};

  const targetDateStr = (props.targetDate as string) || '2026-12-31T18:00:00';
  const orientation = (props.orientation as string) || 'horizontal';
  const gap = Number(props.gap ?? 8);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const containerStyle: React.CSSProperties = {
    backgroundColor: (style.backgroundColor as string) || '#f8fafc',
    color: (style.color as string) || '#0f172a',
    padding: typeof style.padding === 'number' ? `${style.padding}px` : (style.padding as string) || '16px',
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : (style.borderRadius as string) || '16px',
    border: (style.border as string) || '1px solid #e2e8f0',
    opacity: style.opacity !== undefined ? Number(style.opacity) : 1,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cardStyle: React.CSSProperties = {
    borderColor: (props.frameColor as string) || '#cbd5e1',
    backgroundColor: (props.cardBg as string) || '#ffffff',
  };

  return (
    <div style={containerStyle} className="w-full h-full flex flex-col items-center justify-center font-sans select-none">
      <h4 className="font-serif font-bold text-sm text-slate-800 mb-3 uppercase tracking-wider">
        Cùng Đếm Ngược Ngày Vui
      </h4>

      <div
        className={`flex items-center justify-center ${
          orientation === 'vertical' ? 'flex-col' : 'flex-row'
        }`}
        style={{ gap: `${gap}px`, flexWrap: 'wrap' }}
      >
        <div style={cardStyle} className="p-3.5 rounded-xl border shadow-sm flex flex-col items-center min-w-[64px]">
          <span className="font-mono font-extrabold text-2xl text-rose-600">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Ngày</span>
        </div>

        <div style={cardStyle} className="p-3.5 rounded-xl border shadow-sm flex flex-col items-center min-w-[64px]">
          <span className="font-mono font-extrabold text-2xl text-rose-600">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Giờ</span>
        </div>

        <div style={cardStyle} className="p-3.5 rounded-xl border shadow-sm flex flex-col items-center min-w-[64px]">
          <span className="font-mono font-extrabold text-2xl text-rose-600">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Phút</span>
        </div>

        <div style={cardStyle} className="p-3.5 rounded-xl border shadow-sm flex flex-col items-center min-w-[64px]">
          <span className="font-mono font-extrabold text-2xl text-rose-600 animate-pulse">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Giây</span>
        </div>
      </div>
    </div>
  );
};