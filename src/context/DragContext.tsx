import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export interface ComponentDropResult {
  type: 'component';
  compId: string;
  sourceSectionId: string;
  targetSectionId: string;
  targetIndex: number;
}

export interface SectionDropResult {
  type: 'section';
  sectionId: string;
  targetIndex: number;
}

export type DropResult = ComponentDropResult | SectionDropResult;

interface DragContextType {
  isDragging: boolean;
  dragType: 'component' | 'section' | null;
  draggedCompId: string | null;
  draggedSectionId: string | null;
  dropSectionId: string | null;
  dropIndex: number | null;
  dropSectionTargetIndex: number | null;
  startDrag: (compId: string, sectionId: string) => void;
  updateDropTarget: (sectionId: string, index: number) => void;
  updateDropTargetWithMidpoint: (sectionId: string, compId: string, clientY: number, element: HTMLElement, index: number, totalComponents: number) => void;
  startSectionDrag: (sectionId: string) => void;
  updateSectionDropTarget: (targetIndex: number) => void;
  updateSectionDropTargetWithMidpoint: (sectionId: string, clientY: number, element: HTMLElement, index: number, totalSections: number) => void;
  endDrag: () => DropResult | null;
  cancelDrag: () => void;
  handleAutoScroll: (clientY: number, containerEl: HTMLDivElement | null) => void;
}

const DragContext = createContext<DragContextType>({
  isDragging: false,
  dragType: null,
  draggedCompId: null,
  draggedSectionId: null,
  dropSectionId: null,
  dropIndex: null,
  dropSectionTargetIndex: null,
  startDrag: () => {},
  updateDropTarget: () => {},
  updateDropTargetWithMidpoint: () => {},
  startSectionDrag: () => {},
  updateSectionDropTarget: () => {},
  updateSectionDropTargetWithMidpoint: () => {},
  endDrag: () => null,
  cancelDrag: () => {},
  handleAutoScroll: () => {},
});

interface DragProviderProps {
  children: React.ReactNode;
  onDropComplete?: (result: DropResult) => void;
}

/**
 * UNIFIED DRAG ENGINE 3.0 (INDEPENDENT COMPONENT & SECTION DRAG ENGINE)
 */
export const DragProvider: React.FC<DragProviderProps> = ({ children, onDropComplete }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragType, setDragType] = useState<'component' | 'section' | null>(null);

  // Component Drag States
  const [draggedCompId, setDraggedCompId] = useState<string | null>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dropSectionId, setDropSectionId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Section Drag States
  const [dropSectionTargetIndex, setDropSectionTargetIndex] = useState<number | null>(null);

  const autoScrollFrameRef = useRef<number | null>(null);

  // 1. COMPONENT DRAG METHODS
  const startDrag = useCallback((compId: string, sectionId: string) => {
    setIsDragging(true);
    setDragType('component');
    setDraggedCompId(compId);
    setDraggedSectionId(sectionId);
    setDropSectionId(sectionId);
  }, []);

  const updateDropTarget = useCallback((sectionId: string, index: number) => {
    setDropSectionId(sectionId);
    setDropIndex(index);
  }, []);

  const updateDropTargetWithMidpoint = useCallback((
    sectionId: string,
    compId: string,
    clientY: number,
    element: HTMLElement,
    index: number,
    totalComponents: number
  ) => {
    setDropSectionId(sectionId);
    const rect = element.getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;
    if (clientY < midPoint) {
      setDropIndex(index);
    } else {
      setDropIndex(Math.min(index + 1, totalComponents));
    }
  }, []);

  // 2. SECTION DRAG METHODS
  const startSectionDrag = useCallback((sectionId: string) => {
    setIsDragging(true);
    setDragType('section');
    setDraggedSectionId(sectionId);
  }, []);

  const updateSectionDropTarget = useCallback((targetIndex: number) => {
    setDropSectionTargetIndex(targetIndex);
  }, []);

  const updateSectionDropTargetWithMidpoint = useCallback((
    sectionId: string,
    clientY: number,
    element: HTMLElement,
    index: number,
    totalSections: number
  ) => {
    const rect = element.getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;
    if (clientY < midPoint) {
      setDropSectionTargetIndex(index);
    } else {
      setDropSectionTargetIndex(Math.min(index + 1, totalSections));
    }
  }, []);

  const cancelDrag = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    setDraggedCompId(null);
    setDraggedSectionId(null);
    setDropSectionId(null);
    setDropIndex(null);
    setDropSectionTargetIndex(null);
    if (autoScrollFrameRef.current) {
      cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  }, []);

  const endDrag = useCallback(() => {
    if (!isDragging) {
      cancelDrag();
      return null;
    }

    if (dragType === 'component') {
      if (!draggedCompId || !draggedSectionId || !dropSectionId || dropIndex === null) {
        cancelDrag();
        return null;
      }

      const result: ComponentDropResult = {
        type: 'component',
        compId: draggedCompId,
        sourceSectionId: draggedSectionId,
        targetSectionId: dropSectionId,
        targetIndex: dropIndex,
      };

      if (onDropComplete) onDropComplete(result);
      cancelDrag();
      return result;
    }

    if (dragType === 'section') {
      if (!draggedSectionId || dropSectionTargetIndex === null) {
        cancelDrag();
        return null;
      }

      const result: SectionDropResult = {
        type: 'section',
        sectionId: draggedSectionId,
        targetIndex: dropSectionTargetIndex,
      };

      if (onDropComplete) onDropComplete(result);
      cancelDrag();
      return result;
    }

    cancelDrag();
    return null;
  }, [isDragging, dragType, draggedCompId, draggedSectionId, dropSectionId, dropIndex, dropSectionTargetIndex, onDropComplete, cancelDrag]);

  // AUTO SCROLL 2.0 (REUSED FOR BOTH COMPONENT & SECTION DRAG)
  const handleAutoScroll = useCallback((clientY: number, containerEl: HTMLDivElement | null) => {
    if (!containerEl || !isDragging) return;

    const rect = containerEl.getBoundingClientRect();
    const threshold = 60;
    const distFromTop = clientY - rect.top;
    const distFromBottom = rect.bottom - clientY;

    let scrollSpeed = 0;

    if (distFromTop > 0 && distFromTop <= threshold) {
      const factor = (threshold - distFromTop) / threshold;
      scrollSpeed = -Math.round(2 + Math.pow(factor, 1.8) * 23);
    } else if (distFromBottom > 0 && distFromBottom <= threshold) {
      const factor = (threshold - distFromBottom) / threshold;
      scrollSpeed = Math.round(2 + Math.pow(factor, 1.8) * 23);
    }

    if (scrollSpeed !== 0) {
      containerEl.scrollTop += scrollSpeed;
    }
  }, [isDragging]);

  // LISTEN FOR ESC KEY TO CANCEL DRAG
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging) {
        cancelDrag();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging, cancelDrag]);

  return (
    <DragContext.Provider
      value={{
        isDragging,
        dragType,
        draggedCompId,
        draggedSectionId,
        dropSectionId,
        dropIndex,
        dropSectionTargetIndex,
        startDrag,
        updateDropTarget,
        updateDropTargetWithMidpoint,
        startSectionDrag,
        updateSectionDropTarget,
        updateSectionDropTargetWithMidpoint,
        endDrag,
        cancelDrag,
        handleAutoScroll,
      }}
    >
      {children}
    </DragContext.Provider>
  );
};

export const useDragEngine = () => useContext(DragContext);
