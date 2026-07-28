import type { EffectModule } from '../opening/curtain';

export const heartsParticleEffect: EffectModule = {
  id: 'hearts',
  name: 'Hiệu ứng Trái Tim Rơi (Hearts Particle)',
  type: 'particles',
  apply: (container, options = {}) => {
    let canvas = container.querySelector('#effect-particles-hearts') as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'effect-particles-hearts';
      canvas.className = 'absolute inset-0 pointer-events-none z-40 w-full h-full';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const density = (options.density as number) || 30;
      const opacity = (options.opacity as number) || 0.7;

      let width = (canvas.width = container.clientWidth || 375);
      let height = (canvas.height = container.clientHeight || 800);

      const items: { x: number; y: number; size: number; speedY: number; speedX: number; opacity: number }[] = [];
      for (let i = 0; i < density; i++) {
        items.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 12 + 8,
          speedY: Math.random() * 1.5 + 0.5,
          speedX: Math.random() * 1 - 0.5,
          opacity: Math.random() * opacity,
        });
      }

      let animId: number;
      const render = () => {
        ctx.clearRect(0, 0, width, height);
        items.forEach((item) => {
          ctx.save();
          ctx.globalAlpha = item.opacity;
          ctx.font = `${item.size}px sans-serif`;
          ctx.fillText('💖', item.x, item.y);
          ctx.restore();

          item.y += item.speedY;
          item.x += item.speedX;

          if (item.y > height) {
            item.y = -20;
            item.x = Math.random() * width;
          }
        });
        animId = requestAnimationFrame(render);
      };
      render();

      (canvas as unknown as { _animId: number })._animId = animId;
    }
  },
  remove: (container) => {
    const canvas = container.querySelector('#effect-particles-hearts') as HTMLCanvasElement;
    if (canvas) {
      const animId = (canvas as unknown as { _animId: number })._animId;
      if (animId) cancelAnimationFrame(animId);
      canvas.remove();
    }
  },
};

export const petalsParticleEffect: EffectModule = {
  id: 'petals',
  name: 'Hiệu ứng Cánh Hoa Rơi (Petals Particle)',
  type: 'particles',
  apply: (container, options = {}) => {
    let canvas = container.querySelector('#effect-particles-petals') as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'effect-particles-petals';
      canvas.className = 'absolute inset-0 pointer-events-none z-40 w-full h-full';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const density = (options.density as number) || 25;
      let width = (canvas.width = container.clientWidth || 375);
      let height = (canvas.height = container.clientHeight || 800);

      const items: { x: number; y: number; size: number; speedY: number; speedX: number }[] = [];
      for (let i = 0; i < density; i++) {
        items.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 10 + 10,
          speedY: Math.random() * 1.8 + 0.6,
          speedX: Math.random() * 1.5 - 0.75,
        });
      }

      let animId: number;
      const render = () => {
        ctx.clearRect(0, 0, width, height);
        items.forEach((item) => {
          ctx.save();
          ctx.font = `${item.size}px sans-serif`;
          ctx.fillText('🌸', item.x, item.y);
          ctx.restore();

          item.y += item.speedY;
          item.x += item.speedX;

          if (item.y > height) {
            item.y = -20;
            item.x = Math.random() * width;
          }
        });
        animId = requestAnimationFrame(render);
      };
      render();

      (canvas as unknown as { _animId: number })._animId = animId;
    }
  },
  remove: (container) => {
    const canvas = container.querySelector('#effect-particles-petals') as HTMLCanvasElement;
    if (canvas) {
      const animId = (canvas as unknown as { _animId: number })._animId;
      if (animId) cancelAnimationFrame(animId);
      canvas.remove();
    }
  },
};

export const snowParticleEffect: EffectModule = {
  id: 'snow',
  name: 'Hiệu ứng Bông Tuyết Rơi (Snow Particle)',
  type: 'particles',
  apply: (container, options = {}) => {
    let canvas = container.querySelector('#effect-particles-snow') as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'effect-particles-snow';
      canvas.className = 'absolute inset-0 pointer-events-none z-40 w-full h-full';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const density = (options.density as number) || 40;
      let width = (canvas.width = container.clientWidth || 375);
      let height = (canvas.height = container.clientHeight || 800);

      const items: { x: number; y: number; r: number; speedY: number }[] = [];
      for (let i = 0; i < density; i++) {
        items.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 3 + 1,
          speedY: Math.random() * 1.5 + 0.5,
        });
      }

      let animId: number;
      const render = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        items.forEach((item) => {
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
          ctx.fill();

          item.y += item.speedY;
          if (item.y > height) {
            item.y = -10;
            item.x = Math.random() * width;
          }
        });
        animId = requestAnimationFrame(render);
      };
      render();

      (canvas as unknown as { _animId: number })._animId = animId;
    }
  },
  remove: (container) => {
    const canvas = container.querySelector('#effect-particles-snow') as HTMLCanvasElement;
    if (canvas) {
      const animId = (canvas as unknown as { _animId: number })._animId;
      if (animId) cancelAnimationFrame(animId);
      canvas.remove();
    }
  },
};
