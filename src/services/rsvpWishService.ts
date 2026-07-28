import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RSVPRecord, WishRecord, GuestRSVPStatus } from '../types';
import { guestService } from './guestService';
import { invitationService } from './invitationService';
import { fixVietnamese } from '../utils/vietnameseUtils';

const RSVP_STORE_KEY = 'pudwedding_rsvps_store';
const WISHES_STORE_KEY = 'pudwedding_wishes_store';

// Initial Wishes List (Starts clean at 0, generated from real users)
const mockWishes: WishRecord[] = [];

// Local Storage Helpers
const getLocalRSVPs = (): RSVPRecord[] => {
  const stored = localStorage.getItem(RSVP_STORE_KEY);
  if (stored) {
    try {
      const parsed: RSVPRecord[] = JSON.parse(stored);
      return parsed;
    } catch (e) {}
  }
  return [];
};

const saveLocalRSVPs = (items: RSVPRecord[]) => {
  localStorage.setItem(RSVP_STORE_KEY, JSON.stringify(items));
};

const getLocalWishes = (): WishRecord[] => {
  const stored = localStorage.getItem(WISHES_STORE_KEY);
  if (stored) {
    try {
      const parsed: WishRecord[] = JSON.parse(stored);
      // Filter out legacy demo wishes
      const realWishes = parsed.filter((w) => !['wsh-1', 'wsh-2'].includes(w.id));
      if (realWishes.length !== parsed.length) {
        localStorage.setItem(WISHES_STORE_KEY, JSON.stringify(realWishes));
      }
      return realWishes;
    } catch (e) {}
  }
  return [];
};

const saveLocalWishes = (items: WishRecord[]) => {
  localStorage.setItem(WISHES_STORE_KEY, JSON.stringify(items));
};

export const rsvpWishService = {
  // 1. Submit RSVP Confirmation
  submitRSVP: async (payload: {
    invitation_id: string;
    guest_id?: string;
    guest_name: string;
    phone?: string;
    attendance_status: GuestRSVPStatus;
    attendee_count?: number;
    note?: string;
  }): Promise<RSVPRecord> => {
    const cleanedName = fixVietnamese(payload.guest_name.trim());
    if (!cleanedName) throw new Error('Vui lòng nhập họ và tên!');
    if (!payload.attendance_status) throw new Error('Vui lòng chọn trạng thái xác nhận tham dự!');

    let count = payload.attendee_count ?? 1;
    if (payload.attendance_status === 'attending' && count < 1) {
      count = 1;
    } else if (payload.attendance_status === 'declined') {
      count = 0;
    }

    const newRSVP: RSVPRecord = {
      id: `rsvp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invitation_id: payload.invitation_id,
      guest_id: payload.guest_id,
      guest_name: cleanedName,
      phone: payload.phone?.trim() || '',
      attendance_status: payload.attendance_status,
      attendee_count: count,
      note: payload.note ? fixVietnamese(payload.note) : undefined,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('rsvps').insert([newRSVP]).select().single();
      if (!error && data) {
        if (payload.guest_id) {
          await guestService.updateGuest(payload.guest_id, {
            rsvp_status: payload.attendance_status,
            rsvp_count: count,
            phone: payload.phone || undefined,
            note: payload.note || undefined,
            rsvp_time: newRSVP.created_at,
          });
        }
        return data as RSVPRecord;
      }
    }

    const current = getLocalRSVPs();
    const updated = [newRSVP, ...current];
    saveLocalRSVPs(updated);

    if (payload.guest_id) {
      await guestService.updateGuest(payload.guest_id, {
        rsvp_status: payload.attendance_status,
        rsvp_count: count,
        phone: payload.phone || undefined,
        note: payload.note || undefined,
        rsvp_time: newRSVP.created_at,
      });
    }

    return newRSVP;
  },

  // 2. Submit Wedding Wish
  submitWish: async (payload: {
    invitation_id: string;
    guest_id?: string;
    guest_name: string;
    message: string;
  }): Promise<WishRecord> => {
    const cleanedName = fixVietnamese(payload.guest_name.trim());
    const cleanedMessage = fixVietnamese(payload.message.trim());

    if (!cleanedName) throw new Error('Vui lòng nhập tên người gửi lời chúc!');
    if (!cleanedMessage) throw new Error('Vui lòng nhập nội dung lời chúc!');

    // Check invitation moderation settings
    const inv = await invitationService.getInvitationById(payload.invitation_id);
    const autoApprove = inv?.auto_approve_wishes !== false; // Default true

    const newWish: WishRecord = {
      id: `wsh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invitation_id: payload.invitation_id,
      guest_id: payload.guest_id,
      guest_name: cleanedName,
      message: cleanedMessage,
      is_approved: autoApprove,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('wishes').insert([newWish]).select().single();
      if (!error && data) {
        if (payload.guest_id) {
          await guestService.updateGuest(payload.guest_id, { wish: cleanedMessage, wish_approved: autoApprove });
        }
        return data as WishRecord;
      }
    }

    const current = getLocalWishes();
    const updated = [newWish, ...current];
    saveLocalWishes(updated);

    if (payload.guest_id) {
      await guestService.updateGuest(payload.guest_id, { wish: cleanedMessage, wish_approved: autoApprove });
    }

    return newWish;
  },

  // 3. Get Wishes for Invitation
  getWishesByInvitationId: async (invitationId: string, includeUnapproved: boolean = false): Promise<WishRecord[]> => {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('wishes')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('created_at', { ascending: false });

      if (!includeUnapproved) {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;
      if (!error && data) return data as WishRecord[];
    }

    const local = getLocalWishes();
    const list = local.filter((w) => w.invitation_id === invitationId);
    if (!includeUnapproved) {
      return list.filter((w) => w.is_approved);
    }
    return list;
  },

  // 4. Approve Wish (Moderation)
  approveWish: async (wishId: string): Promise<WishRecord> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('wishes')
        .update({ is_approved: true })
        .eq('id', wishId)
        .select()
        .single();
      if (!error && data) return data as WishRecord;
    }

    const current = getLocalWishes();
    let found: WishRecord | null = null;
    const updated = current.map((w) => {
      if (w.id === wishId) {
        found = { ...w, is_approved: true };
        return found;
      }
      return w;
    });
    saveLocalWishes(updated);
    if (!found) throw new Error('Lời chúc không tồn tại');
    return found;
  },

  // 5. Delete Wish
  deleteWish: async (wishId: string): Promise<void> => {
    if (isSupabaseConfigured()) {
      await supabase.from('wishes').delete().eq('id', wishId);
    }
    const current = getLocalWishes();
    const updated = current.filter((w) => w.id !== wishId);
    saveLocalWishes(updated);
  },

  // 6. Get Aggregated RSVP & Wishes Stats for Dashboard & Guest Manager
  getRSVPStats: async (invitationId: string) => {
    const guests = await guestService.getGuestsByInvitationId(invitationId);
    const wishes = await rsvpWishService.getWishesByInvitationId(invitationId, true);

    const totalGuests = guests.length;
    const attendingGuests = guests.filter((g) => g.rsvp_status === 'attending');
    const declinedGuests = guests.filter((g) => g.rsvp_status === 'declined');
    const pendingGuests = guests.filter((g) => g.rsvp_status === 'pending');

    const totalHeadcount = attendingGuests.reduce((sum, g) => sum + (g.rsvp_count || 1), 0);
    const totalWishes = wishes.length;
    const unapprovedWishesCount = wishes.filter((w) => !w.is_approved).length;

    return {
      totalGuests,
      respondedCount: attendingGuests.length + declinedGuests.length,
      attendingCount: attendingGuests.length,
      totalHeadcount,
      declinedCount: declinedGuests.length,
      pendingCount: pendingGuests.length,
      totalWishes,
      unapprovedWishesCount,
    };
  },
};
