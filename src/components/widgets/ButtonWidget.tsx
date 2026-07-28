import React, { useState } from 'react';
import { Heart, Send, Sparkles, Star, MapPin, Phone, Music, ArrowRight } from 'lucide-react';

export interface ButtonWidgetProps {
  id: string;
  content?: string;
  style?: {
    bgColor?: string;
    textColor?: string;
    hoverBgColor?: string;
    hoverScale?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    shadow?: string;
    fontSize?: number;
    paddingX?: number;
    paddingY?: number;
    animation?: string;
  };
  settings?: {
    linkUrl?: string;
    icon?: string;
    iconPosition?: 'left' | 'right';
  };
}

export const ButtonWidget: React.FC<ButtonWidgetProps> = ({
  id,
  content = 'Xác Nhận Tham Dự',
  style = {},
  settings = {},
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconsMap: Record<string, React.ComponentType<any>> = {
    heart: Heart,
    send: Send,
    sparkles: Sparkles,
    star: Star,
    mappin: MapPin,
    phone: Phone,
    music: Music,
    arrow: ArrowRight,
  };

  const IconComp = settings.icon ? iconsMap[settings.icon.toLowerCase()] : null;

  const handleClick = (e: React.MouseEvent) => {
    if (settings.linkUrl) {
      e.stopPropagation();
      window.open(settings.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const btnStyle: React.CSSProperties = {
    backgroundColor: isHovered && style.hoverBgColor ? style.hoverBgColor : (style.bgColor || '#e11d48'),
    color: style.textColor || '#ffffff',
    borderRadius: style.borderRadius !== undefined ? `${style.borderRadius}px` : '16px',
    borderWidth: style.borderWidth !== undefined ? `${style.borderWidth}px` : '1px',
    borderColor: style.borderColor || 'transparent',
    boxShadow: style.shadow && style.shadow !== 'none' ? '0 10px 15px -3px rgba(225, 29, 72, 0.4)' : undefined,
    fontSize: style.fontSize ? `${style.fontSize}px` : '13px',
    paddingLeft: style.paddingX ? `${style.paddingX}px` : '20px',
    paddingRight: style.paddingX ? `${style.paddingX}px` : '20px',
    paddingTop: style.paddingY ? `${style.paddingY}px` : '10px',
    paddingBottom: style.paddingY ? `${style.paddingY}px` : '10px',
    transform: isHovered ? `scale(${style.hoverScale || 1.03})` : 'scale(1)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div id={id} className={`button-widget w-full h-full flex items-center justify-center ${style.animation || ''}`}>
      <button
        style={btnStyle}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full h-full font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
      >
        {IconComp && settings.iconPosition !== 'right' && <IconComp className="w-4 h-4" />}
        <span>{content}</span>
        {IconComp && settings.iconPosition === 'right' && <IconComp className="w-4 h-4" />}
      </button>
    </div>
  );
};
