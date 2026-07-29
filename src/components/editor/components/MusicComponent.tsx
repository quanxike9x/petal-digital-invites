import React, { useMemo } from 'react';
import type { ComponentProps } from '../../../types/componentProps';
import { useInvitationRuntime } from '../../../context/InvitationRuntimeContext';
import { useTheme } from '../../../context/ThemeContext';

export const MusicComponent: React.FC<ComponentProps> = React.memo(({ props }) => {
  const { invitationData } = useInvitationRuntime();
  const { currentTheme } = useTheme();

  const bindingKey = typeof props.binding === 'string' ? props.binding : 'none';
  const boundValue = bindingKey !== 'none' ? invitationData[bindingKey] : undefined;

  const songTitle = typeof props.songTitle === 'string' ? props.songTitle : 'Nhạc Nền Tiệc Cưới';
  const audioUrl = (typeof boundValue === 'string' && boundValue)
    || (typeof props.audioUrl === 'string' && props.audioUrl)
    || (typeof props.musicUrl === 'string' && props.musicUrl)
    || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  const containerStyle: React.CSSProperties = useMemo(() => ({
    fontFamily: currentTheme.typography.fontFamily,
    backgroundColor: currentTheme.colors.background,
    borderColor: currentTheme.colors.border,
    borderRadius: currentTheme.radius.xl,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }), [currentTheme]);

  return (
    <div style={containerStyle} className="p-3 border shadow-sm flex items-center justify-between font-sans transition-all relative w-full h-full">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          style={{ backgroundColor: currentTheme.colors.primary }}
          className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-md animate-spin-slow shrink-0"
        >
          🎵
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: currentTheme.colors.text }} className="font-bold text-xs truncate">{songTitle}</p>
          <p style={{ color: currentTheme.colors.textSecondary }} className="text-[10px] font-mono truncate">{audioUrl}</p>
        </div>
      </div>
      <span
        style={{ backgroundColor: `${currentTheme.colors.primary}15`, color: currentTheme.colors.primary }}
        className="text-[10px] font-mono px-2 py-1 rounded-lg font-bold shrink-0 ml-2"
      >
        Audio Card
      </span>
    </div>
  );
});