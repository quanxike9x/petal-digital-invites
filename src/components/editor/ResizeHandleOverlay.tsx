import React from 'react';

export type HandleDirection = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface ResizeHandleOverlayProps {
  isResizing?: boolean;
  activeWidth?: number | string;
  activeHeight?: number | string;
  tooltipPos?: { x: number; y: number } | null;
  onHandleMouseDown?: (direction: HandleDirection, cursorStyle: string, e: React.MouseEvent) => void;
}

interface HandleConfig {
  dir: HandleDirection;
  cursorCss: string;
  cursorClass: string;
  positionClass: string;
}

const HANDLES: HandleConfig[] = [
  { dir: 'top-left', cursorCss: 'nwse-resize', cursorClass: 'cursor-nwse-resize', positionClass: '-top-1.5 -left-1.5' },
  { dir: 'top-center', cursorCss: 'ns-resize', cursorClass: 'cursor-ns-resize', positionClass: '-top-1.5 left-1/2 -translate-x-1/2' },
  { dir: 'top-right', cursorCss: 'nesw-resize', cursorClass: 'cursor-nesw-resize', positionClass: '-top-1.5 -right-1.5' },
  { dir: 'middle-left', cursorCss: 'ew-resize', cursorClass: 'cursor-ew-resize', positionClass: 'top-1/2 -left-1.5 -translate-y-1/2' },
  { dir: 'middle-right', cursorCss: 'ew-resize', cursorClass: 'cursor-ew-resize', positionClass: 'top-1/2 -right-1.5 -translate-y-1/2' },
  { dir: 'bottom-left', cursorCss: 'nesw-resize', cursorClass: 'cursor-nesw-resize', positionClass: '-bottom-1.5 -left-1.5' },
  { dir: 'bottom-center', cursorCss: 'ns-resize', cursorClass: 'cursor-ns-resize', positionClass: '-bottom-1.5 left-1/2 -translate-x-1/2' },
  { dir: 'bottom-right', cursorCss: 'nwse-resize', cursorClass: 'cursor-nwse-resize', positionClass: '-bottom-1.5 -right-1.5' },
];

/**
 * RESIZE HANDLE OVERLAY & GHOST OUTLINE & REALTIME SIZE TOOLTIP (Sprint 17.3.1 UX Patch)
 */
export const ResizeHandleOverlay: React.FC<ResizeHandleOverlayProps> = React.memo(({
  isResizing = false,
  activeWidth,
  activeHeight,
  tooltipPos,
  onHandleMouseDown,
}) => {
  const formattedWidth = typeof activeWidth === 'number' ? `${Math.round(activeWidth)}px` : activeWidth || 'auto';
  const formattedHeight = typeof activeHeight === 'number' ? `${Math.round(activeHeight)}px` : activeHeight || 'auto';

  return (
    <>
      {/* 8-POINT RESIZE HANDLES & SELECTION BOUNDARY OVERLAY */}
      <div className={`absolute inset-0 pointer-events-none z-[1000] border-2 rounded-lg transition-colors ${
        isResizing ? 'border-blue-600 border-dashed bg-blue-500/10 shadow-2xl' : 'border-blue-500'
      }`}>
        {HANDLES.map(({ dir, cursorCss, cursorClass, positionClass }) => (
          <div
            key={dir}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onHandleMouseDown) onHandleMouseDown(dir, cursorCss, e);
            }}
            className={`absolute w-3 h-3 bg-blue-600 border-2 border-white rounded-[3px] shadow-md pointer-events-auto transition-transform duration-120 hover:scale-125 ${cursorClass} ${positionClass} ${
              isResizing ? 'scale-125 bg-amber-500 border-amber-200' : ''
            }`}
          />
        ))}
      </div>

      {/* REALTIME SIZE TOOLTIP (FLOATING NEAR CURSOR ON RESIZE) */}
      {isResizing && tooltipPos && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x + 16}px`,
            top: `${tooltipPos.y + 16}px`,
          }}
          className="z-[9999] pointer-events-none px-2.5 py-1 rounded-lg bg-slate-900/90 text-amber-400 text-[11px] font-mono font-bold shadow-2xl border border-amber-500/40 backdrop-blur-md flex items-center gap-1.5"
        >
          <span>{formattedWidth}</span>
          <span className="text-slate-400">×</span>
          <span>{formattedHeight}</span>
        </div>
      )}
    </>
  );
});
