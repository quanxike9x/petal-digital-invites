import type { UnifiedComponentInstance, ComponentLayoutPosition } from '../registry/ComponentRegistry';
import { getDefaultResizeModeForType } from '../registry/ComponentRegistry';

export type SectionType = 
  | 'Hero'
  | 'Couple'
  | 'Gallery'
  | 'Timeline'
  | 'Event'
  | 'Countdown'
  | 'Gift'
  | 'Wish'
  | 'Map'
  | 'Footer'
  | 'Custom';

export type ContainerType = 'vertical' | 'stack';
export type PositionMode = 'vertical' | 'absolute';

export interface ContainerStyle {
  width?: string;
  height?: string;
  padding?: number | string;
  backgroundColor?: string;
  borderRadius?: number | string;
  positionMode?: PositionMode;
}

export interface ContainerInstance {
  id: string;
  type: ContainerType;
  style?: ContainerStyle;
  components: UnifiedComponentInstance[];
}

export interface TemplateSectionStyle {
  padding?: number | string;
  margin?: number | string;
  backgroundColor?: string;
  backgroundImage?: string;
  borderRadius?: number;
  containerWidth?: string;
  minHeight?: string | number;
  height?: string | number;
}

export interface TemplateSection {
  id: string;
  name?: string;
  type: SectionType;
  style?: TemplateSectionStyle;
  containers?: ContainerInstance[];
  /** @deprecated Kept for legacy template backward compatibility */
  components?: UnifiedComponentInstance[];
}

export interface TemplatePage {
  id: string;
  name: string;
  sections: TemplateSection[];
}

export interface TemplateLayoutSchema {
  id: string;
  name: string;
  version: string;
  pages: TemplatePage[];
}

/**
 * AUTOMATIC TRANSPARENT MIGRATION HELPER FOR SECTIONS (TASK D2.1 STACK CONTAINER ACTIVATION)
 */
export function getSectionContainers(section: TemplateSection): ContainerInstance[] {
  if (section.containers && section.containers.length > 0) {
    return section.containers.map((c) => ({
      ...c,
      type: c.type || 'vertical',
    }));
  }

  // Fallback migration for legacy templates
  const legacyComps = section.components || [];
  return [
    {
      id: `cnt-${section.id}`,
      type: 'vertical',
      style: { width: '100%' },
      components: legacyComps,
    },
  ];
}

/**
 * AUTOMATIC TRANSPARENT NORMALIZATION FOR COMPONENT RESIZING & RESIZE MODE
 */
export function getNormalizedComponentLayoutPosition(comp: UnifiedComponentInstance): ComponentLayoutPosition {
  const pos = comp.layout?.position || {};
  const styleWidth = comp.style?.width;
  const styleHeight = comp.style?.height;
  const defaultMode = getDefaultResizeModeForType(comp.type);

  return {
    x: pos.x ?? 0,
    y: pos.y ?? 0,
    width: pos.width || (typeof styleWidth === 'number' ? `${styleWidth}px` : styleWidth) || '100%',
    height: pos.height || (typeof styleHeight === 'number' ? `${styleHeight}px` : styleHeight) || 'auto',
    minWidth: pos.minWidth || '40px',
    minHeight: pos.minHeight || '20px',
    maxWidth: pos.maxWidth || '100%',
    maxHeight: pos.maxHeight || 'none',
    lockAspectRatio: pos.lockAspectRatio ?? false,
    resizeMode: pos.resizeMode || defaultMode,
    imageFit: pos.imageFit || 'cover',
    anchor: pos.anchor || 'top-left',
  };
}

/**
 * Helper to retrieve all components from a section (flattens all container components)
 */
export function getSectionComponents(section: TemplateSection): UnifiedComponentInstance[] {
  const containers = getSectionContainers(section);
  return containers.flatMap((c) => c.components || []);
}

/**
 * Safe helper to retrieve page sections
 */
export function getPageSections(page?: TemplatePage): TemplateSection[] {
  return page?.sections || [];
}
