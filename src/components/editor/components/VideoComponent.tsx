import React, { useMemo } from 'react';
import { useInvitationRuntime } from '../../../context/InvitationRuntimeContext';
import { AssetRepository } from '../../../repositories/AssetRepository';
import { useTheme } from '../../../context/ThemeContext';

interface VideoComponentProps {
  props: {
    url?: string;
    assetId?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    binding?: string;
  };
  style?: {
    width?: number | string;
    height?: number | string;
  };
}

export const VideoComponent: React.FC<VideoComponentProps> = React.memo(({ props, style }) => {
  const { invitationData } = useInvitationRuntime();
  const { currentTheme } = useTheme();

  let boundValue: string | undefined = undefined;
  if (props.binding && props.binding !== 'none' && invitationData) {
    const rawBoundVal = invitationData[props.binding as keyof typeof invitationData];
    if (typeof rawBoundVal === 'string') {
      boundValue = rawBoundVal;
    }
  }

  const rawTargetUrl = boundValue || props.assetId || props.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  const resolvedUrl = useMemo(() => AssetRepository.resolveUrl(rawTargetUrl), [rawTargetUrl]);

  // Helper to convert YouTube / Vimeo watch URL to Embed iframe URL
  const embedSrc = useMemo(() => {
    if (resolvedUrl.includes('youtube.com/watch?v=')) {
      const videoId = resolvedUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (resolvedUrl.includes('youtu.be/')) {
      const videoId = resolvedUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (resolvedUrl.includes('vimeo.com/')) {
      const videoId = resolvedUrl.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return resolvedUrl;
  }, [resolvedUrl]);

  const containerStyle: React.CSSProperties = useMemo(() => ({
    width: typeof style?.width === 'number' ? `${style.width}px` : style?.width || '100%',
    height: typeof style?.height === 'number' ? `${style.height}px` : style?.height || '220px',
    borderRadius: currentTheme.radius.xl,
  }), [style?.width, style?.height, currentTheme]);

  return (
    <div style={containerStyle} className="w-full aspect-video overflow-hidden shadow-md bg-slate-900">
      <iframe
        src={embedSrc}
        title="Wedding Video Preview"
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
});
