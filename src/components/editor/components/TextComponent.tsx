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

  return (
    <div 
      className="w-full h-full overflow-hidden"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: currentTheme.radius.xl,
        overflow: 'hidden',
        backgroundColor: '#0f172a',
      }}
    >
      <iframe
        src={embedSrc}
        title="Wedding Video Preview"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
        }}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
});