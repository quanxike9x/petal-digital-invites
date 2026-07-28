import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeTokens, ThemePreset, ThemeColors, TemplateThemeSchema } from '../types/theme';
import { ThemeRepository } from '../repositories/ThemeRepository';
import type { TemplateLayoutSchema } from '../schema/TemplateSchema';

interface ThemeContextType {
  currentTheme: ThemeTokens;
  activePresetId: string;
  availablePresets: ThemePreset[];
  setThemePreset: (presetId: string) => void;
  updateColor: (colorKey: keyof ThemeColors, value: string) => void;
  updateFontFamily: (fontFamily: string) => void;
  updateRadius: (radiusPx: number) => void;
  updateSpacing: (spacingPx: number) => void;
  updateShadow: (shadowPreset: 'none' | 'sm' | 'md' | 'lg') => void;
  resetColorGroup: (colorKey: keyof ThemeColors) => void;
  resetTypographyGroup: () => void;
  resetRadiusGroup: () => void;
  resetSpacingGroup: () => void;
  resetShadowGroup: () => void;
  resetAllTheme: () => void;
  exportThemeSchema: () => TemplateThemeSchema;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: ThemeRepository.getPreset('luxury-gold').tokens,
  activePresetId: 'luxury-gold',
  availablePresets: ThemeRepository.getAllPresets(),
  setThemePreset: () => {},
  updateColor: () => {},
  updateFontFamily: () => {},
  updateRadius: () => {},
  updateSpacing: () => {},
  updateShadow: () => {},
  resetColorGroup: () => {},
  resetTypographyGroup: () => {},
  resetRadiusGroup: () => {},
  resetSpacingGroup: () => {},
  resetShadowGroup: () => {},
  resetAllTheme: () => {},
  exportThemeSchema: () => ({ presetId: 'luxury-gold', activeTokens: ThemeRepository.getPreset('luxury-gold').tokens }),
});

interface ThemeProviderProps {
  children: React.ReactNode;
  initialLayout?: TemplateLayoutSchema;
  onThemeChange?: (updatedThemeSchema: TemplateThemeSchema) => void;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialLayout,
  onThemeChange,
}) => {
  const initialSchema = initialLayout ? ThemeRepository.loadTheme(initialLayout) : {
    presetId: 'luxury-gold',
    activeTokens: ThemeRepository.getPreset('luxury-gold').tokens,
  };

  const [themeSchema, setThemeSchema] = useState<TemplateThemeSchema>(initialSchema);

  // Sync state if initialLayout changes
  useEffect(() => {
    if (initialLayout) {
      const loaded = ThemeRepository.loadTheme(initialLayout);
      setThemeSchema(loaded);
    }
  }, [initialLayout]);

  const notifyChange = (newSchema: TemplateThemeSchema) => {
    setThemeSchema(newSchema);
    if (onThemeChange) onThemeChange(newSchema);
  };

  const handleSetThemePreset = (presetId: string) => {
    const targetPreset = ThemeRepository.getPreset(presetId);
    const updatedSchema: TemplateThemeSchema = {
      ...themeSchema,
      presetId: targetPreset.id,
      activeTokens: JSON.parse(JSON.stringify(targetPreset.tokens)),
    };
    notifyChange(updatedSchema);
  };

  const handleUpdateColor = (colorKey: keyof ThemeColors, value: string) => {
    const updatedSchema: TemplateThemeSchema = {
      ...themeSchema,
      activeTokens: {
        ...themeSchema.activeTokens,
        colors: {
          ...themeSchema.activeTokens.colors,
          [colorKey]: value,
        },
      },
    };
    notifyChange(updatedSchema);
  };

  const handleUpdateFontFamily = (fontFamily: string) => {
    const updatedSchema: TemplateThemeSchema = {
      ...themeSchema,
      activeTokens: {
        ...themeSchema.activeTokens,
        typography: {
          ...themeSchema.activeTokens.typography,
          fontFamily,
          headingFontFamily: fontFamily,
        },
      },
    };
    notifyChange(updatedSchema);
  };

  const handleUpdateRadius = (radiusPx: number) => {
    const val = `${radiusPx}px`;
    const updatedSchema: TemplateThemeSchema = {
      ...themeSchema,
      activeTokens: {
        ...themeSchema.activeTokens,
        radius: {
          ...themeSchema.activeTokens.radius,
          sm: `${Math.max(2, Math.round(radiusPx / 4))}px`,
          md: `${Math.max(4, Math.round(radiusPx / 2))}px`,
          lg: val,
          xl: `${Math.round(radiusPx * 1.25)}px`,
        },
      },
    };
    notifyChange(updatedSchema);
  };

  const handleUpdateSpacing = (spacingPx: number) => {
    const val = `${spacingPx}px`;
    const updatedSchema: TemplateThemeSchema = {
      ...themeSchema,
      activeTokens: {
        ...themeSchema.activeTokens,
        spacing: {
          ...themeSchema.activeTokens.spacing,
          xs: `${Math.max(2, Math.round(spacingPx / 4))}px`,
          sm: `${Math.max(4, Math.round(spacingPx / 2))}px`,
          md: val,
          lg: `${Math.round(spacingPx * 1.5)}px`,
          xl: `${Math.round(spacingPx * 2)}px`,
        },
      },
    };
    notifyChange(updatedSchema);
  };

  const handleUpdateShadow = (shadowPreset: 'none' | 'sm' | 'md' | 'lg') => {
    const shadowMap = {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    };
    const updatedSchema: TemplateThemeSchema = {
      ...themeSchema,
      activeTokens: {
        ...themeSchema.activeTokens,
        shadow: {
          ...themeSchema.activeTokens.shadow,
          lg: shadowMap[shadowPreset],
          md: shadowMap[shadowPreset],
        },
      },
    };
    notifyChange(updatedSchema);
  };

  // Group Reset Handlers
  const handleResetColorGroup = (colorKey: keyof ThemeColors) => {
    const newTokens = ThemeRepository.resetColorGroup(themeSchema.presetId, colorKey, themeSchema.activeTokens);
    notifyChange({ ...themeSchema, activeTokens: newTokens });
  };

  const handleResetTypographyGroup = () => {
    const newTokens = ThemeRepository.resetTypographyGroup(themeSchema.presetId, themeSchema.activeTokens);
    notifyChange({ ...themeSchema, activeTokens: newTokens });
  };

  const handleResetRadiusGroup = () => {
    const newTokens = ThemeRepository.resetRadiusGroup(themeSchema.presetId, themeSchema.activeTokens);
    notifyChange({ ...themeSchema, activeTokens: newTokens });
  };

  const handleResetSpacingGroup = () => {
    const newTokens = ThemeRepository.resetSpacingGroup(themeSchema.presetId, themeSchema.activeTokens);
    notifyChange({ ...themeSchema, activeTokens: newTokens });
  };

  const handleResetShadowGroup = () => {
    const newTokens = ThemeRepository.resetShadowGroup(themeSchema.presetId, themeSchema.activeTokens);
    notifyChange({ ...themeSchema, activeTokens: newTokens });
  };

  const handleResetAllTheme = () => {
    const defaultPreset = ThemeRepository.getPreset(themeSchema.presetId);
    notifyChange({
      presetId: defaultPreset.id,
      activeTokens: JSON.parse(JSON.stringify(defaultPreset.tokens)),
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: themeSchema.activeTokens,
        activePresetId: themeSchema.presetId,
        availablePresets: ThemeRepository.getAllPresets(),
        setThemePreset: handleSetThemePreset,
        updateColor: handleUpdateColor,
        updateFontFamily: handleUpdateFontFamily,
        updateRadius: handleUpdateRadius,
        updateSpacing: handleUpdateSpacing,
        updateShadow: handleUpdateShadow,
        resetColorGroup: handleResetColorGroup,
        resetTypographyGroup: handleResetTypographyGroup,
        resetRadiusGroup: handleResetRadiusGroup,
        resetSpacingGroup: handleResetSpacingGroup,
        resetShadowGroup: handleResetShadowGroup,
        resetAllTheme: handleResetAllTheme,
        exportThemeSchema: () => themeSchema,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
