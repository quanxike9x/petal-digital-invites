import type { TemplateLayoutSchema } from '../schema/TemplateSchema';

/**
 * HISTORY SNAPSHOT INTERFACE (STRICT TYPES - ZERO ANY)
 */
export interface HistorySnapshot {
  layoutJson: TemplateLayoutSchema;
  selectedComponentId: string | null;
}
