/**
 * THEME ENGINE DESIGN TOKENS SCHEMA (COMPLETION)
 * Independent Theme Tokens System for Pudwedding Platform
 * Includes Override Architecture & Marketplace-ready ThemePreset Model
 */

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    normal: number | string;
    medium: number | string;
    semibold: number | string;
    bold: number | string;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    normal: string;
    wide: string;
    wider: string;
  };
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  background: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeShadow {
  none: string;
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeTokens {
  id: string;
  name: string;
  typography: ThemeTypography;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadow: ThemeShadow;
  animation?: Record<string, unknown>; // Left empty for future animation engine
}

/**
 * MARKETPLACE-READY THEME PRESET MODEL
 */
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // Visual Preview Thumbnail URL / SVG Data
  tokens: ThemeTokens;
}

/**
 * THREE-TIER THEME OVERRIDE ARCHITECTURE SCHEMA
 * Global Theme -> Section Override -> Component Override
 */
export interface ComponentThemeOverride {
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  radius?: Partial<ThemeRadius>;
}

export interface SectionThemeOverride {
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  spacing?: Partial<ThemeSpacing>;
  components?: Record<string, ComponentThemeOverride>;
}

export interface TemplateThemeSchema {
  presetId: string;
  activeTokens: ThemeTokens;
  sectionOverrides?: Record<string, SectionThemeOverride>;
}
