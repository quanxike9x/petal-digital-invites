import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MediaItem, MediaType } from '../types';
import { imageOptimizer } from './imageOptimizer';
import { invitationService } from './invitationService';
import { fixVietnamese } from '../utils/vietnameseUtils';

import { storageService } from './storageService';

const MEDIA_STORE_KEY = 'pudwedding_media_store';

// Media Limits per Invitation (Maximum 20 images per invitation specification)
export const MEDIA_LIMITS = {
  image: 20,
  video: 5,
  music: 10,
};

// Allowed Format Mime Types
const ALLOWED_FORMATS = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  music: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac', 'audio/x-m4a'],
};

// Initial Media List (Starts clean at 0, generated from real users)
const mockMediaItems: MediaItem[] = [];

const getLocalMedia = (): MediaItem[] => {
  const stored = localStorage.getItem(MEDIA_STORE_KEY);
  if (stored) {
    try {
      const parsed: MediaItem[] = JSON.parse(stored);
      // Filter out legacy demo media
      const realMedia = parsed.filter((m) => !['med-1', 'med-2', 'med-3'].includes(m.id));
      if (realMedia.length !== parsed.length) {
        localStorage.setItem(MEDIA_STORE_KEY, JSON.stringify(realMedia));
      }
      return realMedia;
    } catch (e) {}
  }
  return [];
};

const saveLocalMedia = (items: MediaItem[]) => {
  localStorage.setItem(MEDIA_STORE_KEY, JSON.stringify(items));
};

export const mediaService = {
  // 1. Get Media items by Invitation ID & Type
  getMediaByInvitationId: async (invitationId: string, type?: MediaType): Promise<MediaItem[]> => {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('media')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('sort_order', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      if (!error && data) return data as MediaItem[];
    }

    const local = getLocalMedia();
    const list = local.filter((m) => m.invitation_id === invitationId);
    if (type) {
      return list.filter((m) => m.type === type).sort((a, b) => a.sort_order - b.sort_order);
    }
    return list.sort((a, b) => a.sort_order - b.sort_order);
  },

  // 2. Upload Media File with Format Validation, Limit Check, & Multi-Resolution Compression
  uploadMedia: async (
    invitationId: string,
    file: File,
    type: MediaType,
    onProgress?: (percent: number) => void
  ): Promise<MediaItem> => {
    // Validate File Format
    const allowed = ALLOWED_FORMATS[type];
    const fileMime = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    const isAllowedMime = allowed.some((ext) => fileMime.includes(ext.replace('image/', '').replace('video/', '').replace('audio/', '')));
    const isAllowedExt =
      type === 'image'
        ? /\.(jpg|jpeg|png|webp)$/i.test(fileName)
        : type === 'video'
        ? /\.(mp4|mov|webm)$/i.test(fileName)
        : /\.(mp3|wav|aac|m4a)$/i.test(fileName);

    if (!isAllowedMime && !isAllowedExt) {
      throw new Error(`Định dạng file không được hỗ trợ! Vui lòng chọn tệp ${type.toUpperCase()} hợp lệ.`);
    }

    // Validate Limit Count per Invitation
    const existing = await mediaService.getMediaByInvitationId(invitationId, type);
    const limit = MEDIA_LIMITS[type];
    if (existing.length >= limit) {
      throw new Error(`Đã đạt giới hạn tối đa ${limit} file ${type} cho thiệp này!`);
    }

    if (onProgress) onProgress(20);

    const timeStamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `invitations/${invitationId}/${type}s/${timeStamp}_${cleanFileName}`;

    let publicUrl = '';
    let thumbnailUrl = '';
    let mediumUrl = '';

    // If Image, generate 3 compressed versions (Thumbnail, Medium, Original)
    if (type === 'image') {
      if (onProgress) onProgress(40);
      const tiers = await imageOptimizer.processImageTiers(file);
      publicUrl = tiers.originalUrl;
      mediumUrl = tiers.mediumUrl;
      thumbnailUrl = tiers.thumbnailUrl;
      if (onProgress) onProgress(70);
    } else {
      // For Video & Music, create Object URL or Read as Data URL
      if (onProgress) onProgress(60);
      publicUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve(evt.target?.result as string);
        reader.readAsDataURL(file);
      });
      thumbnailUrl = publicUrl;
      mediumUrl = publicUrl;
    }

    // Try Supabase Storage Upload if configured
    if (isSupabaseConfigured()) {
      try {
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(storagePath, file, { upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage.from('media').getPublicUrl(storagePath);
          if (data?.publicUrl) {
            publicUrl = data.publicUrl;
            if (type !== 'image') {
              thumbnailUrl = publicUrl;
              mediumUrl = publicUrl;
            }
          }
        }
      } catch (e) {
        console.warn('Supabase storage upload fallback to local data URL.');
      }
    }

    if (onProgress) onProgress(90);

    const newMedia: MediaItem = {
      id: `med-${timeStamp}-${Math.floor(Math.random() * 1000)}`,
      invitation_id: invitationId,
      type,
      file_name: file.name,
      storage_path: storagePath,
      public_url: publicUrl,
      thumbnail_url: thumbnailUrl,
      medium_url: mediumUrl,
      size: file.size,
      mime_type: file.type || `${type}/*`,
      sort_order: existing.length + 1,
      caption: fixVietnamese(file.name.split('.')[0]),
      is_cover: type === 'image' && existing.length === 0,
      is_default: type === 'music' && existing.length === 0,
      settings:
        type === 'video'
          ? { autoplay: false, loop: true, muted: true }
          : type === 'music'
          ? { autoplay: true, loop: true, volume: 80 }
          : undefined,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('media').insert([newMedia]).select().single();
      if (!error && data) {
        await mediaService.syncInvitationMedia(invitationId);
        if (onProgress) onProgress(100);
        return data as MediaItem;
      }
    }

    const current = getLocalMedia();
    const updated = [newMedia, ...current];
    saveLocalMedia(updated);

    // Sync Gallery array & music URL on invitation record
    await mediaService.syncInvitationMedia(invitationId);
    if (onProgress) onProgress(100);

    return newMedia;
  },

  // 3. Reorder Media Items (HTML5 Drag & Drop)
  reorderMedia: async (invitationId: string, mediaIdsInOrder: string[]): Promise<void> => {
    const current = getLocalMedia();
    const updated = current.map((item) => {
      if (item.invitation_id === invitationId || invitationId === 'inv-1') {
        const newIndex = mediaIdsInOrder.indexOf(item.id);
        if (newIndex !== -1) {
          return { ...item, sort_order: newIndex + 1 };
        }
      }
      return item;
    });

    saveLocalMedia(updated);

    if (isSupabaseConfigured()) {
      for (let i = 0; i < mediaIdsInOrder.length; i++) {
        await supabase.from('media').update({ sort_order: i + 1 }).eq('id', mediaIdsInOrder[i]);
      }
    }

    await mediaService.syncInvitationMedia(invitationId);
  },

  // 4. Set Selected Image as Cover Photo
  setCoverImage: async (invitationId: string, mediaId: string): Promise<void> => {
    const current = getLocalMedia();
    let selectedCoverUrl = '';

    const updated = current.map((item) => {
      if (item.invitation_id === invitationId || invitationId === 'inv-1') {
        if (item.type === 'image') {
          const isTarget = item.id === mediaId;
          if (isTarget) selectedCoverUrl = item.medium_url || item.public_url;
          return { ...item, is_cover: isTarget };
        }
      }
      return item;
    });

    saveLocalMedia(updated);

    if (selectedCoverUrl) {
      await invitationService.updateInvitation(invitationId, { thumbnail_url: selectedCoverUrl });
    }
  },

  // 5. Set Selected Track as Default Music
  setDefaultMusic: async (invitationId: string, mediaId: string): Promise<void> => {
    const current = getLocalMedia();
    let selectedMusicUrl = '';

    const updated = current.map((item) => {
      if (item.invitation_id === invitationId || invitationId === 'inv-1') {
        if (item.type === 'music') {
          const isTarget = item.id === mediaId;
          if (isTarget) selectedMusicUrl = item.public_url;
          return { ...item, is_default: isTarget };
        }
      }
      return item;
    });

    saveLocalMedia(updated);

    if (selectedMusicUrl) {
      await invitationService.updateInvitation(invitationId, { music: selectedMusicUrl });
    }
  },

  // 6. Update Media Item Caption or Player Settings
  updateMediaItem: async (mediaId: string, updates: Partial<MediaItem>): Promise<MediaItem> => {
    const current = getLocalMedia();
    let found: MediaItem | null = null;

    const updated = current.map((item) => {
      if (item.id === mediaId) {
        found = { ...item, ...updates };
        return found;
      }
      return item;
    });

    saveLocalMedia(updated);

    if (isSupabaseConfigured()) {
      await supabase.from('media').update(updates).eq('id', mediaId);
    }

    if (found) {
      await mediaService.syncInvitationMedia((found as MediaItem).invitation_id);
      return found as MediaItem;
    }
    throw new Error('Media file không tồn tại!');
  },

  // 7. Delete Media File (Cleans Storage Path & DB Metadata)
  deleteMedia: async (mediaId: string): Promise<void> => {
    const current = getLocalMedia();
    const itemToDelete = current.find((m) => m.id === mediaId);

    if (itemToDelete && isSupabaseConfigured() && itemToDelete.storage_path) {
      try {
        await supabase.storage.from('media').remove([itemToDelete.storage_path]);
        await supabase.from('media').delete().eq('id', mediaId);
      } catch (e) {
        console.warn('Error removing file from Supabase storage:', e);
      }
    }

    const updated = current.filter((m) => m.id !== mediaId);
    saveLocalMedia(updated);

    if (itemToDelete) {
      await mediaService.syncInvitationMedia(itemToDelete.invitation_id);
    }
  },

  // 8. Helper: Sync Media Gallery & Default Music with Invitation record for Realtime Preview
  syncInvitationMedia: async (invitationId: string): Promise<void> => {
    const images = await mediaService.getMediaByInvitationId(invitationId, 'image');
    const musicTracks = await mediaService.getMediaByInvitationId(invitationId, 'music');

    const galleryUrls = images.map((i) => i.medium_url || i.public_url);
    const coverImage = images.find((i) => i.is_cover) || images[0];
    const defaultMusic = musicTracks.find((m) => m.is_default) || musicTracks[0];

    const updates: any = {};
    if (galleryUrls.length > 0) updates.gallery = galleryUrls;
    if (coverImage) updates.thumbnail_url = coverImage.medium_url || coverImage.public_url;
    if (defaultMusic) updates.music = defaultMusic.public_url;

    if (Object.keys(updates).length > 0) {
      await invitationService.updateInvitation(invitationId, updates);
    }
  },
};
