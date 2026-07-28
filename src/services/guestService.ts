import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Guest } from '../types';
import { fixVietnamese } from '../utils/vietnameseUtils';

const GUESTS_STORE_KEY = 'pudwedding_guests_store';

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

// Initial Guests List (Starts clean at 0, generated from real users)
const mockGuests: Guest[] = [];

const getLocalGuests = (): Guest[] => {
  const stored = localStorage.getItem(GUESTS_STORE_KEY);
  if (stored) {
    try {
      const parsed: Guest[] = JSON.parse(stored);
      // Filter out legacy demo guests
      const realGuests = parsed.filter((g) => !['gst-1', 'gst-2', 'gst-3'].includes(g.id));
      if (realGuests.length !== parsed.length) {
        localStorage.setItem(GUESTS_STORE_KEY, JSON.stringify(realGuests));
      }
      return realGuests;
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

const saveLocalGuests = (guests: Guest[]) => {
  localStorage.setItem(GUESTS_STORE_KEY, JSON.stringify(guests));
};

export const guestService = {
  // 1. Get Guests strictly by Invitation ID
  getGuestsByInvitationId: async (invitationId: string): Promise<Guest[]> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Guest[];
      }
    }
    const local = getLocalGuests();
    return local.filter((g) => g.invitation_id === invitationId);
  },

  // 2. Add Single Guest
  addGuest: async (
    invitationId: string,
    guestData: {
      guest_name: string;
      gender?: 'male' | 'female' | 'other';
      phone?: string;
      group: string;
      note?: string;
    },
    invitationSlug: string = 'wedding'
  ): Promise<Guest> => {
    const cleanedName = fixVietnamese(guestData.guest_name.trim());
    if (!cleanedName) throw new Error('Tên khách mời không được để rỗng!');

    const existing = await guestService.getGuestsByInvitationId(invitationId);
    
    // Duplicate Check by Name + Phone
    if (guestData.phone?.trim()) {
      const dup = existing.find(
        (g) => g.guest_name.toLowerCase() === cleanedName.toLowerCase() && g.phone === guestData.phone?.trim()
      );
      if (dup) throw new Error(`Khách mời "${cleanedName}" với SĐT ${guestData.phone} đã tồn tại!`);
    }

    // Auto Slug Generation with duplicate handling
    let baseSlug = toSlug(cleanedName) || 'khach-moi';
    let guestSlug = baseSlug;
    let count = 2;
    while (existing.some((g) => g.guest_slug === guestSlug)) {
      guestSlug = `${baseSlug}-${count}`;
      count++;
    }

    const personalUrl = `${window.location.origin}/w/${invitationSlug}/${guestSlug}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(personalUrl)}`;
    const now = new Date().toISOString();

    const newGuest: Guest = {
      id: `gst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invitation_id: invitationId,
      guest_name: cleanedName,
      guest_slug: guestSlug,
      gender: guestData.gender || 'male',
      phone: guestData.phone?.trim() || '',
      group: fixVietnamese(guestData.group) || 'Khác',
      note: fixVietnamese(guestData.note || ''),
      status: 'unopened',
      qr_url: qrUrl,
      personal_url: personalUrl,
      opened_count: 0,
      rsvp_status: 'pending',
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('guests').insert([newGuest]).select().single();
      if (!error && data) return data as Guest;
    }

    const currentList = getLocalGuests();
    const updatedList = [newGuest, ...currentList];
    saveLocalGuests(updatedList);
    return newGuest;
  },

  // 3. Bulk Add Guests from Lines
  bulkAddGuests: async (
    invitationId: string,
    rawNames: string,
    group: string = 'Bạn bè',
    invitationSlug: string = 'wedding'
  ): Promise<number> => {
    const lines = rawNames
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let addedCount = 0;
    for (const name of lines) {
      try {
        await guestService.addGuest(invitationId, { guest_name: name, group }, invitationSlug);
        addedCount++;
      } catch (e) {
        console.warn('Skipped duplicate/invalid guest:', name);
      }
    }
    return addedCount;
  },

  // 4. Update Guest
  updateGuest: async (id: string, updates: Partial<Guest>): Promise<Guest> => {
    const updated_at = new Date().toISOString();
    const payload = { ...updates, updated_at };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('guests').update(payload).eq('id', id).select().single();
      if (!error && data) return data as Guest;
    }

    const currentList = getLocalGuests();
    const updatedList = currentList.map((g) => (g.id === id ? { ...g, ...payload } : g));
    saveLocalGuests(updatedList);
    const found = updatedList.find((g) => g.id === id);
    if (!found) throw new Error('Không tìm thấy khách mời');
    return found;
  },

  // 5. Delete Guest
  deleteGuest: async (id: string): Promise<void> => {
    if (isSupabaseConfigured()) {
      await supabase.from('guests').delete().eq('id', id);
    }
    const currentList = getLocalGuests();
    const updatedList = currentList.filter((g) => g.id !== id);
    saveLocalGuests(updatedList);
  },

  // 6. Record Guest Open Event
  recordGuestOpen: async (guestId: string): Promise<void> => {
    const currentList = getLocalGuests();
    const found = currentList.find((g) => g.id === guestId);
    if (!found) return;

    await guestService.updateGuest(guestId, {
      status: 'opened',
      opened_count: (found.opened_count || 0) + 1,
      viewed_at: new Date().toISOString(),
    });
  },

  // 7. Submit RSVP & Wish
  submitGuestRSVP: async (
    guestId: string,
    rsvpStatus: 'attending' | 'declined',
    rsvpCount: number = 1,
    wish?: string
  ): Promise<Guest> => {
    return guestService.updateGuest(guestId, {
      rsvp_status: rsvpStatus,
      rsvp_count: rsvpCount,
      wish: wish ? fixVietnamese(wish) : undefined,
    });
  },
};
