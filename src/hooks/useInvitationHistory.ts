import { useState, useCallback, useRef } from 'react';
import type { Invitation } from '../types';

const MAX_HISTORY = 30;

export const useInvitationHistory = (initialState: Invitation | null) => {
  const [history, setHistory] = useState<Invitation[]>(initialState ? [initialState] : []);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize history when initial data loads
  const initHistory = useCallback((inv: Invitation) => {
    setHistory([inv]);
    setCurrentIndex(0);
  }, []);

  const present = history[currentIndex] || initialState;

  const pushState = useCallback(
    (newState: Invitation) => {
      setHistory((prevHistory) => {
        const sliced = prevHistory.slice(0, currentIndex + 1);
        // Avoid duplicate pushes if state hasn't changed meaningfully
        const last = sliced[sliced.length - 1];
        if (last && JSON.stringify(last) === JSON.stringify(newState)) {
          return prevHistory;
        }
        const updated = [...sliced, newState];
        if (updated.length > MAX_HISTORY) {
          updated.shift();
        }
        return updated;
      });
      setCurrentIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [currentIndex]
  );

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      const nextIndex = currentIndex - 1;
      setCurrentIndex(nextIndex);
      return history[nextIndex];
    }
    return null;
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      return history[nextIndex];
    }
    return null;
  }, [canRedo, currentIndex, history]);

  return {
    present,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    initHistory,
  };
};
