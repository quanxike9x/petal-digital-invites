import React, { useMemo } from 'react';
import { useInvitationRuntime } from '../../../context/InvitationRuntimeContext';
import { AssetRepository } from '../../../repositories/AssetRepository';
import { useTheme } from '../../../context/ThemeContext';

interface ImageComponentProps {
  props: {
    src?: string;
    assetId?: string;
    alt?: string;
    borderRadius?: number;
    shadow?: boolean;
    objectFit?: 'cover' | 'contain' | 'fill';
    binding?: string;
  };
  style?: {
    width?: number | string;
    height?: number | string;
  };
}

export const ImageComponent: React.FC<ImageComponentProps> = React.memo(({ props, style }) => {
  const { invitationData } = useInvitationRuntime();
  const { currentTheme } = useTheme();

  // 1. Resolve Bound Variable dynamically from invitationData
  let boundValue: string | undefined = undefined;
  if (props.binding && props.binding !== 'none' && invitationData) {
    const rawBoundVal = invitationData[props.binding as keyof typeof invitationData];
    if (typeof rawBoundVal === 'string' && rawBoundVal) {
      boundValue = rawBoundVal;
    }
  }

  // 2. Resolve URL via AssetRepository
  const rawTarget = boundValue || props.assetId || props.src || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800';
  const resolvedSrc = useMemo(() => AssetRepository.resolveUrl(rawTarget), [rawTarget]);

  // Read Theme Tokens for borderRadius fallback & shadow
  const radius = props.borderRadius !== undefined ? `${props.borderRadius}px` : currentTheme.radius.md;
  const shadowStyle = props.shadow ? currentTheme.shadow.lg : currentTheme.shadow.none;

  const imgStyle: React.CSSProperties = useMemo(() => ({
    width: typeof style?.width === 'number' ? `${style.width}px` : style?.width || '100%',
    height: typeof style?.height === 'number' ? `${style.height}px` : style?.height || 'auto',
    borderRadius: radius,
    objectFit: props.objectFit || 'cover',
    boxShadow: shadowStyle,
  }), [style?.width, style?.height, radius, props.objectFit, shadowStyle]);

  return (
    <div className="overflow-hidden transition-all w-full">
      <img
        src={resolvedSrc}
        alt={props.alt || 'Wedding Image'}
        style={imgStyle}
        className="w-full h-full block"
      />
    </div>
  );
});
