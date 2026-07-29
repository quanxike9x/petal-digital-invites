import React, { useState } from 'react';

export interface SingleImageWidgetProps {
  id: string;
  content?: string;
  src?: string;
  alt?: string;
  style?: {
    width?: number | string;
    height?: number | string;
    rotation?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    borderRadius?: number;
    shadow?: string;
    opacity?: number;
    animation?: string;
    aspectRatio?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  };
  interactions?: {
    onClickAction?: 'popup' | 'toggle' | 'show' | 'hide' | 'link' | 'custom_js';
    onClickTarget?: string;
    onHoverAction?: string;
  };
  onExecuteInteraction?: (action?: string, target?: string) => void;
}

export const SingleImageWidget: React.FC<SingleImageWidgetProps> = ({
  id,
  content,
  src,
  alt = 'Single Image',
  style = {},
  interactions = {},
  onExecuteInteraction,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const imageSrc = content || src || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600';

  const transformParts = [];
  if (style.rotation) transformParts.push(`rotate(${style.rotation}deg)`);
  if (style.flipHorizontal) transformParts.push('scaleX(-1)');
  if (style.flipVertical) transformParts.push('scaleY(-1)');

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: transformParts.length > 0 ? transformParts.join(' ') : undefined,
    borderRadius: style.borderRadius !== undefined ? `${style.borderRadius}px` : '16px',
    boxShadow: style.shadow && style.shadow !== 'none' ? '0 20px 25px -5px rgba(0,0,0,0.3)' : undefined,
    opacity: style.opacity !== undefined ? style.opacity : 1,
    objectFit: style.objectFit || 'cover',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (interactions.onClickAction && onExecuteInteraction) {
      e.stopPropagation();
      onExecuteInteraction(interactions.onClickAction, interactions.onClickTarget);
    }
  };

  return (
    <div
      id={id}
      className={`single-image-widget w-full h-full overflow-hidden transition-all duration-300 ${
        style.animation || ''
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: interactions.onClickAction ? 'pointer' : 'default',
        transform: isHovered ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        style={imgStyle}
        className="w-full h-full block border border-white/10"
      />
    </div>
  );
};
