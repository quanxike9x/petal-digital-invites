import React, { useMemo } from 'react';
import type { ContainerInstance } from '../schema/TemplateSchema';
import { getNormalizedComponentLayoutPosition } from '../schema/TemplateSchema';
import type { UnifiedComponentInstance } from '../registry/ComponentRegistry';
import { ComponentRenderer } from './ComponentRenderer';
import { Plus } from 'lucide-react';
import { useDragEngine } from '../context/DragContext';
import { FloatingComponentToolbar } from '../components/editor/FloatingComponentToolbar';

interface ContainerRendererProps {
  container: ContainerInstance;
  sectionId: string;
  selectedComponentId?: string | null;
  renderMode?: 'editor' | 'preview' | 'published';
  onSelectComponent?: (comp: UnifiedComponentInstance) => void;
  onChangeComponent?: (updatedComp: UnifiedComponentInstance) => void;
  onDuplicateComponent?: (comp: UnifiedComponentInstance) => void;
  onDeleteComponent?: (compId: string) => void;
  onBringComponentToFront?: (compId: string) => void;
  onSendComponentToBack?: (compId: string) => void;
  onMoveComponentUp?: (compId: string) => void;
  onMoveComponentDown?: (compId: string) => void;
  onToggleComponentLock?: (compId: string) => void;
}

export const ContainerRenderer: React.FC<ContainerRendererProps> = React.memo(({
  container,
  sectionId,
  selectedComponentId,
  renderMode = 'editor',
  onSelectComponent,
  onDuplicateComponent,
  onDeleteComponent,
  onBringComponentToFront,
  onSendComponentToBack,
  onMoveComponentUp,
  onMoveComponentDown,
  onToggleComponentLock,
}) => {
  const isEditorMode = renderMode === 'editor';

  const { isDragging, dragType } = useDragEngine();
  const isComponentDragging = isEditorMode && isDragging && dragType === 'component';

  const containerStyle: React.CSSProperties = useMemo(() => {
    return {
      position: 'relative',
      width: container.style?.width || '100%',
      minHeight: container.style?.height || '280px',
      padding:
        typeof container.style?.padding === 'number'
          ? `${container.style.padding}px`
          : container.style?.padding || '0px',
      backgroundColor: container.style?.backgroundColor || 'transparent',
    };
  }, [container.style]);

  const sortedComponents = useMemo(() => {
    if (container.type === 'stack') {
      return [...container.components].sort((a, b) => {
        const orderA = a.layout?.layer?.order ?? 1;
        const orderB = b.layout?.layer?.order ?? 1;
        return orderA - orderB;
      });
    }
    return container.components;
  }, [container.type, container.components]);

  if (container.components.length === 0) {
    if (!isEditorMode) return null;
    return isComponentDragging ? (
      <div className="flex-1 py-12 border-2 border-dashed border-amber-500/80 rounded-2xl flex flex-col items-center justify-center text-xs font-bold text-amber-500 bg-amber-500/10 m-2 animate-pulse transition-all">
        <span>── Drop Component Here ──</span>
      </div>
    ) : (
      <div className="flex-1 py-12 border-2 border-dashed border-slate-300/60 rounded-xl flex flex-col items-center justify-center text-[11px] text-slate-400 font-mono bg-slate-50/30 m-2">
        <Plus className="w-5 h-5 text-slate-400 mb-1" />
        <span>Empty Container</span>
      </div>
    );
  }

  return (
    <div style={containerStyle} className="w-full relative" data-container-id={container.id} data-section-id={sectionId}>
      {sortedComponents.map((comp, compIdx) => {
        const isCompSelected = isEditorMode && selectedComponentId === comp.id;

        const pos = getNormalizedComponentLayoutPosition(comp);
        const zIndexVal = comp.layout?.layer?.order ?? compIdx + 1;
        const isHidden = comp.layout?.layer?.hidden ?? false;
        const isLocked = comp.layout?.layer?.locked ?? false;

        const liveX = typeof pos.x === 'number' ? pos.x : parseFloat(String(pos.x)) || 0;
        const liveY = typeof pos.y === 'number' ? pos.y : parseFloat(String(pos.y)) || 0;
        const liveRotation = typeof pos.rotation === 'number' ? pos.rotation : 0;

        const wrapperStyle: React.CSSProperties = {
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(${liveX}px, ${liveY}px) rotate(${liveRotation}deg)`,
          transformOrigin: 'center center',
          width: typeof pos.width === 'number' ? `${pos.width}px` : pos.width,
          height: typeof pos.height === 'number' ? `${pos.height}px` : pos.height,
          minWidth: typeof pos.minWidth === 'number' ? `${pos.minWidth}px` : pos.minWidth,
          minHeight: typeof pos.minHeight === 'number' ? `${pos.minHeight}px` : pos.minHeight,
          maxWidth: typeof pos.maxWidth === 'number' ? `${pos.maxWidth}px` : pos.maxWidth,
          maxHeight: typeof pos.maxHeight === 'number' ? `${pos.maxHeight}px` : pos.maxHeight,
          zIndex: isCompSelected ? 1000 : zIndexVal,
          opacity: isHidden ? 0.3 : 1,
          // ✅ FIX: Luôn cho phép click để chọn component, kể cả khi locked
          pointerEvents: 'auto',
          boxSizing: 'border-box',
          // 🔒 Thêm cursor để người dùng biết locked
          cursor: isLocked ? 'default' : (isCompSelected ? 'move' : 'pointer'),
        };

        return (
          <div
            key={comp.id}
            data-component-id={comp.id}
            data-component-type={comp.type}
            data-locked={isLocked ? 'true' : 'false'}
            style={wrapperStyle}
            onMouseDown={(e) => {
              if (!isEditorMode) return;
              const target = e.target as HTMLElement;
              if (target.closest('[data-floating-toolbar="true"]')) return;
              e.stopPropagation();
              // ✅ FIX: Luôn cho phép chọn, kể cả khi locked
              if (onSelectComponent && selectedComponentId !== comp.id) {
                onSelectComponent(comp);
              }
            }}
            className={`rounded-lg ${
              !isEditorMode
                ? ''
                : isCompSelected
                ? 'ring-2 ring-amber-500'
                : 'hover:ring-1 hover:ring-blue-300/60 cursor-pointer'
            } ${isLocked ? 'ring-1 ring-red-400/30' : ''}`}
          >
            {isEditorMode && isCompSelected && (
              <FloatingComponentToolbar
                selectedComponent={comp}
                onDuplicate={(c) => onDuplicateComponent && onDuplicateComponent(c)}
                onDelete={(id) => onDeleteComponent && onDeleteComponent(id)}
                onBringToFront={() => onBringComponentToFront && onBringComponentToFront(comp.id)}
                onSendToBack={() => onSendComponentToBack && onSendComponentToBack(comp.id)}
                onMoveUp={() => onMoveComponentUp && onMoveComponentUp(comp.id)}
                onMoveDown={() => onMoveComponentDown && onMoveComponentDown(comp.id)}
                onToggleLock={() => onToggleComponentLock && onToggleComponentLock(comp.id)}
              />
            )}

            <div className="w-full h-full overflow-hidden">
              <ComponentRenderer component={comp} />
            </div>
          </div>
        );
      })}
    </div>
  );
});

ContainerRenderer.displayName = 'ContainerRenderer';