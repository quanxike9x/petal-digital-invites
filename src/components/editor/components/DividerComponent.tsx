import React, { useMemo } from 'react';
import type { ComponentProps } from '../../../types/componentProps';
import { useTheme } from '../../../context/ThemeContext';

export const DividerComponent: React.FC<ComponentProps> = React.memo(({ style }) => {
  const { currentTheme } = useTheme();

  const thickness = typeof style.thickness === 'number' ? style.thickness : 1;
  const color = typeof style.color === 'string' ? style.color : currentTheme.colors.border;
  const iconColor = currentTheme.colors.primary;

  const dividerStyle = useMemo(() => ({
    borderTopWidth: `${thickness}px`,
    borderColor: color,
  }), [thickness, color]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center gap-3 transition-all p-2"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="flex-1 border-t" style={dividerStyle} />
      <span className="font-serif text-xs" style={{ color: iconColor }}>❖</span>
      <div className="flex-1 border-t" style={dividerStyle} />
    </div>
  );
});