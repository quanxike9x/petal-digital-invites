import { useState, useCallback, useEffect } from 'react';
import type { TemplateLayoutSchema } from '../schema/TemplateSchema';
import type { HistorySnapshot } from '../types/history';

const MAX_HISTORY_LIMIT = 100;

export const useHistoryEngine = (initialLayout: TemplateLayoutSchema, initialSelectedId: string | null = null) => {
  const [past, setPast] = useState<HistorySnapshot[]>([]);
  const [future, setFuture] = useState<HistorySnapshot[]>([]);
  const [current, setCurrent] = useState<HistorySnapshot>({
    layoutJson: initialLayout,
    selectedComponentId: initialSelectedId,
  });

  // Reset History stack with loaded template layout from database
  const resetHistory = useCallback((newLayout: TemplateLayoutSchema, newSelectedId: string | null = null) => {
    setPast([]);
    setFuture([]);
    setCurrent({
      layoutJson: JSON.parse(JSON.stringify(newLayout)),
      selectedComponentId: newSelectedId,
    });
  }, []);

  // Push new state snapshot into history (triggered on Add, Delete, Duplicate, Reorder, Update Property)
  const recordChange = useCallback((newLayout: TemplateLayoutSchema, newSelectedId: string | null) => {
    setPast((prevPast) => {
      const nextPast = [...prevPast, current];
      if (nextPast.length > MAX_HISTORY_LIMIT) {
        return nextPast.slice(nextPast.length - MAX_HISTORY_LIMIT);
      }
      return nextPast;
    });
    setFuture([]); // Clear redo stack on new action
    setCurrent({
      layoutJson: newLayout,
      selectedComponentId: newSelectedId,
    });
  }, [current]);

  // Undo (Ctrl + Z)
  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previousSnapshot = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture((prevFuture) => [current, ...prevFuture]);
    setPast(newPast);
    setCurrent(previousSnapshot);
  }, [past, current]);

  // Redo (Ctrl + Shift + Z or Ctrl + Y)
  const redo = useCallback(() => {
    if (future.length === 0) return;

    const nextSnapshot = future[0];
    const newFuture = future.slice(1);

    setPast((prevPast) => [...prevPast, current]);
    setFuture(newFuture);
    setCurrent(nextSnapshot);
  }, [future, current]);

  // Keyboard Shortcuts Listener (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (!isCtrl) return;

      if (e.key === 'z' || e.key === 'Z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    layoutJson: current.layoutJson,
    selectedComponentId: current.selectedComponentId,
    recordChange,
    resetHistory,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historyCount: past.length,
  };
};
