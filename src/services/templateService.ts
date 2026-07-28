import type { TemplateLayoutSchema } from '../schema/TemplateSchema';
import { TemplateRepository, type TemplateRecord } from '../repositories/TemplateRepository';

/**
 * TEMPLATE SERVICE LAYER
 * Business logic for Version Patching, Dirty State Comparison, and Serialization.
 * Strict TypeScript (Zero Any)
 */
export class TemplateService {
  /**
   * Increments patch version string (e.g., "1.0.0" -> "1.0.1")
   */
  static incrementPatchVersion(versionStr: string = '1.0.0'): string {
    const parts = versionStr.split('.');
    if (parts.length < 3) return '1.0.1';

    const major = parseInt(parts[0], 10) || 1;
    const minor = parseInt(parts[1], 10) || 0;
    const patch = parseInt(parts[2], 10) || 0;

    return `${major}.${minor}.${patch + 1}`;
  }

  /**
   * Compares original layout_json vs current layout_json to detect dirty state (Unsaved changes)
   */
  static isDirty(
    originalLayout: TemplateLayoutSchema | null,
    currentLayout: TemplateLayoutSchema | null
  ): boolean {
    if (!originalLayout || !currentLayout) return false;
    return JSON.stringify(originalLayout) !== JSON.stringify(currentLayout);
  }

  /**
   * Serializes template for persistence (Excludes UI state, selection, history)
   */
  static serialize(
    id: string,
    name: string,
    slug: string,
    version: string,
    layoutJson: TemplateLayoutSchema,
    status: 'draft' | 'published' = 'draft'
  ): TemplateRecord {
    return {
      id,
      name,
      slug,
      version,
      layout_json: JSON.parse(JSON.stringify(layoutJson)),
      metadata: {
        thumbnail: '',
        preview: '',
        status,
      },
      status,
    };
  }
}

/**
 * Legacy Service Object Export for app-wide compatibility
 */
export const templateService = {
  getTemplates: async (_onlyPublished?: boolean) => {
    return [];
  },
  getTemplateById: async (id: string) => {
    return TemplateRepository.loadTemplate(id);
  },
  saveTemplate: async (record: TemplateRecord) => {
    return TemplateRepository.saveTemplate(record);
  },
  saveTemplateDraft: async (payload: Partial<TemplateRecord>) => {
    return TemplateRepository.createTemplate(payload);
  },
  createTemplate: async (record: TemplateRecord) => {
    return TemplateRepository.createTemplate(record);
  },
  updateTemplate: async (id: string, updates: Partial<TemplateRecord>) => {
    return TemplateRepository.updateTemplate(id, updates);
  },
  deleteTemplate: async (id: string) => {
    return TemplateRepository.deleteTemplate(id);
  },
  duplicateTemplate: async (id: string, newId: string, name: string) => {
    return TemplateRepository.duplicateTemplate(id, newId, name);
  },
};
