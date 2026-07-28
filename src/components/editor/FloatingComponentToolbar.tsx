import React, { useState } from 'react';
import { 
  Copy, 
  Trash2, 
  MoreHorizontal, 
  ChevronsUp, 
  ChevronsDown, 
  ArrowUp, 
  ArrowDown, 
  Lock, 
  Unlock
} from 'lucide-react';
import type { UnifiedComponentInstance } from '../../registry/ComponentRegistry';

interface FloatingComponentToolbarProps {
  selectedComponent: UnifiedComponentInstance;
  onDuplicate: (comp: UnifiedComponentInstance) => void;
  onDelete: (compId: string) => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleLock?: () => void;
}

/**
 * TASK UI-03.2 — FLOATING TOOLBAR FIX
 * Immediate visual Lock / Unlock toggle, Copy, Delete, Bring Front/Back, Move Up/Down, Z-Index.
 * Always stays visible right above selected component even when component is locked!
 */
export const FloatingComponentToolbar: React.FC<FloatingComponentToolbarProps> = ({
  selectedComponent,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown,
  onToggleLock,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isLocked = selectedComponent.layout?.layer?.locked ?? false;
  const zIndexVal = selectedComponent.layout?.layer?.order ?? 1;
  const layerName = selectedComponent.name || selectedComponent.type;

  return (
    <div
      data-floating-toolbar="true"
      className="absolute -top-11 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 px-2.5 py-1.5 rounded-xl shadow-2xl font-sans text-xs select-none pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Lớp Hiện Tại Badge */}
      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 max-w-[110px] truncate" title={`Lớp Hiện Tại: ${layerName}`}>
        {layerName}
      </span>

      <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

      {/* QUICK LOCK / UNLOCK BUTTON RIGHT ON MAIN BAR */}
      {onToggleLock && (
        <button
          type="button"
          onClick={onToggleLock}
          className={`p-1 px-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
            isLocked
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title={isLocked ? 'Bấm để Mở Khóa Vị Trí' : 'Bấm để Khóa Vị Trí'}
        >
          {isLocked ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Mở Khóa</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Khóa</span>
            </>
          )}
        </button>
      )}

      {/* Copy Button */}
      <button
        type="button"
        onClick={() => onDuplicate(selectedComponent)}
        className="p-1 px-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
        title="Nhân bản Component"
      >
        <Copy className="w-3.5 h-3.5 text-amber-400" />
        <span>Copy</span>
      </button>

      {/* Xóa Button */}
      <button
        type="button"
        onClick={() => onDelete(selectedComponent.id)}
        className="p-1 px-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
        title="Xóa Component"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Xóa</span>
      </button>

      <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

      {/* Ba Chấm Menu (...) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`p-1 px-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold ${
            isMoreOpen ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Tùy chọn khác (...)"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
          <span>...</span>
        </button>

        {isMoreOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 z-50">
            <div className="px-2 py-1 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Chỉnh Thứ Tự Lớp (Z-Index)</span>
              <span className="text-amber-400 font-bold">#{zIndexVal}</span>
            </div>

            {onBringToFront && (
              <button
                onClick={() => {
                  onBringToFront();
                  setIsMoreOpen(false);
                }}
                className="w-full px-2 py-1.5 rounded-lg hover:bg-slate-800 text-left flex items-center gap-2 text-slate-200 text-xs cursor-pointer font-semibold"
              >
                <ChevronsUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Đưa Lên Trên Cùng</span>
              </button>
            )}

            {onMoveUp && (
              <button
                onClick={() => {
                  onMoveUp();
                  setIsMoreOpen(false);
                }}
                className="w-full px-2 py-1.5 rounded-lg hover:bg-slate-800 text-left flex items-center gap-2 text-slate-200 text-xs cursor-pointer font-semibold"
              >
                <ArrowUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Đưa Lên 1 Lớp</span>
              </button>
            )}

            {onMoveDown && (
              <button
                onClick={() => {
                  onMoveDown();
                  setIsMoreOpen(false);
                }}
                className="w-full px-2 py-1.5 rounded-lg hover:bg-slate-800 text-left flex items-center gap-2 text-slate-200 text-xs cursor-pointer font-semibold"
              >
                <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                <span>Đưa Xuống 1 Lớp</span>
              </button>
            )}

            {onSendToBack && (
              <button
                onClick={() => {
                  onSendToBack();
                  setIsMoreOpen(false);
                }}
                className="w-full px-2 py-1.5 rounded-lg hover:bg-slate-800 text-left flex items-center gap-2 text-slate-200 text-xs cursor-pointer font-semibold"
              >
                <ChevronsDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Đưa Xuống Dưới Cùng</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
