import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TemplateLayoutSchema, TemplateSection, SectionType } from '../schema/TemplateSchema';
import { getPageSections, getSectionContainers, getSectionComponents } from '../schema/TemplateSchema';
import type { UnifiedComponentInstance } from '../registry/ComponentRegistry';
import { ContainerRenderer } from './ContainerRenderer';
import { Plus } from 'lucide-react';
import { AssetRepository } from '../repositories/AssetRepository';
import { useDragEngine } from '../context/DragContext';
import InfiniteViewer from 'react-infinite-viewer';
import Moveable from 'react-moveable';

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
  // 📍 THÊM PROP MỚI
  onCanvasClick?: (x: number, y: number) => void;
}

/**
 * CANVAS RENDERER 2.0 — DRAG / RESIZE / ROTATE / SMART GUIDES
 */
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
  onCanvasClick, // 📍 Nhận prop mới
}) => {
  const isEditorMode = renderMode === 'editor';
  const currentPage = layoutJson.pages?.[0];
  const sections = getPageSections(currentPage);

  const {
    isDragging,
    dragType,
    draggedSectionId,
    dropSectionTargetIndex,
    updateSectionDropTargetWithMidpoint,
    endDrag,
    cancelDrag,
    handleAutoScroll,
  } = useDragEngine();

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<InfiniteViewer>(null);
  const moveableRef = useRef<Moveable>(null);
  const [zoom, setZoom] = useState(1);
  const [viewportSize, setViewportSize] = useState({ width: 1400, height: 2200 });
  const [moveableTarget, setMoveableTarget] = useState<HTMLElement | null>(null);
  // 📍 State để hiển thị dấu chấm vị trí click
  const [clickMarker, setClickMarker] = useState<{ x: number; y: number } | null>(null);

  const isResizingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const resizingSectionIdRef = useRef<string | null>(null);
  const [hoveredBottomSecId, setHoveredBottomSecId] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /* SECTION RESIZE                                                      */
  /* ------------------------------------------------------------------ */
  const handleMouseMoveOnSection = (e: React.MouseEvent, section: TemplateSection) => {
    if (!isEditorMode || isResizingRef.current || isDragging) return;
    const targetRect = e.currentTarget.getBoundingClientRect();
    const offsetYFromBottom = targetRect.bottom - e.clientY;
    if (offsetYFromBottom <= 8) setHoveredBottomSecId(section.id);
    else if (hoveredBottomSecId === section.id) setHoveredBottomSecId(null);
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

      const currentMinHeight =
        typeof section.style?.minHeight === 'number'
          ? section.style.minHeight
          : parseInt(String(section.style?.minHeight || 800), 10) || 800;
      startHeightRef.current = currentMinHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizingRef.current || !resizingSectionIdRef.current) return;
        const deltaY = (moveEvent.clientY - startYRef.current) / (zoom || 1);
        const newHeight = Math.max(120, startHeightRef.current + deltaY);
        onResizeSectionHeight?.(resizingSectionIdRef.current, Math.round(newHeight));
      };

      const handleMouseUp = () => {
        isResizingRef.current = false;
        resizingSectionIdRef.current = null;
        setHoveredBottomSecId(null);
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        moveableRef.current?.updateRect();
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      e.stopPropagation();
      onSelectSection?.(section);
    }
  };

  const isSectionDragging = isEditorMode && isDragging && dragType === 'section';

  /* ------------------------------------------------------------------ */
  /* VIEWPORT                                                            */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /* MOVEABLE TARGET                                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!isEditorMode || !canvasContainerRef.current || !selectedComponentId) {
      setMoveableTarget(null);
      return;
    }
    const el = canvasContainerRef.current.querySelector(
      `[data-component-id="${selectedComponentId}"]`,
    ) as HTMLElement | null;
    if (el?.getAttribute('data-locked') === 'true') {
      setMoveableTarget(null);
      return;
    }
    setMoveableTarget(el);
  }, [isEditorMode, selectedComponentId, layoutJson]);

  useEffect(() => {
    moveableRef.current?.updateRect();
  }, [moveableTarget, layoutJson, zoom]);

  const getComponentById = useCallback(
    (id: string): UnifiedComponentInstance | null => {
      for (const section of sections) {
        const found = getSectionComponents(section).find((c) => c.id === id);
        if (found) return found;
      }
      return null;
    },
    [sections],
  );

  /* ------------------------------------------------------------------ */
  /* SMART GUIDES                                                        */
  /* ------------------------------------------------------------------ */
  const elementGuidelines = useMemo(() => {
    if (!isEditorMode || !canvasContainerRef.current || !selectedComponentId) return [];
    return Array.from(
      canvasContainerRef.current.querySelectorAll<HTMLElement>('[data-component-id]'),
    ).filter((el) => el.getAttribute('data-component-id') !== selectedComponentId);
  }, [isEditorMode, selectedComponentId, layoutJson]);

  /* ------------------------------------------------------------------ */
  /* COMMIT HELPERS                                                      */
  /* ------------------------------------------------------------------ */
  const commitLayout = useCallback(
    (
      componentId: string,
      patch: { x?: number; y?: number; width?: number; height?: number; rotation?: number },
    ) => {
      const component = getComponentById(componentId);
      if (!component || !onChangeComponent) return;

      const prev = component.layout?.position || {};
      const updated: UnifiedComponentInstance = {
        ...component,
        layout: {
          ...component.layout,
          position: {
            ...prev,
            x: patch.x !== undefined ? Math.round(patch.x) : prev.x ?? 0,
            y: patch.y !== undefined ? Math.round(patch.y) : prev.y ?? 0,
            width: patch.width !== undefined ? Math.round(patch.width) : prev.width,
            height: patch.height !== undefined ? Math.round(patch.height) : prev.height,
            rotation:
              patch.rotation !== undefined
                ? Math.round(patch.rotation * 100) / 100
                : prev.rotation ?? 0,
          },
        },
      };
      onChangeComponent(updated);
    },
    [getComponentById, onChangeComponent],
  );

  const getRotationOf = (target: HTMLElement | SVGElement) => {
    const id = target.getAttribute('data-component-id');
    const comp = id ? getComponentById(id) : null;
    return comp?.layout?.position?.rotation ?? 0;
  };

  // 📍 XỬ LÝ CLICK TRÊN CANVAS (background)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditorMode || !onCanvasClick) return;
    
    // Chỉ xử lý khi click trực tiếp vào background, không phải vào component hay section
    const target = e.target as HTMLElement;
    if (target.closest('[data-component-id]') || target.closest('section')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    // Tính toán vị trí tương đối so với canvas (có tính đến zoom)
    const x = (e.clientX - rect.left) / (zoom || 1);
    const y = (e.clientY - rect.top) / (zoom || 1);
    
    setClickMarker({ x, y });
    onCanvasClick(x, y);
    
    // Tự động ẩn marker sau 3 giây
    setTimeout(() => setClickMarker(null), 3000);
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
        maxScale={3}
        minScale={0.3}
        threshold={0}
        onScroll={() => moveableRef.current?.updateRect()}
        onPinch={(e) => {
          setZoom(e.zoom);
          moveableRef.current?.updateRect();
        }}
      >
        {/* 📍 Thêm onClick vào canvas-page-root */}
        <div
          className="canvas-page-root"
          style={{
            width: viewportSize.width,
            height: viewportSize.height,
            position: 'relative',
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
          onClick={handleCanvasClick}
        >
          {sections.map((section, sIdx) => {
            const isSectionSelected =
              isEditorMode && selectedSectionId === section.id && !selectedComponentId;
            const isBottomHovered =
              isEditorMode &&
              (hoveredBottomSecId === section.id ||
                (isResizingRef.current && resizingSectionIdRef.current === section.id));

            const isBeingSectionDragged = isSectionDragging && draggedSectionId === section.id;
            const isSectionDropIndicatorHere = isSectionDragging && dropSectionTargetIndex === sIdx;

            const rawBg = section.style?.backgroundImage;
            const resolvedBgUrl = rawBg ? AssetRepository.resolveUrl(rawBg) : '';
            const containers = getSectionContainers(section);

            const sectionStyle: React.CSSProperties = {
              padding:
                typeof section.style?.padding === 'number'
                  ? `${section.style.padding}px`
                  : section.style?.padding || '16px',
              margin:
                typeof section.style?.margin === 'number'
                  ? `${section.style.margin}px`
                  : section.style?.margin || '0px',
              backgroundColor: section.style?.backgroundColor || '#ffffff',
              backgroundImage: resolvedBgUrl ? `url(${resolvedBgUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: section.style?.borderRadius ? `${section.style.borderRadius}px` : '0px',
              width: '100%',
              maxWidth: '1200px',
              minHeight: section.style?.minHeight
                ? typeof section.style.minHeight === 'number'
                  ? `${section.style.minHeight}px`
                  : section.style.minHeight
                : '800px',
              height: section.style?.height
                ? typeof section.style.height === 'number'
                  ? `${section.style.height}px`
                  : section.style.height
                : undefined,
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
                      updateSectionDropTargetWithMidpoint(
                        section.id,
                        e.clientY,
                        e.currentTarget,
                        sIdx,
                        sections.length,
                      );
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
                  className={`w-full shrink-0 relative flex flex-col justify-between transition-[box-shadow,border-color] duration-200 mx-auto ${
                    !isEditorMode
                      ? ''
                      : isBeingSectionDragged
                      ? 'opacity-50 ring-2 ring-amber-500 z-30 shadow-2xl'
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

          {/* 📍 MARKER HIỂN THỊ VỊ TRÍ ĐÃ CLICK */}
          {clickMarker && isEditorMode && (
            <div
              className="absolute pointer-events-none z-50 transition-all duration-200"
              style={{
                left: clickMarker.x,
                top: clickMarker.y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                {/* Vòng tròn pulse */}
                <div className="w-6 h-6 rounded-full border-2 border-amber-500 animate-ping opacity-75" />
                {/* Chấm tròn ở giữa */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                </div>
                {/* Crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                  <div className="absolute top-1/2 left-0 w-full h-px bg-amber-400/50" />
                  <div className="absolute top-0 left-1/2 w-px h-full bg-amber-400/50" />
                </div>
                {/* Label */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-amber-500 whitespace-nowrap bg-slate-900/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                  ({Math.round(clickMarker.x)}, {Math.round(clickMarker.y)})
                </div>
              </div>
            </div>
          )}
        </div>
      </InfiniteViewer>

      {isEditorMode && (
        <Moveable
          ref={moveableRef}
          target={moveableTarget}
          zoom={1}
          origin={false}
          draggable={true}
          throttleDrag={0}
          resizable={true}
          throttleResize={0}
          keepRatio={false}
          renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
          rotatable={true}
          throttleRotate={0}
          rotationPosition="top"
          snappable={true}
          snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
          elementSnapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
          elementGuidelines={elementGuidelines}
          snapThreshold={6}
          snapGridWidth={0}
          isDisplaySnapDigit={true}
          isDisplayInnerSnapDigit={true}
          snapGap={true}
          snapContainer={'.canvas-page-root'}
          onDrag={({ target, transform }) => {
            target.style.transform = transform;
          }}
          onDragEnd={({ target, isDrag, lastEvent }) => {
            if (!isDrag || !lastEvent) return;
            const id = target.getAttribute('data-component-id');
            if (!id) return;
            const [x, y] = lastEvent.beforeTranslate as [number, number];
            commitLayout(id, { x, y, rotation: getRotationOf(target) });
          }}
          onResize={({ target, width, height, drag }) => {
            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
            target.style.transform = drag.transform;
          }}
          onResizeEnd={({ target, isDrag, lastEvent }) => {
            if (!isDrag || !lastEvent) return;
            const id = target.getAttribute('data-component-id');
            if (!id) return;
            const [x, y] = lastEvent.drag.beforeTranslate as [number, number];
            commitLayout(id, {
              x,
              y,
              width: lastEvent.width,
              height: lastEvent.height,
              rotation: getRotationOf(target),
            });
          }}
          onRotate={({ target, transform }) => {
            target.style.transform = transform;
          }}
          onRotateEnd={({ target, isDrag, lastEvent }) => {
            if (!isDrag || !lastEvent) return;
            const id = target.getAttribute('data-component-id');
            if (!id) return;
            const [x, y] = (lastEvent.drag?.beforeTranslate ?? [
              undefined,
              undefined,
            ]) as [number, number];
            commitLayout(id, {
              x,
              y,
              rotation: lastEvent.rotation,
            });
          }}
        />
      )}

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