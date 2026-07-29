import React, { useEffect, useRef } from 'react';

export interface FullPageEffectsWidgetProps {
  id: string;
  effectType?: 'flowers' | 'hearts' | 'snow' | 'confetti' | 'bubbles' | 'sparkles' | 'fireworks' | 'sakura';
  density?: number; // 10 to 100
  speed?: number; // 1 to 5
  enabled?: boolean;
}

export const FullPageEffectsWidget: React.FC<FullPageEffectsWidgetProps> = ({
  id,
  effectType = 'flowers',
  density = 30,
  speed = 2,
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Symbols for effect types
    const symbols = {
      flowers: ['🌸', '🌺', '🌹', '🌷'],
      sakura: ['🌸', '🌺'],
      hearts: ['💖', '❤️', '💕', '💗'],
      snow: ['❄️', '❅', '❆'],
      confetti: ['🎉', '✨', '🟡', '🔴', '🔵'],
      bubbles: ['🫧', '⚪'],
      sparkles: ['✨', '⭐', '🌟'],
      fireworks: ['🎆', '💥', '✨'],
    };

    const currentSymbols = symbols[effectType] || symbols.flowers;

    interface Particle {
      x: number;
      y: number;
      size: number;
      symbol: string;
      speedY: number;
      speedX: number;
      rotation: number;
      rotSpeed: number;
      opacity: number;
    }

    const particles: Particle[] = Array.from({ length: Math.min(80, Math.max(10, density)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 14 + Math.random() * 16,
      symbol: currentSymbols[Math.floor(Math.random() * currentSymbols.length)],
      speedY: (0.8 + Math.random() * 1.5) * speed,
      speedX: (Math.random() - 0.5) * 0.8 * speed,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03 * speed,
      opacity: 0.6 + Math.random() * 0.4,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > canvas.height + 30) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 30) p.x = -20;
        if (p.x < -30) p.x = canvas.width + 20;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effectType, density, speed, enabled]);

  return (
    <div id={id} className="full-page-effects-widget w-full h-full pointer-events-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-40" />
      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center text-xs font-bold text-rose-600 shadow-sm backdrop-blur-sm">
        ✨ Hiệu Ứng Full Page ({effectType.toUpperCase()}) - Đang Kích Hoạt
      </div>
    </div>
  );
};
