import React, { useState, useEffect } from 'react';

export interface CountdownWidgetProps {
  id: string;
  content?: string; // Target Date e.g. 2026-10-24
  settings?: {
    targetTime?: string; // e.g. 11:30
    timezone?: string;
    format?: string;
    onExpireAction?: 'stop' | 'hide' | 'show_message';
    expireMessage?: string;
  };
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  id,
  content = '2026-10-24',
  settings = {},
}) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetStr = `${content}T${settings.targetTime || '11:30'}:00`;
    const targetDate = new Date(targetStr).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setIsExpired(false);
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [content, settings.targetTime]);

  if (isExpired && settings.onExpireAction === 'hide') {
    return null;
  }

  if (isExpired && settings.onExpireAction === 'show_message') {
    return (
      <div id={id} className="countdown-widget w-full h-full p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center flex items-center justify-center font-sans font-bold text-rose-700 text-sm shadow-sm">
        🎉 {settings.expireMessage || 'Lễ Cưới Đã Diễn Ra Hạnh Phúc! Cảm Ơn Quý Khách!'}
      </div>
    );
  }

  return (
    <div id={id} className="countdown-widget w-full h-full p-3 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-lg border border-slate-800 flex items-center justify-around font-sans">
      {[
        { label: 'NGÀY', val: timeLeft.days },
        { label: 'GIỜ', val: timeLeft.hours },
        { label: 'PHÚT', val: timeLeft.minutes },
        { label: 'GIÂY', val: timeLeft.seconds },
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center justify-center space-y-1">
          <span className="font-extrabold text-lg sm:text-2xl text-rose-500 font-mono tracking-wider">
            {String(item.val).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
