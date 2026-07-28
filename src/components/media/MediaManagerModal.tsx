import React, { useState, useEffect, useRef } from 'react';
import { mediaService, MEDIA_LIMITS } from '../../services/mediaService';
import type { MediaItem, MediaType } from '../../types';
import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  Upload, 
  Trash2, 
  Star, 
  GripVertical, 
  Edit3, 
  Check, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId: string;
  defaultTab?: MediaType;
  onMediaUpdated?: () => void;
}

export const MediaManagerModal: React.FC<MediaManagerModalProps> = ({
  isOpen,
  onClose,
  invitationId,
  defaultTab = 'image',
  onMediaUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<MediaType>(defaultTab);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');

  // Editing Caption State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState('');

  // Audio Playback State for Previewing Music
  const [playingMusicId, setPlayingMusicId] = useState<string | null>(null);
  const [audio] = useState(new Audio());

  // HTML5 Drag and Drop Reordering State
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  // Load Media Items when modal opens or tab changes
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const items = await mediaService.getMediaByInvitationId(invitationId, activeTab);
      setMediaItems(items);
    } catch (e: any) {
      toast.error('Lỗi nạp thư viện media!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    } else {
      audio.pause();
      setPlayingMusicId(null);
    }
  }, [isOpen, activeTab, invitationId]);

  if (!isOpen) return null;

  // Format Helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Handle Multi-file Upload
  const handleFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const limit = MEDIA_LIMITS[activeTab];
    if (mediaItems.length + fileArray.length > limit) {
      toast.error(`Vượt quá giới hạn tối đa ${limit} file ${activeTab} cho thiệp này!`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadStatusText(`Đang xử lý & tối ưu: ${file.name} (${i + 1}/${fileArray.length})...`);
      
      try {
        await mediaService.uploadMedia(invitationId, file, activeTab, (percent) => {
          const stepPercent = Math.round(((i + (percent / 100)) / fileArray.length) * 100);
          setUploadProgress(stepPercent);
        });
        successCount++;
      } catch (err: any) {
        toast.error(`Lỗi upload "${file.name}": ${err.message}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(100);
    setUploadStatusText('');

    if (successCount > 0) {
      toast.success(`Đã upload & nạp tự động ${successCount} file thành công!`);
      fetchMedia();
      if (onMediaUpdated) onMediaUpdated();
    }
  };

  // HTML5 Drag and Drop Reordering Handlers
  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItemRef.current = index;
  };

  const handleDragEnd = async () => {
    if (dragItemRef.current === null || dragOverItemRef.current === null) return;
    if (dragItemRef.current === dragOverItemRef.current) return;

    const copy = [...mediaItems];
    const draggedItem = copy[dragItemRef.current];
    copy.splice(dragItemRef.current, 1);
    copy.splice(dragOverItemRef.current, 0, draggedItem);

    dragItemRef.current = null;
    dragOverItemRef.current = null;

    setMediaItems(copy);

    const orderedIds = copy.map((m) => m.id);
    await mediaService.reorderMedia(invitationId, orderedIds);
    toast.success('Đã lưu thứ tự hiển thị mới!');
    if (onMediaUpdated) onMediaUpdated();
  };

  // Set Cover Photo
  const handleSetCover = async (item: MediaItem) => {
    await mediaService.setCoverImage(invitationId, item.id);
    toast.success(`Đã đặt "${item.caption || item.file_name}" làm Ảnh Bìa thiệp!`);
    fetchMedia();
    if (onMediaUpdated) onMediaUpdated();
  };

  // Set Default Music
  const handleSetDefaultMusic = async (item: MediaItem) => {
    await mediaService.setDefaultMusic(invitationId, item.id);
    toast.success(`Đã đặt "${item.caption || item.file_name}" làm nhạc nền mặc định!`);
    fetchMedia();
    if (onMediaUpdated) onMediaUpdated();
  };

  // Delete Item
  const handleDeleteItem = async (item: MediaItem) => {
    if (confirm(`Xóa file "${item.caption || item.file_name}" khỏi thư viện?`)) {
      await mediaService.deleteMedia(item.id);
      toast.info('Đã xóa file thành công.');
      fetchMedia();
      if (onMediaUpdated) onMediaUpdated();
    }
  };

  // Save Caption Edit
  const handleSaveCaption = async (id: string) => {
    await mediaService.updateMediaItem(id, { caption: editingCaption });
    setEditingId(null);
    toast.success('Đã cập nhật chú thích thành công!');
    fetchMedia();
    if (onMediaUpdated) onMediaUpdated();
  };

  // Toggle Audio Playback Preview
  const togglePlayAudio = (item: MediaItem) => {
    if (playingMusicId === item.id) {
      audio.pause();
      setPlayingMusicId(null);
    } else {
      audio.src = item.public_url;
      audio.play();
      setPlayingMusicId(item.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md font-sans animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Title & Close Button */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Thư Viện Media Thiệp Cưới</h2>
              <p className="text-xs text-slate-400">Quản lý Ảnh Cưới Gallery, Video Kỷ Niệm và Nhạc Nền</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="p-4 bg-slate-950/20 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('image')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'image' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Ảnh Gallery ({mediaItems.length}/{MEDIA_LIMITS.image})</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'video' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video ({mediaItems.length}/{MEDIA_LIMITS.video})</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'music' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Nhạc Nền ({mediaItems.length}/{MEDIA_LIMITS.music})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Info className="w-3.5 h-3.5 text-rose-400" />
            <span>Tối đa: 100 Ảnh • 10 Video • 10 Nhạc</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* DRAG & DROP UPLOAD ZONE */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFilesUpload(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-rose-500 bg-rose-500/10 scale-[0.99]'
                : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60'
            }`}
          >
            <input
              type="file"
              id="media-upload-input"
              multiple
              accept={
                activeTab === 'image'
                  ? '.jpg,.jpeg,.png,.webp'
                  : activeTab === 'video'
                  ? '.mp4,.mov,.webm'
                  : '.mp3,.wav,.aac,.m4a'
              }
              onChange={(e) => e.target.files && handleFilesUpload(e.target.files)}
              className="hidden"
            />

            <label htmlFor="media-upload-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>

              <p className="text-sm font-bold text-white">
                Kéo thả file vào đây hoặc <span className="text-rose-400 underline">bấm để chọn file</span>
              </p>

              <p className="text-xs text-slate-400">
                {activeTab === 'image' && 'Hỗ trợ: JPG, JPEG, PNG, WEBP • Tự động nén 3 kích thước (Thumb, Medium, Original)'}
                {activeTab === 'video' && 'Hỗ trợ: MP4, MOV, WEBM • Tùy chỉnh tự phát & lặp'}
                {activeTab === 'music' && 'Hỗ trợ: MP3, WAV, AAC • Nhạc nền tự động phát khi mở thiệp'}
              </p>
            </label>

            {/* UPLOAD PROGRESS BAR */}
            {isUploading && (
              <div className="mt-4 space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span className="truncate">{uploadStatusText}</span>
                  <span className="font-mono text-rose-400">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* MEDIA ITEMS GRID VIEW */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-rose-500" />
              <p className="text-xs">Đang tải thư viện media...</p>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-950/30 rounded-3xl border border-slate-800/60">
              Chưa có file {activeTab} nào trong thư viện thiệp này.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Danh Sách File ({mediaItems.length})</span>
                {activeTab === 'image' && <span>Kéo biểu tượng ☰ để đổi thứ tự hiển thị</span>}
              </div>

              {/* TAB 1: IMAGES GALLERY GRID */}
              {activeTab === 'image' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaItems.map((item, idx) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`group relative rounded-2xl border bg-slate-950/80 overflow-hidden flex flex-col transition-all hover:border-rose-500/60 ${
                        item.is_cover ? 'border-rose-500 shadow-lg shadow-rose-500/20' : 'border-slate-800'
                      }`}
                    >
                      {/* Drag Handle & Cover Badge */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <div className="p-1 rounded-lg bg-slate-950/80 text-slate-400 cursor-grab hover:text-white backdrop-blur">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        {item.is_cover && (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold shadow flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Ảnh Bìa</span>
                          </span>
                        )}
                      </div>

                      {/* Image Thumbnail Preview */}
                      <div className="aspect-[4/3] w-full relative bg-slate-900 overflow-hidden">
                        <img
                          src={item.thumbnail_url || item.medium_url || item.public_url}
                          alt={item.caption || item.file_name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Caption & Metadata */}
                      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingCaption}
                              onChange={(e) => setEditingCaption(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                            />
                            <button onClick={() => handleSaveCaption(item.id)} className="p-1 text-emerald-400">
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-white truncate">{item.caption || item.file_name}</p>
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setEditingCaption(item.caption || item.file_name);
                              }}
                              className="text-slate-500 hover:text-slate-300"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <p className="text-[10px] text-slate-500 font-mono">{formatBytes(item.size)}</p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                          {!item.is_cover && (
                            <button
                              onClick={() => handleSetCover(item)}
                              className="text-rose-400 hover:text-rose-300 font-bold"
                            >
                              Đặt làm ảnh bìa
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-1 text-slate-500 hover:text-red-400 ml-auto"
                            title="Xóa ảnh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: VIDEOS LIST */}
              {activeTab === 'video' && (
                <div className="space-y-4">
                  {mediaItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
                          <Video className="w-8 h-8 text-rose-500" />
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">{item.caption || item.file_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{formatBytes(item.size)} • {item.mime_type}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 pt-3 sm:pt-0 border-slate-800">
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: MUSIC LIST */}
              {activeTab === 'music' && (
                <div className="space-y-3">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                        item.is_default ? 'bg-amber-950/10 border-amber-500/50' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePlayAudio(item)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                            playingMusicId === item.id
                              ? 'bg-amber-500 text-slate-950 animate-pulse'
                              : 'bg-slate-800 text-white hover:bg-rose-500'
                          }`}
                        >
                          {playingMusicId === item.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.caption || item.file_name}</span>
                            {item.is_default && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                                Nhạc Nền Mặc Định
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">{formatBytes(item.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!item.is_default && (
                          <button
                            onClick={() => handleSetDefaultMusic(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-bold text-xs transition-colors"
                          >
                            Đặt Nhạc Nền
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Done Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
          >
            Hoàn Tất
          </button>
        </div>
      </div>
    </div>
  );
};
