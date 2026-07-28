import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Invitation, CreateInvitationPayload } from '../types';
import { mockInvitations } from '../data/mockData';
import { templateService } from './templateService';

const INVITATIONS_STORE_KEY = 'chungdoi_invitations_store';

const toSlug = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/^-+|-+$/g, '');
};

const isValidUuid = (id?: string): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const calculateTrialInfo = (invitation: Invitation): Invitation => {
  if (invitation.payment_status === 'paid') {
    return { ...invitation, days_left: 365, is_expired: false };
  }

  const now = new Date();
  const trialEnd = new Date(invitation.trial_end || invitation.expires_at || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString());
  const diffTime = trialEnd.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffTime <= 0;

  return {
    ...invitation,
    days_left: Math.max(0, daysLeft),
    is_expired: isExpired,
    payment_status: isExpired && invitation.payment_status !== 'paid' ? 'expired' : invitation.payment_status || 'trial',
  };
};

const mapDatabaseToInvitation = (row: any): Invitation => {
  const invitationJson = row.invitation_json || {};
  const brideName = invitationJson.bride_name || row.bride_name || 'Cô Dâu';
  const brideParent = invitationJson.bride_parent || row.bride_parent || 'Gia đình Nhà Gái';
  const groomName = invitationJson.groom_name || row.groom_name || 'Chú Rể';
  const groomParent = invitationJson.groom_parent || row.groom_parent || 'Gia đình Nhà Trai';
  const story = invitationJson.story || row.story || '';
  const weddingDate = invitationJson.wedding_date || row.wedding_date || '';
  const ceremonyTime = invitationJson.ceremony_time || row.ceremony_time || '';
  const receptionTime = invitationJson.reception_time || row.reception_time || '';
  const venueName = invitationJson.venue_name || row.venue_name || '';
  const address = invitationJson.address || row.address || '';
  const googleMap = invitationJson.google_map || row.google_map || '';
  const gallery = invitationJson.gallery || row.gallery || [];
  const music = invitationJson.music || row.music || '';
  const bankName = invitationJson.bank_name || row.bank_name || '';
  const accountName = invitationJson.account_name || row.account_name || '';
  const accountNumber = invitationJson.account_number || row.account_number || '';
  const groomBankName = invitationJson.groom_bank_name || row.groom_bank_name || bankName;
  const groomAccountName = invitationJson.groom_account_name || row.groom_account_name || accountName;
  const groomAccountNumber = invitationJson.groom_account_number || row.groom_account_number || accountNumber;
  const brideBankName = invitationJson.bride_bank_name || row.bride_bank_name || bankName;
  const brideAccountName = invitationJson.bride_account_name || row.bride_account_name || accountName;
  const brideAccountNumber = invitationJson.bride_account_number || row.bride_account_number || accountNumber;
  const qrImage = invitationJson.qr_image || row.qr_image || '';
  const themeColor = invitationJson.theme_color || row.theme_color || '#E11D48';
  const font = invitationJson.font || row.font || 'Playfair Display';
  const autoApproveWishes = invitationJson.auto_approve_wishes ?? true;

  const rawInvitation: Invitation = {
    id: row.id,
    template_id: row.template_id,
    created_by: row.created_by || row.user_id,
    title: row.title || `${brideName} & ${groomName}`,
    slug: row.slug,
    invitation_json: invitationJson,
    status: row.status || 'draft',
    is_trial: row.is_trial ?? true,
    expires_at: row.expires_at || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: row.published_at,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),

    // Derived Virtual Properties for UI compatibility
    user_id: row.created_by || row.user_id,
    bride_name: brideName,
    bride_parent: brideParent,
    groom_name: groomName,
    groom_parent: groomParent,
    story,
    wedding_date: weddingDate,
    ceremony_time: ceremonyTime,
    reception_time: receptionTime,
    venue_name: venueName,
    address,
    google_map: googleMap,
    gallery,
    music,
    bank_name: bankName,
    account_name: accountName,
    account_number: accountNumber,
    groom_bank_name: groomBankName,
    groom_account_name: groomAccountName,
    groom_account_number: groomAccountNumber,
    bride_bank_name: brideBankName,
    bride_account_name: brideAccountName,
    bride_account_number: brideAccountNumber,
    qr_image: qrImage,
    theme_color: themeColor,
    font,
    payment_status: row.payment_status || (row.is_trial ? 'trial' : 'paid'),
    trial_start: row.created_at || new Date().toISOString(),
    trial_end: row.expires_at || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    domain_id: 'pudwedding.shop',
    views_count: row.views_count || 0,
    thumbnail_url: invitationJson.thumbnail_url || row.thumbnail_url,
    auto_approve_wishes: autoApproveWishes,
  };

  return calculateTrialInfo(rawInvitation);
};

const constructInvitationDbPayload = (payload: Partial<Invitation>, userId: string) => {
  const now = new Date().toISOString();
  const trialEnd = payload.expires_at || payload.trial_end || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const existingJson = payload.invitation_json || {};

  // Package ALL editable invitation content into invitation_json
  const invitationJson = {
    ...existingJson,
    bride_name: payload.bride_name ?? existingJson.bride_name ?? 'Cô Dâu',
    bride_parent: payload.bride_parent ?? existingJson.bride_parent ?? 'Gia đình Nhà Gái',
    groom_name: payload.groom_name ?? existingJson.groom_name ?? 'Chú Rể',
    groom_parent: payload.groom_parent ?? existingJson.groom_parent ?? 'Gia đình Nhà Trai',
    story: payload.story ?? existingJson.story ?? '',
    wedding_date: payload.wedding_date ?? existingJson.wedding_date ?? '',
    ceremony_time: payload.ceremony_time ?? existingJson.ceremony_time ?? '',
    reception_time: payload.reception_time ?? existingJson.reception_time ?? '',
    venue_name: payload.venue_name ?? existingJson.venue_name ?? '',
    address: payload.address ?? existingJson.address ?? '',
    google_map: payload.google_map ?? existingJson.google_map ?? '',
    gallery: payload.gallery ?? existingJson.gallery ?? [],
    videos: existingJson.videos ?? [],
    music: payload.music ?? existingJson.music ?? '',
    bank_name: payload.bank_name ?? existingJson.bank_name ?? '',
    account_name: payload.account_name ?? existingJson.account_name ?? '',
    account_number: payload.account_number ?? existingJson.account_number ?? '',
    groom_bank_name: payload.groom_bank_name ?? existingJson.groom_bank_name ?? payload.bank_name ?? existingJson.bank_name ?? '',
    groom_account_name: payload.groom_account_name ?? existingJson.groom_account_name ?? payload.account_name ?? existingJson.account_name ?? '',
    groom_account_number: payload.groom_account_number ?? existingJson.groom_account_number ?? payload.account_number ?? existingJson.account_number ?? '',
    bride_bank_name: payload.bride_bank_name ?? existingJson.bride_bank_name ?? payload.bank_name ?? existingJson.bank_name ?? '',
    bride_account_name: payload.bride_account_name ?? existingJson.bride_account_name ?? payload.account_name ?? existingJson.account_name ?? '',
    bride_account_number: payload.bride_account_number ?? existingJson.bride_account_number ?? payload.account_number ?? existingJson.account_number ?? '',
    qr_image: payload.qr_image ?? existingJson.qr_image ?? '',
    theme_color: payload.theme_color ?? existingJson.theme_color ?? '#E11D48',
    font: payload.font ?? existingJson.font ?? 'Playfair Display',
    auto_approve_wishes: payload.auto_approve_wishes ?? existingJson.auto_approve_wishes ?? true,
    sections: existingJson.sections || [],
    components: existingJson.components || [],
    styles: existingJson.styles || {},
    layout: existingJson.layout || {},
    animations: existingJson.animations || {},
    settings: existingJson.settings || {},
  };

  const title = payload.title || `${invitationJson.bride_name} & ${invitationJson.groom_name}`;
  const baseSlug = `${toSlug(invitationJson.bride_name)}-${toSlug(invitationJson.groom_name)}`;
  const slug = payload.slug || `${baseSlug}-${Date.now().toString().slice(-6)}`;

  // STRICT 12 ALLOWED DATABASE COLUMNS ONLY:
  const dbPayload: any = {
    template_id: payload.template_id || '',
    created_by: userId,
    title,
    slug,
    invitation_json: invitationJson,
    status: payload.status || 'draft',
    is_trial: payload.is_trial ?? true,
    expires_at: trialEnd,
    updated_at: now,
  };

  if (payload.published_at) {
    dbPayload.published_at = payload.published_at;
  } else if (payload.status === 'published') {
    dbPayload.published_at = now;
  }

  return dbPayload;
};

const getLocalInvitations = (): Invitation[] => {
  const stored = localStorage.getItem(INVITATIONS_STORE_KEY);
  if (stored) {
    try {
      const parsed: Invitation[] = JSON.parse(stored);
      const cleanRealInvitations = parsed.filter((i) => !['inv-1', 'inv-2', 'inv-3', 'inv-4'].includes(i.id));
      if (cleanRealInvitations.length !== parsed.length) {
        localStorage.setItem(INVITATIONS_STORE_KEY, JSON.stringify(cleanRealInvitations));
      }
      return cleanRealInvitations.map(calculateTrialInfo);
    } catch (e) {
      console.error(e);
    }
  }
  const processed = mockInvitations.map(calculateTrialInfo);
  localStorage.setItem(INVITATIONS_STORE_KEY, JSON.stringify(processed));
  return processed;
};

const saveLocalInvitations = (invitations: Invitation[]) => {
  localStorage.setItem(INVITATIONS_STORE_KEY, JSON.stringify(invitations));
};

export const invitationService = {
  // 1. Anti-Trial-Abuse Check
  canCreateTrialInvitation: async (userId: string): Promise<{ allowed: boolean; message?: string }> => {
    const list = await invitationService.getInvitations(userId);
    const activeTrialOrExpired = list.find(
      (inv) => inv.payment_status === 'trial' || inv.payment_status === 'expired' || inv.is_expired
    );

    if (activeTrialOrExpired && activeTrialOrExpired.payment_status !== 'paid') {
      return {
        allowed: false,
        message: 'Bạn đang có một thiệp dùng thử. Vui lòng thanh toán hoặc xóa thiệp hiện tại trước khi tạo thiệp mới.',
      };
    }

    return { allowed: true };
  },

  // 2. Get Invitations by User
  getInvitations: async (userId?: string): Promise<Invitation[]> => {
    if (isSupabaseConfigured()) {
      let query = supabase.from('invitations').select('*').order('created_at', { ascending: false });
      if (userId && isValidUuid(userId)) {
        query = query.or(`created_by.eq.${userId}`);
      }
      const { data, error } = await query;
      if (!error && data) {
        return (data as any[]).map(mapDatabaseToInvitation);
      }
    }
    const local = getLocalInvitations();
    if (userId) {
      return local.filter((i) => i.user_id === userId || i.created_by === userId || i.user_id === 'usr-1');
    }
    return local;
  },

  // 3. Get Single Invitation by ID
  getInvitationById: async (id: string): Promise<Invitation | null> => {
    if (isSupabaseConfigured() && isValidUuid(id)) {
      const { data, error } = await supabase.from('invitations').select('*').eq('id', id).single();
      if (!error && data) {
        return mapDatabaseToInvitation(data);
      }
    }
    const local = getLocalInvitations();
    const found = local.find((i) => i.id === id);
    return found ? calculateTrialInfo(found) : null;
  },

  // 4. Get Single Invitation by Slug for Public Webpage
  getInvitationBySlug: async (slug: string): Promise<Invitation | null> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('invitations').select('*').eq('slug', slug).single();
      if (!error && data) {
        return mapDatabaseToInvitation(data);
      }
    }
    const local = getLocalInvitations();
    const found = local.find((i) => i.slug === slug || i.slug.includes(slug));
    return found ? calculateTrialInfo(found) : null;
  },

  // 5. Create NEW Invitation from Template (OMITTING 'id' field, Postgres gen_random_uuid())
  createInvitationFromTemplate: async (
    templateId: string,
    userId: string,
    brideName?: string,
    groomName?: string
  ): Promise<Invitation> => {
    // Read selected template from public.templates
    const template = await templateService.getTemplateById(templateId);
    const templateJson = template?.template_json || {};

    const bName = brideName?.trim() || 'Cô Dâu';
    const gName = groomName?.trim() || 'Chú Rể';
    const title = brideName && groomName ? `${bName} & ${gName}` : (template?.name ? `Thiệp Cưới - ${template.name}` : 'Thiệp Cưới Mới');

    // Combine template_json with initial invitation fields inside invitation_json
    const initialInvitationJson = {
      ...JSON.parse(JSON.stringify(templateJson)),
      bride_name: bName,
      bride_parent: 'Gia đình Nhà Gái',
      groom_name: gName,
      groom_parent: 'Gia đình Nhà Trai',
      story: 'Hành trình vạn dặm bắt đầu từ một bước chân, và tình yêu đẹp nhất bắt đầu từ hai trái tim chung nhịp.',
      wedding_date: '2026-10-24',
      ceremony_time: '11:00 AM',
      reception_time: '06:00 PM',
      venue_name: 'Trung Tâm Hội Nghị Đại Nam',
      address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      google_map: 'https://maps.google.com/?q=DaiNam',
      gallery: [
        template?.thumbnail_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800',
        template?.preview_url || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800',
      ],
      music: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
      bank_name: 'MB Bank',
      account_name: gName.toUpperCase(),
      account_number: '1018920192',
      theme_color: template?.primary_color || '#E11D48',
      font: 'Playfair Display',
      thumbnail_url: template?.thumbnail_url,
    };

    const initialPayload: Partial<Invitation> = {
      template_id: templateId,
      title,
      invitation_json: initialInvitationJson,
      status: 'draft',
      is_trial: true,
      bride_name: bName,
      groom_name: gName,
    };

    const dbPayload = constructInvitationDbPayload(initialPayload, isValidUuid(userId) ? userId : '00000000-0000-0000-0000-000000000000');

    if (isSupabaseConfigured()) {
      // OMIT 'id' field so PostgreSQL generates UUID
      const { data, error } = await supabase
        .from('invitations')
        .insert([dbPayload])
        .select()
        .single();

      // Show exact Supabase error if INSERT fails
      if (error) {
        console.error('Supabase INSERT invitation error:', error);
        throw new Error(`Lỗi Supabase INSERT: ${error.message} (${error.details || error.code || ''})`);
      }

      if (data) {
        return mapDatabaseToInvitation(data);
      }
    }

    const fallbackInv: Invitation = {
      id: `inv-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...initialPayload,
    } as Invitation;
    const currentList = getLocalInvitations();
    saveLocalInvitations([fallbackInv, ...currentList]);
    return calculateTrialInfo(fallbackInv);
  },

  // 6. Create New Invitation wrapper
  createInvitation: async (payload: CreateInvitationPayload, userId: string = 'usr-1'): Promise<Invitation> => {
    return invitationService.createInvitationFromTemplate(
      payload.template_id || '',
      userId,
      payload.bride_name,
      payload.groom_name
    );
  },

  // 7. Update Invitation (Updates ONLY allowed columns in public.invitations table)
  updateInvitation: async (id: string, updates: Partial<Invitation>): Promise<Invitation> => {
    if (!id || id === 'new') {
      throw new Error('ID thiệp không hợp lệ để cập nhật');
    }
    const existing = await invitationService.getInvitationById(id);
    const userId = existing?.created_by || existing?.user_id || '00000000-0000-0000-0000-000000000000';
    const dbPayload = constructInvitationDbPayload({ ...existing, ...updates }, userId);

    if (isSupabaseConfigured() && isValidUuid(id)) {
      const { data, error } = await supabase
        .from('invitations')
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase UPDATE invitation error:', error);
        throw new Error(`Lỗi Supabase UPDATE: ${error.message} (${error.details || error.code || ''})`);
      }

      if (data) {
        return mapDatabaseToInvitation(data);
      }
    }

    const currentList = getLocalInvitations();
    const updatedList = currentList.map((inv) => {
      if (inv.id === id) {
        return { ...inv, ...updates };
      }
      return inv;
    });
    saveLocalInvitations(updatedList);

    const found = updatedList.find((i) => i.id === id);
    if (!found) throw new Error('Không tìm thấy thiệp cưới để cập nhật');
    return calculateTrialInfo(found);
  },

  // 8. Publish Invitation
  publishInvitation: async (id: string): Promise<Invitation> => {
    const current = await invitationService.getInvitationById(id);
    if (!current) throw new Error('Không tìm thấy thiệp cưới để xuất bản');

    // Prompt 17 Strict Validation Requirements Before Publish
    if (!current.bride_name?.trim()) throw new Error('Vui lòng nhập Tên Cô Dâu trước khi xuất bản!');
    if (!current.groom_name?.trim()) throw new Error('Vui lòng nhập Tên Chú Rể trước khi xuất bản!');
    if (!current.wedding_date?.trim()) throw new Error('Vui lòng chọn Ngày Tổ Chức Cưới trước khi xuất bản!');
    if (!current.venue_name?.trim() && !current.address?.trim()) throw new Error('Vui lòng nhập Địa Điểm Tổ Chức Cưới trước khi xuất bản!');

    const gallery = current.gallery || current.invitation_json?.gallery || [];
    if (gallery.length > 20) {
      throw new Error(`Album ảnh hiện có ${gallery.length} ảnh. Giới hạn tối đa 20 ảnh per invitation!`);
    }

    let slug = current.slug;
    if (!slug) {
      slug = `${toSlug(current.bride_name)}-${toSlug(current.groom_name)}`;
    }

    return invitationService.updateInvitation(id, {
      status: 'published',
      published_at: new Date().toISOString(),
      slug,
    });
  },

  // 9. Delete Invitation
  deleteInvitation: async (id: string): Promise<void> => {
    if (isSupabaseConfigured() && isValidUuid(id)) {
      const { error } = await supabase.from('invitations').delete().eq('id', id);
      if (error) {
        console.error('Supabase DELETE error:', error);
        throw new Error(`Lỗi Supabase DELETE: ${error.message} (${error.code || ''})`);
      }
    }

    const currentList = getLocalInvitations();
    const updatedList = currentList.filter((i) => i.id !== id);
    saveLocalInvitations(updatedList);
  },
};
