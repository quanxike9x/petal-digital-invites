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
  onChangeComponent,
  onDuplicateComponent,
  onDeleteComponent,
  onBringComponentToFront,
  onSendComponentToBack,
  onMoveComponentUp,
  onMoveComponentDown,
  onToggleComponentLock,
}) => {
  const isEditorMode = renderMode === 'editor';

  const {
    isDragging,
    dragType,
    draggedCompId,
    dropSectionId,
    dropIndex,
  } = useDragEngine();

  const isComponentDragging = isEditorMode && isDragging && dragType === 'component';

  const containerStyle: React.CSSProperties = useMemo(() => {
    return {
      position: 'relative',
      width: container.style?.width || '100%',
      minHeight: container.style?.height || '280px',
      padding: typeof container.style?.padding === 'number' ? `${container.style.padding}px` : container.style?.padding || '0px',
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
      <div
        className="flex-1 py-12 border-2 border-dashed border-amber-500/80 rounded-2xl flex flex-col items-center justify-center text-xs font-bold text-amber-500 bg-amber-500/10 m-2 animate-pulse transition-all"
      >
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
    <div style={containerStyle} className="w-full relative">
      {sortedComponents.map((comp, compIdx) => {
        const isCompSelected = isEditorMode && selectedComponentId === comp.id;
        const isBeingDragged = isComponentDragging && draggedCompId === comp.id;
        const isDropTargetHere = isComponentDragging && dropSectionId === sectionId && dropIndex === compIdx;

        const pos = getNormalizedComponentLayoutPosition(comp);
        const currentWidthVal = pos.width;
        const currentHeightVal = pos.height;
        const zIndexVal = comp.layout?.layer?.order ?? (compIdx + 1);
        const isHidden = comp.layout?.layer?.hidden ?? false;
        const isLocked = comp.layout?.layer?.locked ?? false;
        
        const liveX = typeof pos.x === 'number' ? pos.x : 0;
        const liveY = typeof pos.y === 'number' ? pos.y : 0;

        const wrapperStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${liveX}px`,
          top: `${liveY}px`,
          width: typeof currentWidthVal === 'number' ? `${currentWidthVal}px` : currentWidthVal,
          height: typeof currentHeightVal === 'number' ? `${currentHeightVal}px` : currentHeightVal,
          minWidth: typeof pos.minWidth === 'number' ? `${pos.minWidth}px` : pos.minWidth,
          minHeight: typeof pos.minHeight === 'number' ? `${pos.minHeight}px` : pos.minHeight,
          maxWidth: typeof pos.maxWidth === 'number' ? `${pos.maxWidth}px` : pos.maxWidth,
          maxHeight: typeof pos.maxHeight === 'number' ? `${pos.maxHeight}px` : pos.maxHeight,
          zIndex: zIndexVal,
          opacity: isHidden ? 0.3 : 1,
          pointerEvents: isLocked ? 'none' : 'auto',
          boxSizing: 'border-box',
          overflow: 'hidden',
        };

        return (
          <React.Fragment key={comp.id}>
            {isDropTargetHere && (
              <div className="absolute left-0 right-0 h-0.5 bg-amber-500 rounded-full shadow-md z-30 animate-pulse transition-all duration-200" />
            )}

            <div
              key={comp.id}
              data-component-id={comp.id}
              data-component-type={comp.type}
              style={wrapperStyle}
              onMouseDown={(e) => {
                if (!isEditorMode || isLocked) return;
                const target = e.target as HTMLElement;
                if (target.closest('[data-floating-toolbar="true"]')) return;
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent(comp);
              }}
              onClick={(e) => {
                if (!isEditorMode || isLocked) return;
                const target = e.target as HTMLElement;
                if (target.closest('[data-floating-toolbar="true"]')) return;
                e.stopPropagation();
                if (onSelectComponent) onSelectComponent(comp);
              }}
              className={`transition-all rounded-lg ${
                !isEditorMode
                  ? ''
                  : isBeingDragged
                  ? 'opacity-50 scale-[0.98] cursor-grabbing shadow-xl ring-2 ring-amber-400'
                  : isCompSelected
                  ? 'z-[1000] cursor-grab ring-2 ring-amber-500'
                  : 'hover:ring-1 hover:ring-blue-300/60 cursor-grab'
              }`}
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

              <div className="w-full h-full">
                <ComponentRenderer component={comp} />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
});