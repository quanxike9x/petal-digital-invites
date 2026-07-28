import React, { useEffect, useRef, useState } from 'react';
import type { TemplateLayoutSchema, TemplateSection, SectionType } from '../schema/TemplateSchema';
import { getPageSections, getSectionContainers, getSectionComponents } from '../schema/TemplateSchema';
import type { UnifiedComponentInstance } from '../registry/ComponentRegistry';
import { ContainerRenderer } from './ContainerRenderer';
import { Plus } from 'lucide-react';
import { AssetRepository } from '../repositories/AssetRepository';
import { useDragEngine } from '../context/DragContext';
import InfiniteViewer from 'react-infinite-viewer';
import Moveable from 'react-moveable';
import Selecto from 'react-selecto';

export type RenderMode = 'editor' | 'preview' | 'published';

interface CanvasRendererProps {
  layoutJson: TemplateLayoutSchema;
  selectedComponentId?: string | null;
  selectedSectionId?: string | null;
  renderMode?: RenderMode;
  onSelectComponent?: (comp: UnifiedComponentInstance) => void;
  onSelectSection?: (section: TemplateSection) => void;
  onAddSection?: (type: SectionType) => void;
  onResizeSectionHeight?: (sectionId: string, newMinHeight: number) => void;
  onDuplicateComponent?: (comp: UnifiedComponentInstance) => void;
  onDeleteComponent?: (compId: string) => void;
  onBringComponentToFront?: (compId: string) => void;
  onSendComponentToBack?: (compId: string) => void;
  onMoveComponentUp?: (compId: string) => void;
  onMoveComponentDown?: (compId: string) => void;
  onToggleComponentLock?: (compId: string) => void;
  onChangeComponent?: (updatedComp: UnifiedComponentInstance) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  layoutJson,
  selectedComponentId,
  selectedSectionId,
  renderMode = 'editor',
  onSelectComponent,
  onSelectSection,
  onAddSection,
  onResizeSectionHeight,
  onDuplicateComponent,
  onDeleteComponent,
  onBringComponentToFront,
  onSendComponentToBack,
  onMoveComponentUp,
  onMoveComponentDown,
  onToggleComponentLock,
  onChangeComponent,
}) => {
  const isEditorMode = renderMode === 'editor';
  const currentPage = layoutJson.pages?.[0];
  const sections = getPageSections(currentPage);

  const { 
    isDragging, 
    dragType,
    draggedSectionId,
    dropSectionId, 
    dropSectionTargetIndex,
    updateDropTarget,
    updateSectionDropTargetWithMidpoint,
    endDrag,
    cancelDrag,
    handleAutoScroll 
  } = useDragEngine();

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<InfiniteViewer>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1400, height: 1800 });
  const [moveableTarget, setMoveableTarget] = useState<HTMLElement | null>(null);

  const isResizingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const resizingSectionIdRef = useRef<string | null>(null);

  const [hoveredBottomSecId, setHoveredBottomSecId] = useState<string | null>(null);

  const handleMouseMoveOnSection = (e: React.MouseEvent, section: TemplateSection) => {
    if (!isEditorMode || isResizingRef.current || isDragging) return;
    const targetRect = e.currentTarget.getBoundingClientRect();
    const offsetYFromBottom = targetRect.bottom - e.clientY;

    if (offsetYFromBottom <= 8) {
      setHoveredBottomSecId(section.id);
    } else {
      if (hoveredBottomSecId === section.id) {
        setHoveredBottomSecId(null);
      }
    }
  };

  const handleMouseDownOnSection = (e: React.MouseEvent, section: TemplateSection) => {
    if (!isEditorMode || isDragging) return;

    const targetRect = e.currentTarget.getBoundingClientRect();
    const clickOffsetYFromBottom = targetRect.bottom - e.clientY;

    if (clickOffsetYFromBottom <= 8) {
      e.stopPropagation();
      e.preventDefault();

      isResizingRef.current = true;
      startYRef.current = e.clientY;
      resizingSectionIdRef.current = section.id;
      document.body.style.cursor = 'ns-resize';

      const currentMinHeight = typeof section.style?.minHeight === 'number'
        ? section.style.minHeight
        : parseInt(String(section.style?.minHeight || 800), 10) || 800;
      startHeightRef.current = currentMinHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizingRef.current || !resizingSectionIdRef.current) return;
        const deltaY = moveEvent.clientY - startYRef.current;
        const newHeight = Math.max(120, startHeightRef.current + deltaY);
        if (onResizeSectionHeight) {
          onResizeSectionHeight(resizingSectionIdRef.current, newHeight);
        }
      };

      const handleMouseUp = () => {
        isResizingRef.current = false;
        resizingSectionIdRef.current = null;
        setHoveredBottomSecId(null);
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      e.stopPropagation();
      if (onSelectSection) onSelectSection(section);
    }
  };

  const isSectionDragging = isEditorMode && isDragging && dragType === 'section';
  const isComponentDragging = isEditorMode && isDragging && dragType === 'component';

  useEffect(() => {
    const updateSize = () => {
      if (canvasContainerRef.current) {
        setViewportSize({ width: canvasContainerRef.current.clientWidth || 1400, height: 2200 });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!isEditorMode || !canvasContainerRef.current || !selectedComponentId) {
      setMoveableTarget(null);
      return;
    }

    const target = canvasContainerRef.current.querySelector(`[data-component-id="${selectedComponentId}"]`) as HTMLElement | null;
    setMoveableTarget(target);
  }, [isEditorMode, selectedComponentId, layoutJson]);

  const getComponentById = (id: string): UnifiedComponentInstance | null => {
    for (const section of sections) {
      const comps = getSectionComponents(section);
      const found = comps.find(c => c.id === id);
      if (found) return found;
    }
    return null;
  };

  return (
    <div
      ref={canvasContainerRef}
      onDragOver={(e) => {
        if (isDragging) {
          e.preventDefault();
          handleAutoScroll(e.clientY, canvasContainerRef.current);
        }
      }}
      onDrop={(e) => {
        if (isDragging) {
          e.preventDefault();
          cancelDrag();
        }
      }}
      className="w-full h-full min-h-screen bg-slate-100 flex flex-col flex-nowrap overflow-hidden font-sans relative select-none"
    >
      <InfiniteViewer
        ref={viewportRef}
        className="w-full h-full"
        useResizeObserver={true}
        usePinch={true}
        zoom={1}
        maxScale={3}
        minScale={0.5}
        threshold={0}
        onScroll={() => {}}
      >
        <div style={{ width: viewportSize.width, height: viewportSize.height, position: 'relative', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          {sections.map((section, sIdx) => {
            const isSectionSelected = isEditorMode && selectedSectionId === section.id && !selectedComponentId;
            const isBottomHovered = isEditorMode && (hoveredBottomSecId === section.id || (isResizingRef.current && resizingSectionIdRef.current === section.id));
            const isSectionCompDropTarget = isComponentDragging && dropSectionId === section.id;

            const isBeingSectionDragged = isSectionDragging && draggedSectionId === section.id;
            const isSectionDropIndicatorHere = isSectionDragging && dropSectionTargetIndex === sIdx;

            const rawBg = section.style?.backgroundImage;
            const resolvedBgUrl = rawBg ? AssetRepository.resolveUrl(rawBg) : '';

            const containers = getSectionContainers(section);
            const allSectionComps = getSectionComponents(section);

            const sectionStyle: React.CSSProperties = {
              padding: typeof section.style?.padding === 'number' ? `${section.style.padding}px` : section.style?.padding || '16px',
              margin: typeof section.style?.margin === 'number' ? `${section.style.margin}px` : section.style?.margin || '0px',
              backgroundColor: section.style?.backgroundColor || '#ffffff',
              backgroundImage: resolvedBgUrl ? `url(${resolvedBgUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: section.style?.borderRadius ? `${section.style.borderRadius}px` : '0px',
              width: '100%',
              maxWidth: '1200px',
              minHeight: section.style?.minHeight ? (typeof section.style.minHeight === 'number' ? `${section.style.minHeight}px` : section.style.minHeight) : '800px',
              height: section.style?.height ? (typeof section.style.height === 'number' ? `${section.style.height}px` : section.style.height) : undefined,
              cursor: isBottomHovered ? 'ns-resize' : 'default',
            };

            return (
              <React.Fragment key={section.id}>
                {isSectionDropIndicatorHere && (
                  <div className="w-full h-1 bg-amber-500 rounded-full shadow-xl z-30 animate-pulse my-2 transition-all duration-200" />
                )}

                <section
                  data-section-id={section.id}
                  onMouseMove={(e) => handleMouseMoveOnSection(e, section)}
                  onMouseDown={(e) => handleMouseDownOnSection(e, section)}
                  onDragOver={(e) => {
                    if (isSectionDragging) {
                      e.preventDefault();
                      e.stopPropagation();
                      updateSectionDropTargetWithMidpoint(section.id, e.clientY, e.currentTarget, sIdx, sections.length);
                    } else if (isComponentDragging) {
                      e.preventDefault();
                      e.stopPropagation();
                      if (allSectionComps.length === 0) {
                        updateDropTarget(section.id, 0);
                      }
                    }
                  }}
                  onDrop={(e) => {
                    if (isDragging) {
                      e.preventDefault();
                      e.stopPropagation();
                      endDrag();
                    }
                  }}
                  style={sectionStyle}
                  className={`w-full shrink-0 relative flex flex-col justify-between transition-all duration-200 mx-auto ${
                    !isEditorMode
                      ? ''
                      : isBeingSectionDragged
                      ? 'opacity-50 scale-[0.98] ring-2 ring-amber-500 z-30 shadow-2xl'
                      : isSectionCompDropTarget
                      ? 'ring-2 ring-amber-500 bg-amber-500/5 z-20 border-b border-dashed border-amber-400'
                      : isSectionSelected
                      ? 'ring-2 ring-amber-500 z-10 shadow-lg border-b border-dashed border-slate-300'
                      : isBottomHovered
                      ? 'border-b-2 border-amber-400 z-20'
                      : 'border-b border-dashed border-slate-300'
                  }`}
                >
                  <div className="space-y-4 flex-1 relative w-full">
                    {containers.map((container) => (
                      <ContainerRenderer
                        key={container.id}
                        container={container}
                        sectionId={section.id}
                        selectedComponentId={selectedComponentId}
                        renderMode={renderMode}
                        onSelectComponent={onSelectComponent}
                        onDuplicateComponent={onDuplicateComponent}
                        onDeleteComponent={onDeleteComponent}
                        onBringComponentToFront={onBringComponentToFront}
                        onSendComponentToBack={onSendComponentToBack}
                        onMoveComponentUp={onMoveComponentUp}
                        onMoveComponentDown={onMoveComponentDown}
                        onToggleComponentLock={onToggleComponentLock}
                        onChangeComponent={onChangeComponent}
                      />
                    ))}
                  </div>
                </section>
              </React.Fragment>
            );
          })}
        </div>
      </InfiniteViewer>

      <Selecto
        container={canvasContainerRef.current}
        selectableTargets={['[data-component-id]']}
        selectByClick={true}
        selectFromInside={true}
        hitRate={0}
        onSelect={(e) => {
          e.added.forEach((el) => el.classList.add('selected'));
          e.removed.forEach((el) => el.classList.remove('selected'));
          const selectedIds = e.selected.map((el) => el.getAttribute('data-component-id')).filter(Boolean) as string[];
          const targetComp = sections.flatMap((section) => getSectionComponents(section)).find((comp) => comp.id === selectedIds[0]);
          if (targetComp && onSelectComponent) onSelectComponent(targetComp);
        }}
      />

      <Moveable
        target={moveableTarget ? [moveableTarget] : []}
        draggable={isEditorMode}
        resizable={isEditorMode}
        rotatable={false}
        keepRatio={false}
        snappable={true}
        snapCenter={true}
        snapGap={true}
        bounds={{ left: 0, top: 0, right: viewportSize.width, bottom: viewportSize.height }}
        onDragStart={({ target, set }) => {
          const componentId = target.getAttribute('data-component-id');
          if (!componentId) return;
          
          const component = getComponentById(componentId);
          if (!component) return;
          
          set(['left', 'top'], {
            left: component.layout?.position?.x || 0,
            top: component.layout?.position?.y || 0,
          });
        }}
        onDrag={({ target, left, top, beforeDelta }) => {
          const componentId = target.getAttribute('data-component-id');
          if (!componentId || !onChangeComponent) return;

          const component = getComponentById(componentId);
          if (!component) return;

          const updatedComponent: UnifiedComponentInstance = {
            ...component,
            layout: {
              ...component.layout,
              position: {
                ...component.layout?.position,
                x: Math.round(left),
                y: Math.round(top),
                width: component.layout?.position?.width || 'auto',
                height: component.layout?.position?.height || 'auto',
              },
            },
          };

          onChangeComponent(updatedComponent);
        }}
        onDragEnd={({ target, left, top }) => {
          const componentId = target.getAttribute('data-component-id');
          if (!componentId) return;

          const component = getComponentById(componentId);
          if (!component || !onSelectComponent) return;

          onSelectComponent(component);
        }}
        onResizeStart={({ target, set }) => {
          const componentId = target.getAttribute('data-component-id');
          if (!componentId) return;
          
          const component = getComponentById(componentId);
          if (!component) return;
          
          const width = component.layout?.position?.width || 200;
          const height = component.layout?.position?.height || 200;
          
          set(['width', 'height'], {
            width: typeof width === 'number' ? width : parseInt(width) || 200,
            height: typeof height === 'number' ? height : parseInt(height) || 200,
          });
        }}
        onResize={({ target, width, height, direction }) => {
          const componentId = target.getAttribute('data-component-id');
          if (!componentId || !onChangeComponent) return;

          const component = getComponentById(componentId);
          if (!component) return;

          const updatedComponent: UnifiedComponentInstance = {
            ...component,
            layout: {
              ...component.layout,
              position: {
                ...component.layout?.position,
                x: component.layout?.position?.x || 0,
                y: component.layout?.position?.y || 0,
                width: Math.round(width),
                height: Math.round(height),
              },
            },
          };

          onChangeComponent(updatedComponent);
        }}
        onResizeEnd={({ target }) => {
          const componentId = target.getAttribute('data-component-id');
          if (!componentId) return;

          const component = getComponentById(componentId);
          if (!component || !onSelectComponent) return;

          onSelectComponent(component);
        }}
      />

      {isSectionDragging && dropSectionTargetIndex === sections.length && (
        <div className="w-full h-1 bg-amber-500 rounded-full shadow-xl z-30 animate-pulse my-2 transition-all duration-200 shrink-0" />
      )}

      {isEditorMode && onAddSection && (
        <div className="p-6 flex justify-center bg-slate-200/50 border-t border-slate-300/60 shrink-0">
          <button
            onClick={() => onAddSection('Custom')}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-lg transition-all border border-slate-700 cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Section</span>
          </button>
        </div>
      )}
    </div>
  );
};