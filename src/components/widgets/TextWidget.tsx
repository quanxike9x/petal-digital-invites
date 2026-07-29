import React from 'react';

export interface TextWidgetProps {
  id: string;
  content?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    letterSpacing?: number;
    lineHeight?: number;
    shadow?: string;
    stroke?: string;
    opacity?: number;
    animation?: string;
  };
}

export const TextWidget: React.FC<TextWidgetProps> = ({
  id,
  content = 'Minh Phong & Quỳnh Hoa',
  style = {},
}) => {
  const textStyle: React.CSSProperties = {
    fontFamily: style.fontFamily || 'Be Vietnam Pro',
    fontSize: style.fontSize ? `${style.fontSize}px` : '20px',
    fontWeight: style.fontWeight || '600',
    color: style.color || '#0f172a',
    textAlign: style.align || 'center',
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : 'normal',
    lineHeight: style.lineHeight ? `${style.lineHeight}` : '1.3',
    textShadow: style.shadow && style.shadow !== 'none' ? '0 4px 6px rgba(0,0,0,0.3)' : undefined,
    WebkitTextStroke: style.stroke && style.stroke !== 'none' ? `1px ${style.stroke}` : undefined,
    opacity: style.opacity !== undefined ? style.opacity : 1,
  };

  return (
    <div id={id} className={`text-widget w-full h-full flex items-center justify-center p-1 font-sans ${style.animation || ''}`}>
      <div style={textStyle} className="w-full break-words whitespace-pre-wrap leading-normal">
        {content}
      </div>
    </div>
  );
};
