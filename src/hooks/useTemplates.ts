import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TemplateRepository, type TemplateRecord } from '../repositories/TemplateRepository';
import type { Template } from '../types';
import { toast } from 'sonner';

export const TEMPLATES_QUERY_KEY = ['templates'];

/**
 * HOOK MANAGING TEMPLATE LISTING & MUTATIONS WITH TEMPLATE REPOSITORY
 * Supabase Database is the Source of Truth.
 * Strict TypeScript (Zero Any)
 */
export const useTemplates = (onlyPublished: boolean = false) => {
  const queryClient = useQueryClient();

  // Query Templates via TemplateRepository
  const templatesQuery = useQuery({
    queryKey: [...TEMPLATES_QUERY_KEY, onlyPublished],
    queryFn: async (): Promise<Template[]> => {
      const records = await TemplateRepository.getTemplates(onlyPublished);

      return records.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        category: 'Modern',
        description: r.description || 'Mẫu thiệp cưới thiết kế tinh tế sang trọng.',
        thumbnail_url: r.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
        cover_url: r.preview || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
        primary_color: '#E11D48',
        is_premium: false,
        is_active: r.published ?? r.status === 'published',
        status: r.status || 'draft',
        version: r.version || '1.0.0',
        created_at: r.created_at || new Date().toISOString(),
      }));
    },
    staleTime: 0,
  });

  const refetchTemplates = async () => {
    await queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
  };

  const createTemplate = async (payload: Partial<TemplateRecord>): Promise<TemplateRecord> => {
    const created = await TemplateRepository.createTemplate(payload);
    toast.success(`Đã lưu Template "${created.name}"!`);
    await refetchTemplates();
    return created;
  };

  const updateTemplate = async ({ id, updates }: { id: string; updates: Partial<TemplateRecord> }): Promise<TemplateRecord | null> => {
    const updated = await TemplateRepository.updateTemplate(id, updates);
    if (updated) {
      toast.success(`Đã cập nhật Template "${updated.name}"!`);
    }
    await refetchTemplates();
    return updated;
  };

  const duplicateTemplate = async (id: string): Promise<TemplateRecord | null> => {
    const duplicated = await TemplateRepository.duplicateTemplate(id);
    if (duplicated) {
      toast.success(`Đã nhân bản Template "${duplicated.name}"!`);
    }
    await refetchTemplates();
    return duplicated;
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    const success = await TemplateRepository.deleteTemplate(id);
    if (success) {
      toast.success('Đã xóa Template thành công!');
    }
    await refetchTemplates();
    return success;
  };

  const bulkDeleteTemplates = async (ids: string[]): Promise<void> => {
    await Promise.all(ids.map((id) => TemplateRepository.deleteTemplate(id)));
    toast.success('Đã xóa các Template đã chọn!');
    await refetchTemplates();
  };

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    isError: templatesQuery.isError,
    refetchTemplates,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    deleteTemplate,
    bulkDeleteTemplates,
  };
};
