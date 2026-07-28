import type { EffectModule } from './curtain';

export const doubleDoorEffect: EffectModule = {
  id: 'doubleDoor',
  name: 'Hiệu ứng Mở Màn Cổng Hoa (Double Door)',
  type: 'opening',
  apply: (container, options = {}) => {
    let overlay = container.querySelector('#effect-opening-doubledoor') as HTMLElement;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'effect-opening-doubledoor';
      overlay.className = 'absolute inset-0 z-50 flex overflow-hidden pointer-events-auto transition-all duration-1000';
      overlay.innerHTML = `
        <div class="door-left w-1/2 h-full bg-slate-900 shadow-2xl transition-transform duration-1000 ease-in-out border-r-2 border-amber-500/50 flex items-center justify-end pr-6">
          <div class="w-16 h-16 rounded-full border-2 border-amber-400/40 flex items-center justify-center text-amber-400 font-serif text-xl font-bold">囍</div>
        </div>
        <div class="door-right w-1/2 h-full bg-slate-900 shadow-2xl transition-transform duration-1000 ease-in-out border-l-2 border-amber-500/50 flex items-center justify-start pl-6">
          <div class="w-16 h-16 rounded-full border-2 border-amber-400/40 flex items-center justify-center text-amber-400 font-serif text-xl font-bold">囍</div>
        </div>
        <button id="open-door-btn" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold font-serif text-xs rounded-full shadow-2xl hover:scale-105 transition-transform cursor-pointer z-50">
          Mở Cổng Hoa 🌸
        </button>
      `;
      container.appendChild(overlay);

      const btn = overlay.querySelector('#open-door-btn');
      const doorLeft = overlay.querySelector('.door-left') as HTMLElement;
      const doorRight = overlay.querySelector('.door-right') as HTMLElement;

      const triggerOpen = () => {
        if (doorLeft) doorLeft.style.transform = 'translateX(-100%)';
        if (doorRight) doorRight.style.transform = 'translateX(100%)';
        if (btn) (btn as HTMLElement).style.opacity = '0';
        setTimeout(() => {
          overlay.style.pointerEvents = 'none';
          overlay.style.opacity = '0';
        }, 1000);
      };

      if (btn) btn.addEventListener('click', triggerOpen);
      if (options.autoOpen) setTimeout(triggerOpen, (options.delay as number) || 2000);
    }
  },
  remove: (container) => {
    const overlay = container.querySelector('#effect-opening-doubledoor');
    if (overlay) overlay.remove();
  },
};

export const envelopeEffect: EffectModule = {
  id: 'envelope',
  name: 'Hiệu ứng Mở Phong Bì Thư (Envelope)',
  type: 'opening',
  apply: (container, options = {}) => {
    let overlay = container.querySelector('#effect-opening-envelope') as HTMLElement;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'effect-opening-envelope';
      overlay.className = 'absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto transition-all duration-700';
      overlay.innerHTML = `
        <div class="envelope-card bg-amber-50/95 border-2 border-amber-300 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full space-y-4 font-serif text-slate-900 transition-all duration-700">
          <div class="w-12 h-12 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center mx-auto text-lg shadow-md">💌</div>
          <h3 className="font-bold text-lg text-rose-900">Thiệp Mời Báo Hỷ</h3>
          <p className="text-xs text-slate-600 font-sans italic">Trân trọng kính mời quý khách mở thiệp hồng</p>
          <button id="open-envelope-btn" class="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-102 cursor-pointer">
            Mở Thiệp Hồng ✉️
          </button>
        </div>
      `;
      container.appendChild(overlay);

      const btn = overlay.querySelector('#open-envelope-btn');
      const card = overlay.querySelector('.envelope-card') as HTMLElement;

      const triggerOpen = () => {
        if (card) {
          card.style.transform = 'scale(0.8) translateY(-50px)';
          card.style.opacity = '0';
        }
        setTimeout(() => {
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
        }, 500);
      };

      if (btn) btn.addEventListener('click', triggerOpen);
      if (options.autoOpen) setTimeout(triggerOpen, (options.delay as number) || 2000);
    }
  },
  remove: (container) => {
    const overlay = container.querySelector('#effect-opening-envelope');
    if (overlay) overlay.remove();
  },
};
