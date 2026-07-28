import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationService } from '../services/invitationService';
import type { Invitation, CreateInvitationPayload, UpdateInvitationPayload } from '../types';
import { toast } from 'sonner';

export const INVITATIONS_QUERY_KEY = ['invitations'];

export const useInvitations = (userId?: string) => {
  const queryClient = useQueryClient();

  // Fetch Query
  const invitationsQuery = useQuery({
    queryKey: INVITATIONS_QUERY_KEY,
    queryFn: () => invitationService.getInvitations(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Create Mutation (Optimistic Update + Toast)
  const createMutation = useMutation({
    mutationFn: (payload: CreateInvitationPayload) => invitationService.createInvitation(payload, userId),
    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: INVITATIONS_QUERY_KEY });
      const previousInvitations = queryClient.getQueryData<Invitation[]>(INVITATIONS_QUERY_KEY);

      // Create optimistic item
      const optimisticInvitation: Invitation = {
        id: `temp-${Date.now()}`,
        user_id: userId || 'usr-1',
        template_id: newPayload.template_id,
        title: newPayload.title,
        slug: 'creating...',
        status: 'draft',
        plan_type: 'trial',
        thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        days_left: 3,
      };

      queryClient.setQueryData<Invitation[]>(INVITATIONS_QUERY_KEY, (old = []) => [
        optimisticInvitation,
        ...old,
      ]);

      return { previousInvitations };
    },
    onError: (err, _newPayload, context) => {
      if (context?.previousInvitations) {
        queryClient.setQueryData(INVITATIONS_QUERY_KEY, context.previousInvitations);
      }
      toast.error(`Tạo thiệp thất bại: ${err.message}`);
    },
    onSuccess: (data) => {
      toast.success(`Đã tạo thiệp "${data.title}" (Gói dùng thử 3 ngày)`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
  });

  // Update Mutation (Rename, Status)
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateInvitationPayload }) =>
      invitationService.updateInvitation(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: INVITATIONS_QUERY_KEY });
      const previousInvitations = queryClient.getQueryData<Invitation[]>(INVITATIONS_QUERY_KEY);

      queryClient.setQueryData<Invitation[]>(INVITATIONS_QUERY_KEY, (old = []) =>
        old.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
      );

      return { previousInvitations };
    },
    onError: (err, _variables, context) => {
      if (context?.previousInvitations) {
        queryClient.setQueryData(INVITATIONS_QUERY_KEY, context.previousInvitations);
      }
      toast.error(`Cập nhật thất bại: ${err.message}`);
    },
    onSuccess: (data) => {
      toast.success(`Đã cập nhật thiệp "${data.title}"`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
  });

  // Duplicate Mutation
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => invitationService.duplicateInvitation(id),
    onSuccess: (data) => {
      toast.success(`Đã nhân bản thiệp: "${data.title}"`);
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(`Nhân bản thất bại: ${err.message}`);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => invitationService.deleteInvitation(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: INVITATIONS_QUERY_KEY });
      const previousInvitations = queryClient.getQueryData<Invitation[]>(INVITATIONS_QUERY_KEY);

      queryClient.setQueryData<Invitation[]>(INVITATIONS_QUERY_KEY, (old = []) =>
        old.filter((inv) => inv.id !== id)
      );

      return { previousInvitations };
    },
    onError: (err, _id, context) => {
      if (context?.previousInvitations) {
        queryClient.setQueryData(INVITATIONS_QUERY_KEY, context.previousInvitations);
      }
      toast.error(`Xóa thiệp thất bại: ${err.message}`);
    },
    onSuccess: () => {
      toast.success('Đã xóa thiệp thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
  });

  // Publish / Unpublish Toggle Mutation
  const publishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      invitationService.publishInvitation(id, isPublished),
    onSuccess: (data) => {
      if (data.status === 'published') {
        toast.success(`Đã xuất bản thiệp "${data.title}"!`);
      } else {
        toast.info(`Đã chuyển thiệp "${data.title}" về bản nháp.`);
      }
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
  });

  return {
    invitations: invitationsQuery.data || [],
    isLoading: invitationsQuery.isLoading,
    isError: invitationsQuery.isError,
    error: invitationsQuery.error,
    createInvitation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateInvitation: updateMutation.mutateAsync,
    duplicateInvitation: duplicateMutation.mutateAsync,
    deleteInvitation: deleteMutation.mutateAsync,
    publishInvitation: publishMutation.mutateAsync,
  };
};
