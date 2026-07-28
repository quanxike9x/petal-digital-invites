import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface MusicSong {
  id: string;
  title: string;
  artist: string;
  url: string;
  dropbox_url?: string;
  thumbnail?: string;
  duration?: string;
  category?: string;
  is_active: boolean;
  created_at?: string;
}

const MUSIC_LIBRARY_STORE_KEY = 'pudwedding_music_library';

export const defaultMusicLibrary: MusicSong[] = [
  {
    id: 'song-1',
    title: 'Beautiful In White',
    artist: 'Shane Filan (Piano / Instrumental)',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    duration: '3:45',
    category: 'Piano Romantic',
    is_active: true,
  },
  {
    id: 'song-2',
    title: 'Until I Found You',
    artist: 'Stephen Sanchez (Acoustic Guitar)',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a77d24.mp3',
    duration: '3:10',
    category: 'Acoustic',
    is_active: true,
  },
  {
    id: 'song-3',
    title: 'A Thousand Years',
    artist: 'Christina Perri (Violin & Cello)',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b8408f6.mp3',
    duration: '4:15',
    category: 'Violin Classic',
    is_active: true,
  },
  {
    id: 'song-4',
    title: 'Marry You',
    artist: 'Bruno Mars (Upbeat Wedding)',
    url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_243ffc2b3d.mp3',
    duration: '3:50',
    category: 'Upbeat Joyful',
    is_active: true,
  },
  {
    id: 'song-5',
    title: 'Này Em Ơi (Ngày Đầu Tiên)',
    artist: 'Đức Phúc (Nhạc Cụ Cưới Nhẹ Nhàng)',
    url: 'https://cdn.pixabay.com/download/audio/2023/04/18/audio_651a2d6a78.mp3',
    duration: '3:30',
    category: 'Nhạc Việt Ngọt Ngào',
    is_active: true,
  },
  {
    id: 'song-6',
    title: 'Ánh Nắng Của Anh',
    artist: 'Đức Phúc (Piano Solo)',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3',
    duration: '3:20',
    category: 'Piano Romantic',
    is_active: true,
  },
];

const getLocalMusicLibrary = (): MusicSong[] => {
  const stored = localStorage.getItem(MUSIC_LIBRARY_STORE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return defaultMusicLibrary;
};

const saveLocalMusicLibrary = (songs: MusicSong[]) => {
  localStorage.setItem(MUSIC_LIBRARY_STORE_KEY, JSON.stringify(songs));
};

export const musicService = {
  /**
   * Fetch all songs from music_library table or default library
   */
  getSongs: async (onlyActive: boolean = true): Promise<MusicSong[]> => {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('music_library').select('*').order('created_at', { ascending: false });
        if (onlyActive) {
          query = query.eq('is_active', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as MusicSong[];
        }
      } catch (e) {}
    }

    const local = getLocalMusicLibrary();
    if (onlyActive) {
      return local.filter((s) => s.is_active);
    }
    return local;
  },

  /**
   * Get single song by ID
   */
  getSongById: async (id: string): Promise<MusicSong | null> => {
    const songs = await musicService.getSongs(false);
    return songs.find((s) => s.id === id) || null;
  },

  /**
   * Admin: Add new song to Music Library
   */
  addSong: async (song: Omit<MusicSong, 'id'>): Promise<MusicSong> => {
    const newSong: MusicSong = {
      ...song,
      id: `song-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('music_library')
          .insert([newSong])
          .select()
          .single();
        if (!error && data) {
          return data as MusicSong;
        }
      } catch (e) {}
    }

    const local = getLocalMusicLibrary();
    const updated = [newSong, ...local];
    saveLocalMusicLibrary(updated);
    return newSong;
  },

  /**
   * Admin: Update / Edit / Disable song
   */
  updateSong: async (id: string, updates: Partial<MusicSong>): Promise<MusicSong> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('music_library')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return data as MusicSong;
        }
      } catch (e) {}
    }

    const local = getLocalMusicLibrary();
    const updated = local.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveLocalMusicLibrary(updated);

    const found = updated.find((s) => s.id === id);
    if (!found) throw new Error('Không tìm thấy bài hát!');
    return found;
  },

  /**
   * Admin: Delete song from Music Library
   */
  deleteSong: async (id: string): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('music_library').delete().eq('id', id);
      } catch (e) {}
    }

    const local = getLocalMusicLibrary();
    const updated = local.filter((s) => s.id !== id);
    saveLocalMusicLibrary(updated);
  },
};
