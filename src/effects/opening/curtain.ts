export interface EffectModule {
  id: string;
  name: string;
  type: 'opening' | 'particles';
  apply: (container: HTMLElement, options?: Record<string, unknown>) => void;
  remove: (container: HTMLElement) => void;
}

export const curtainEffect: EffectModule = {
  id: 'curtain',
  name: 'Hiệu ứng Mở Màn Rèm Cửa (Curtain)',
  type: 'opening',
  apply: (container, options = {}) => {
    let overlay = container.querySelector('#effect-opening-curtain') as HTMLElement;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'effect-opening-curtain';
      overlay.className = 'absolute inset-0 z-50 flex overflow-hidden pointer-events-auto transition-all duration-1000';
      overlay.innerHTML = `
        <div class="left-panel w-1/2 h-full bg-gradient-to-r from-rose-900 to-rose-700 shadow-2xl transition-transform duration-1000 ease-in-out border-r border-amber-400/30 flex items-center justify-end pr-4">
          <div class="text-amber-200 font-serif text-2xl font-bold">Pudwedding</div>
        </div>
        <div class="right-panel w-1/2 h-full bg-gradient-to-l from-rose-900 to-rose-700 shadow-2xl transition-transform duration-1000 ease-in-out border-l border-amber-400/30 flex items-center justify-start pl-4">
          <div class="text-amber-200 font-serif text-2xl font-bold">Invitation</div>
        </div>
        <button id="open-curtain-btn" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-amber-400 text-slate-950 font-bold font-serif text-sm rounded-full shadow-2xl hover:scale-105 transition-transform cursor-pointer z-50">
          Chạm Để Mở Thiệp ✉️
        </button>
      `;
      container.appendChild(overlay);

      const btn = overlay.querySelector('#open-curtain-btn');
      const leftPanel = overlay.querySelector('.left-panel') as HTMLElement;
      const rightPanel = overlay.querySelector('.right-panel') as HTMLElement;

      const triggerOpen = () => {
        if (leftPanel) leftPanel.style.transform = 'translateX(-100%)';
        if (rightPanel) rightPanel.style.transform = 'translateX(100%)';
        if (btn) (btn as HTMLElement).style.opacity = '0';
        setTimeout(() => {
          overlay.style.pointerEvents = 'none';
          overlay.style.opacity = '0';
        }, 1000);
      };

      if (btn) btn.addEventListener('click', triggerOpen);

      if (options.autoOpen) {
        setTimeout(triggerOpen, (options.delay as number) || 2000);
      }
    }
  },
  remove: (container) => {
    const overlay = container.querySelector('#effect-opening-curtain');
    if (overlay) overlay.remove();
  },
};
