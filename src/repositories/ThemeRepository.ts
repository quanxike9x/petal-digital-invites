import type { 
  ThemeTokens, 
  ThemePreset, 
  TemplateThemeSchema, 
  SectionThemeOverride, 
  ComponentThemeOverride,
  ThemeColors
} from '../types/theme';
import type { TemplateLayoutSchema } from '../schema/TemplateSchema';
import { THEME_PRESETS, DEFAULT_THEME_TOKENS } from '../theme/presets';

/**
 * THEME REPOSITORY (SINGLE DATA PROVIDER FOR THEMES)
 * Encapsulates Theme Load, Save, Persistence, Preset lookup, Group Resets & Override resolution.
 */
export class ThemeRepository {
  /**
   * Load Theme schema from Template Layout JSON
   */
  public static loadTheme(layoutJson: TemplateLayoutSchema): TemplateThemeSchema {
    if (layoutJson && (layoutJson as unknown as { theme?: TemplateThemeSchema }).theme) {
      const savedTheme = (layoutJson as unknown as { theme: TemplateThemeSchema }).theme;
      if (savedTheme.activeTokens) {
        return savedTheme;
      }
    }

    return {
      presetId: DEFAULT_THEME_TOKENS.id,
      activeTokens: DEFAULT_THEME_TOKENS,
      sectionOverrides: {},
    };
  }

  /**
   * Embed Theme schema into Template Layout JSON for persistence
   */
  public static saveTheme(
    layoutJson: TemplateLayoutSchema, 
    themeSchema: TemplateThemeSchema
  ): TemplateLayoutSchema {
    return {
      ...layoutJson,
      theme: themeSchema,
    } as unknown as TemplateLayoutSchema;
  }

  /**
   * Find Theme Preset by Preset ID
   */
  public static getPreset(presetId: string): ThemePreset {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    return preset || THEME_PRESETS[0];
  }

  /**
   * Get all available built-in Theme Presets
   */
  public static getAllPresets(): ThemePreset[] {
    return THEME_PRESETS;
  }

  /**
   * Group-Level Reset Methods
   */
  public static resetColorGroup(presetId: string, colorKey: keyof ThemeColors, currentTokens: ThemeTokens): ThemeTokens {
    const defaultTokens = this.getPreset(presetId).tokens;
    return {
      ...currentTokens,
      colors: {
        ...currentTokens.colors,
        [colorKey]: defaultTokens.colors[colorKey],
      },
    };
  }

  public static resetTypographyGroup(presetId: string, currentTokens: ThemeTokens): ThemeTokens {
    const defaultTokens = this.getPreset(presetId).tokens;
    return {
      ...currentTokens,
      typography: JSON.parse(JSON.stringify(defaultTokens.typography)),
    };
  }

  public static resetRadiusGroup(presetId: string, currentTokens: ThemeTokens): ThemeTokens {
    const defaultTokens = this.getPreset(presetId).tokens;
    return {
      ...currentTokens,
      radius: JSON.parse(JSON.stringify(defaultTokens.radius)),
    };
  }

  public static resetSpacingGroup(presetId: string, currentTokens: ThemeTokens): ThemeTokens {
    const defaultTokens = this.getPreset(presetId).tokens;
    return {
      ...currentTokens,
      spacing: JSON.parse(JSON.stringify(defaultTokens.spacing)),
    };
  }

  public static resetShadowGroup(presetId: string, currentTokens: ThemeTokens): ThemeTokens {
    const defaultTokens = this.getPreset(presetId).tokens;
    return {
      ...currentTokens,
      shadow: JSON.parse(JSON.stringify(defaultTokens.shadow)),
    };
  }

  /**
   * Three-Tier Theme Override Resolver
   * Priority Order: Global Theme -> Section Override -> Component Override
   */
  public static resolveEffectiveTheme(
    globalTheme: ThemeTokens,
    sectionOverride?: SectionThemeOverride,
    compOverride?: ComponentThemeOverride
  ): ThemeTokens {
    if (!sectionOverride && !compOverride) {
      return globalTheme;
    }

    const mergedColors = {
      ...globalTheme.colors,
      ...(sectionOverride?.colors || {}),
      ...(compOverride?.colors || {}),
    };

    const mergedTypography = {
      ...globalTheme.typography,
      ...(sectionOverride?.typography || {}),
      ...(compOverride?.typography || {}),
    };

    const mergedSpacing = {
      ...globalTheme.spacing,
      ...(sectionOverride?.spacing || {}),
    };

    const mergedRadius = {
      ...globalTheme.radius,
      ...(compOverride?.radius || {}),
    };

    return {
      ...globalTheme,
      colors: mergedColors,
      typography: mergedTypography,
      spacing: mergedSpacing,
      radius: mergedRadius,
    };
  }
}
