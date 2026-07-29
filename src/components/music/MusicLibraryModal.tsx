import React, { useState, useEffect } from 'react';
import { musicService, type MusicSong } from '../../services/musicService';
import { 
  X, 
  Search, 
  Play, 
  Pause, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Music, 
  Volume2, 
  Settings, 
  ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';

interface MusicLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: MusicSong) => void;
  selectedSongId?: string;
  isAdmin?: boolean;
}

export const MusicLibraryModal: React.FC<MusicLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectSong,
  selectedSongId,
  isAdmin = false,
}) => {
  const [songs, setSongs] = useState<MusicSong[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [audio] = useState(new Audio());
  const [isManagingAdmin, setIsManagingAdmin] = useState(false);

  // Admin Add/Edit Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSong, setEditingSong] = useState<MusicSong | null>(null);
  const [songForm, setSongForm] = useState({
    title: '',
    artist: '',
    url: '',
    dropbox_url: '',
    thumbnail: '',
    duration: '3:30',
    category: 'Piano Romantic',
  });

  const categories = ['Tất cả', 'Piano Romantic', 'Acoustic', 'Violin Classic', 'Upbeat Joyful', 'Nhạc Việt Ngọt Ngào'];

  useEffect(() => {
    if (isOpen) {
      loadSongs();
    }
  }, [isOpen, isAdmin]);

  const loadSongs = async () => {
    const list = await musicService.getSongs(!isAdmin);
    setSongs(list);
  };

  if (!isOpen) return null;

  // Convert Dropbox share link to raw audio stream URL
  const formatAudioUrl = (url: string, dropboxUrl?: string) => {
    let raw = (dropboxUrl || url || '').trim();
    if (!raw) return '';
    if (raw.includes('dropbox.com')) {
      raw = raw.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      raw = raw.replace('?dl=0', '?dl=1');
      raw = raw.replace('&dl=0', '&dl=1');
      if (!raw.includes('dl=1') && !raw.includes('raw=1')) {
        raw += raw.includes('?') ? '&dl=1' : '?dl=1';
      }
    }
    return raw;
  };

  const togglePreview = (song: MusicSong) => {
    const audioUrl = formatAudioUrl(song.url, song.dropbox_url);
    if (playingSongId === song.id) {
      audio.pause();
      setPlayingSongId(null);
    } else {
      audio.src = audioUrl;
      audio.play().then(() => setPlayingSongId(song.id)).catch(() => {
        toast.error('Không thể phát thử bài hát này.');
      });
    }
  };

  const handleSelect = (song: MusicSong) => {
    audio.pause();
    setPlayingSongId(null);
    onSelectSong({ ...song, url: formatAudioUrl(song.url, song.dropbox_url) });
    onClose();
    toast.success(`Đã chọn bài hát: "${song.title}"`);
  };

  const handleAdminAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songForm.title.trim() || (!songForm.url.trim() && !songForm.dropbox_url.trim())) {
      toast.error('Vui lòng nhập Tên bài hát và Dropbox URL / Audio URL!');
      return;
    }

    const audioUrl = formatAudioUrl(songForm.url.trim(), songForm.dropbox_url.trim());

    try {
      if (editingSong) {
        await musicService.updateSong(editingSong.id, {
          title: songForm.title.trim(),
          artist: songForm.artist.trim(),
          url: audioUrl,
          dropbox_url: songForm.dropbox_url.trim(),
          thumbnail: songForm.thumbnail.trim(),
          duration: songForm.duration.trim(),
          category: songForm.category,
        });
        toast.success(`Đã cập nhật bài hát "${songForm.title}"`);
      } else {
        await musicService.addSong({
          title: songForm.title.trim(),
          artist: songForm.artist.trim() || 'Ca Sĩ / Nhạc Cụ',
          url: audioUrl,
          dropbox_url: songForm.dropbox_url.trim(),
          thumbnail: songForm.thumbnail.trim(),
          duration: songForm.duration.trim() || '3:30',
          category: songForm.category,
          is_active: true,
        });
        toast.success(`Đã thêm bài hát "${songForm.title}" vào Music Library!`);
      }

      setShowAddForm(false);
      setEditingSong(null);
      setSongForm({ title: '', artist: '', url: '', dropbox_url: '', thumbnail: '', duration: '3:30', category: 'Piano Romantic' });
      loadSongs();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu bài hát');
    }
  };

  const handleAdminToggleDisable = async (song: MusicSong) => {
    try {
      await musicService.updateSong(song.id, { is_active: !song.is_active });
      toast.success(song.is_active ? `Đã ẩn bài hát "${song.title}"` : `Đã kích hoạt bài hát "${song.title}"`);
      loadSongs();
    } catch (e) {}
  };

  const handleAdminDeleteSong = async (song: MusicSong) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài hát "${song.title}" khỏi Music Library?`)) return;
    try {
      await musicService.deleteSong(song.id);
      toast.success(`Đã xóa bài hát "${song.title}"`);
      loadSongs();
    } catch (e) {}
  };

  const filteredSongs = songs.filter(
    (s) =>
      (activeCategory === 'Tất cả' || s.category === activeCategory) &&
      (s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Kho Nhạc Nền Cưới (Music Library)</span>
              </h3>
              <p className="text-xs text-slate-400">Chọn bài hát ngọt ngào phù hợp nhất cho thiệp cưới của bạn.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setIsManagingAdmin(!isManagingAdmin)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isManagingAdmin
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-amber-400 border border-amber-500/30 hover:bg-slate-700'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isManagingAdmin ? 'Đóng Quản Lý Admin' : 'Quản Lý Music Library (Admin)'}</span>
              </button>
            )}
            <button
              onClick={() => {
                audio.pause();
                setPlayingSongId(null);
                onClose();
              }}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bài hát hoặc ca sĩ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Add Form */}
        {isAdmin && isManagingAdmin && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{editingSong ? 'Sửa Bài Hát Kho Nhạc' : 'Thêm Bài Hát Mới Vào Music Library'}</span>
              </span>
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingSong(null);
                  setSongForm({ title: '', artist: '', url: '', category: 'Piano Romantic' });
                }}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Hủy' : 'Thêm Bài Hát'}</span>
              </button>
            </div>

            {(showAddForm || editingSong) && (
              <form onSubmit={handleAdminAddSong} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tên bài hát *"
                    value={songForm.title}
                    onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                    required
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Ca sĩ / Nhạc cụ"
                    value={songForm.artist}
                    onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="Dropbox URL / Direct MP3 Link *"
                    value={songForm.dropbox_url || songForm.url}
                    onChange={(e) => setSongForm({ ...songForm, dropbox_url: e.target.value, url: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Thời lượng (VD: 3:45)"
                    value={songForm.duration}
                    onChange={(e) => setSongForm({ ...songForm, duration: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="url"
                    placeholder="Link Ảnh Cover Thumbnail (Tùy chọn)"
                    value={songForm.thumbnail}
                    onChange={(e) => setSongForm({ ...songForm, thumbnail: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <select
                    value={songForm.category}
                    onChange={(e) => setSongForm({ ...songForm, category: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value="Piano Romantic">Piano Romantic</option>
                    <option value="Acoustic">Acoustic</option>
                    <option value="Violin Classic">Violin Classic</option>
                    <option value="Upbeat Joyful">Upbeat Joyful</option>
                    <option value="Nhạc Việt Ngọt Ngào">Nhạc Việt Ngọt Ngào</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  {editingSong ? 'Lưu Cập Nhật' : 'Lưu Vào Music Library'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredSongs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Không tìm thấy bài hát nào phù hợp.</div>
          ) : (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  selectedSongId === song.id
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => togglePreview(song)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      playingSongId === song.id
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-700 text-slate-200 hover:bg-rose-500 hover:text-white'
                    }`}
                  >
                    {playingSongId === song.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="overflow-hidden">
                    <p className="font-bold text-xs truncate flex items-center gap-2">
                      <span>{song.title}</span>
                      {!song.is_active && (
                        <span className="text-[9px] bg-slate-700 text-amber-400 px-1.5 py-0.5 rounded">Đã Ẩn</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {song.artist} • <span className="text-slate-500">{song.category}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && isManagingAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setEditingSong(song);
                          setSongForm({ title: song.title, artist: song.artist, url: song.url, category: song.category || 'Piano Romantic' });
                        }}
                        className="p-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white"
                        title="Sửa bài hát"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAdminToggleDisable(song)}
                        className={`p-1.5 rounded-lg ${song.is_active ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'}`}
                        title={song.is_active ? 'Ẩn khỏi người dùng' : 'Kích hoạt'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAdminDeleteSong(song)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white"
                        title="Xóa bài hát"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleSelect(song)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      selectedSongId === song.id
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-slate-700 hover:bg-rose-600 text-white'
                    }`}
                  >
                    {selectedSongId === song.id ? <Check className="w-4 h-4" /> : null}
                    <span>{selectedSongId === song.id ? 'Đang Dùng' : 'Chọn Bài Hát'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
