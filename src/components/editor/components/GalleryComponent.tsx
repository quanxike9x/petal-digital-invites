import React, { useMemo } from 'react';
import { useInvitationRuntime } from '../../../context/InvitationRuntimeContext';
import { AssetRepository } from '../../../repositories/AssetRepository';
import { useTheme } from '../../../context/ThemeContext';

interface GalleryComponentProps {
  props: {
    images?: string[];
    assetIds?: string[];
    layout?: 'grid' | 'masonry' | 'carousel';
    gap?: number;
    radius?: number;
    binding?: string;
  };
}

export const GalleryComponent: React.FC<GalleryComponentProps> = React.memo(({ props }) => {
  const { invitationData } = useInvitationRuntime();
  const { currentTheme } = useTheme();

  let boundValue: string[] | undefined = undefined;
  if (props.binding && props.binding !== 'none' && invitationData) {
    const rawBoundVal = invitationData[props.binding as keyof typeof invitationData];
    if (Array.isArray(rawBoundVal)) {
      boundValue = rawBoundVal as string[];
    }
  }

  const defaultImages = useMemo(() => [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600',
  ], []);

  const rawList = boundValue || (props.assetIds && props.assetIds.length > 0 ? props.assetIds : props.images) || defaultImages;
  const resolvedImages = useMemo(() => rawList.map((img) => AssetRepository.resolveUrl(img)), [rawList]);

  const gapPx = props.gap !== undefined ? `${props.gap}px` : currentTheme.spacing.md;
  const radiusPx = props.radius !== undefined ? `${props.radius}px` : currentTheme.radius.md;

  return (
    <div className="w-full h-full p-2" style={{ width: '100%', height: '100%' }}>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 w-full h-full"
        style={{ gap: gapPx, width: '100%', height: '100%' }}
      >
        {resolvedImages.map((src, idx) => (
          <div
            key={idx}
            className="overflow-hidden bg-slate-200 aspect-square shadow-sm"
            style={{ 
              borderRadius: radiusPx,
              overflow: 'hidden',
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={src}
              alt={`Gallery Image ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});