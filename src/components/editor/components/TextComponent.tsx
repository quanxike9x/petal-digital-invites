// src/components/editor/components/TextComponent.tsx
import React, { useMemo } from 'react';
import { useInvitationRuntime } from '../../../context/InvitationRuntimeContext';
import { useTheme } from '../../../context/ThemeContext';

interface TextComponentProps {
  props: {
    text?: string;
    fontSize?: number | string;
    color?: string;
    fontWeight?: string | number;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    fontFamily?: string;
    lineHeight?: number | string;
    letterSpacing?: number | string;
    binding?: string;
    [key: string]: any;
  };
  style?: {
    width?: number | string;
    height?: number | string;
    padding?: number | string;
    margin?: number | string;
    [key: string]: any;
  };
}

export const TextComponent: React.FC<TextComponentProps> = React.memo(({ props, style }) => {
  const { invitationData } = useInvitationRuntime();
  const { currentTheme } = useTheme();

  // Xử lý binding nếu có
  let boundText: string | undefined = undefined;
  if (props.binding && props.binding !== 'none' && invitationData) {
    const rawBoundVal = invitationData[props.binding as keyof typeof invitationData];
    if (typeof rawBoundVal === 'string') {
      boundText = rawBoundVal;
    }
  }

  // Sử dụng text từ binding hoặc props.text
  const displayText = boundText || props.text || 'Text Component';

  // Merge styles từ props và theme
  const combinedStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      width: style?.width || '100%',
      height: style?.height || 'auto',
      padding: style?.padding || '8px',
      margin: style?.margin || '0',
      fontSize: props.fontSize || '16px',
      color: props.color || currentTheme?.colors?.text || '#1a1a1a',
      fontWeight: props.fontWeight || 'normal',
      textAlign: props.textAlign || 'left',
      fontFamily: props.fontFamily || currentTheme?.fontFamily || 'inherit',
      lineHeight: props.lineHeight || '1.5',
      letterSpacing: props.letterSpacing || 'normal',
      wordBreak: 'break-word' as const,
      ...style,
    };

    return baseStyle;
  }, [props, style, currentTheme]);

  return (
    <div 
      className="text-component"
      style={combinedStyle}
    >
      {displayText}
    </div>
  );
});

// Thêm display name cho debug
TextComponent.displayName = 'TextComponent';