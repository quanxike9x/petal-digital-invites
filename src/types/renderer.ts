import type { WidgetType } from '../registry/ComponentRegistry';

/**
 * STRICT TYPES FOR RENDERER AND TEMPLATE LAYOUT JSON (NO ANY)
 */

export interface ComponentInstance {
  id: string;
  type: WidgetType | string;
  props: Record<string, unknown>;
  style: Record<string, unknown>;
}

export interface PageSchema {
  id: string;
  name?: string;
  components: ComponentInstance[];
}

export interface TemplateLayoutJson {
  id?: string;
  name?: string;
  version?: string;
  pages?: PageSchema[];
  components?: ComponentInstance[];
}

export interface RendererProps {
  layoutJson?: TemplateLayoutJson | null;
  selectedComponentId?: string | null;
  onSelectComponent?: (comp: ComponentInstance) => void;
  className?: string;
}
