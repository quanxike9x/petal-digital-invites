import React, { useMemo } from 'react';
import type { ComponentProps } from '../../../types/componentProps';
import { useTheme } from '../../../context/ThemeContext';

export const SpacerComponent: React.FC<ComponentProps> = React.memo(({ style }) => {
  const { currentTheme } = useTheme();

  const height = typeof style.height === 'number' ? style.height : parseInt(currentTheme.spacing.lg, 10) || 32;

  const spacerStyle: React.CSSProperties = useMemo(() => ({
    height: `${height}px`,
    width: '100%',
  }), [height]);

  return (
    <div
      style={spacerStyle}
      className="w-full h-full bg-slate-50/50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-mono text-slate-400 transition-all"
    >
      Spacer ({height}px)
    </div>
  );
});