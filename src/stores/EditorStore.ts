import { useState, useCallback } from 'react';
import type { TemplateLayoutSchema } from '../schema/TemplateSchema';
import { TemplateRepository, type TemplateRecord } from '../repositories/TemplateRepository';
import { TemplateService } from '../services/templateService';
import { toast } from 'sonner';

export type SaveStatus = 'no-changes' | 'unsaved-changes' | 'saving' | 'saved';

/**
 * EDITOR STORE (STATE MANAGEMENT & REPOSITORY INTEGRATION)
 * Strict TypeScript (Zero Any)
 */
export const useEditorStore = (templateId: string, initialLayout: TemplateLayoutSchema) => {
  const [savedLayoutJson, setSavedLayoutJson] = useState<TemplateLayoutSchema>(initialLayout);
  const [version, setVersion] = useState<string>('1.0.0');
  const [templateName, setTemplateName] = useState<string>('Template Editor');
  const [templateSlug, setTemplateSlug] = useState<string>('template-slug');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  /**
   * Load template record from TemplateRepository
   */
  const loadTemplateFromRepo = useCallback(async () => {
    try {
      const record = await TemplateRepository.loadTemplate(templateId);
      if (record) {
        const layout: TemplateLayoutSchema = (record.layout_json && record.layout_json.pages?.length)
          ? record.layout_json
          : {
              id: templateId,
              name: record.name || 'New Template Draft',
              version: record.version || '1.0.0',
              pages: [
                {
                  id: 'page-1',
                  name: 'Trang 1',
                  components: [], // Empty canvas ready for design!
                },
              ],
            };

        setSavedLayoutJson(layout);
        setVersion(record.version || '1.0.0');
        setTemplateName(record.name);
        setTemplateSlug(record.slug);
        return layout;
      }
    } catch {
      toast.error('Unable to load template.');
    }
    return null;
  }, [templateId]);

  /**
   * Save template record down to TemplateRepository
   */
  const saveTemplateToRepo = useCallback(async (currentLayout: TemplateLayoutSchema): Promise<boolean> => {
    setIsSaving(true);
    try {
      // 1. Calculate next Patch Version
      const nextVersion = TemplateService.incrementPatchVersion(version);

      // 2. Serialize template payload
      const payload: TemplateRecord = TemplateService.serialize(
        templateId,
        templateName,
        templateSlug,
        nextVersion,
        currentLayout,
        'draft'
      );

      // 3. Persist down to TemplateRepository
      const savedRecord = await TemplateRepository.saveTemplate(payload);

      if (savedRecord && savedRecord.id) {
        // Instant Dirty State Reset!
        setSavedLayoutJson(JSON.parse(JSON.stringify(currentLayout)));
        setVersion(nextVersion);
        setIsSaving(false);
        setJustSaved(true);
        toast.success(`Saved successfully! Version: ${nextVersion}`);

        // Reset justSaved after 3 seconds
        setTimeout(() => setJustSaved(false), 3000);
        return true;
      } else {
        throw new Error('Save failed');
      }
    } catch {
      setIsSaving(false);
      toast.error('Failed to save template.');
      return false;
    }
  }, [templateId, templateName, templateSlug, version]);

  /**
   * Delete template via TemplateRepository
   */
  const deleteTemplateFromRepo = useCallback(async (): Promise<boolean> => {
    try {
      const success = await TemplateRepository.deleteTemplate(templateId);
      if (success) {
        toast.success('Đã xóa Template thành công!');
        return true;
      }
    } catch {
      toast.error('Lỗi khi xóa Template.');
    }
    return false;
  }, [templateId]);

  /**
   * Compute current Dirty Save Status
   */
  const getSaveStatus = useCallback((currentLayout: TemplateLayoutSchema): SaveStatus => {
    if (isSaving) return 'saving';
    if (justSaved) return 'saved';
    const dirty = TemplateService.isDirty(savedLayoutJson, currentLayout);
    return dirty ? 'unsaved-changes' : 'no-changes';
  }, [savedLayoutJson, isSaving, justSaved]);

  return {
    savedLayoutJson,
    version,
    templateName,
    templateSlug,
    isSaving,
    justSaved,
    loadTemplateFromRepo,
    saveTemplateToRepo,
    deleteTemplateFromRepo,
    getSaveStatus,
  };
};
