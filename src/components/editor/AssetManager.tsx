import React, { useEffect, useState } from 'react';
import { 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  Eye, 
  Image as ImageIcon, 
  Music, 
  Video as VideoIcon, 
  Folder, 
  Check, 
  X,
  FileCode,
  Sparkles
} from 'lucide-react';
import { AssetRepository, type AssetRecord, type AssetFolder } from '../../repositories/AssetRepository';
import { toast } from 'sonner';

interface AssetManagerProps {
  onSelectAsset?: (asset: AssetRecord) => void;
  isPickerMode?: boolean;
  selectedAssetUrls?: string[];
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  onSelectAsset,
  isPickerMode = false,
  selectedAssetUrls = [],
}) => {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFolder, setActiveFolder] = useState<AssetFolder>('All');
  const [previewAsset, setPreviewAsset] = useState<AssetRecord | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const folders: AssetFolder[] = ['All', 'Wedding', 'Background', 'Gallery', 'Music', 'Icons', 'Custom'];

  const loadAssets = async () => {
    setIsLoading(true);
    const data = await AssetRepository.getAssets(activeFolder, searchQuery);
    setAssets(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAssets();
  }, [activeFolder, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const targetFolder = activeFolder === 'All' ? 'Wedding' : activeFolder;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await AssetRepository.uploadAsset(file, targetFolder);
      }
      toast.success(`Đã tải lên ${files.length} tệp thành công!`);
      await loadAssets();
    } catch {
      toast.error('Lỗi khi tải tệp lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (asset: AssetRecord) => {
    if (confirm(`Bạn có chắc chắn muốn xóa "${asset.name}"?`)) {
      await AssetRepository.deleteAsset(asset.id, asset.url);
      toast.success('Đã xóa tệp media');
      await loadAssets();
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép đường dẫn URL!');
  };

  const getIconForAsset = (type: string) => {
    switch (type) {
      case 'music': return Music;
      case 'video': return VideoIcon;
      case 'svg': return FileCode;
      case 'icon': return Sparkles;
      default: return ImageIcon;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-900 font-sans text-slate-100 overflow-hidden select-none">
      {/* Search & Upload Bar */}
      <div className="p-3 border-b border-slate-800 space-y-2 shrink-0 bg-slate-950/60">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm Media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Đang tải...' : 'Upload'}</span>
            <input
              type="file"
              multiple
              accept="image/*,audio/*,video/*,.svg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Folder Tabs Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                activeFolder === folder
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Folder className="w-3 h-3" />
              <span>{folder}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid List */}
      <div className="flex-1 p-3 overflow-y-auto">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            Đang tải dữ liệu Media Library...
          </div>
        ) : assets.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono space-y-1">
            <Folder className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p>Chưa có tệp Media nào</p>
            <p className="text-[10px] text-slate-600">Bấm Upload để thêm ảnh/nhạc mới</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {assets.map((asset) => {
              const Icon = getIconForAsset(asset.type);
              const isSelected = selectedAssetUrls.includes(asset.url);

              return (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (onSelectAsset) onSelectAsset(asset);
                  }}
                  className={`group rounded-xl border bg-slate-800/40 hover:bg-slate-800 overflow-hidden flex flex-col justify-between transition-all relative cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 z-10 bg-emerald-500 text-slate-950 p-0.5 rounded-full shadow">
                      <Check className="w-3 h-3 font-bold" />
                    </div>
                  )}

                  {/* Thumbnail Container */}
                  <div className="h-24 w-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
                    {asset.type === 'image' || asset.thumbnail ? (
                      <img
                        src={asset.thumbnail || asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <Icon className="w-6 h-6 text-amber-400" />
                        <span className="text-[9px] font-mono text-slate-400 uppercase">
                          {asset.type}
                        </span>
                      </div>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAsset(asset);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(asset.url);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
                        title="Copy URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {!isPickerMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(asset);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info Footer */}
                  <div className="p-2 space-y-0.5">
                    <p className="font-semibold text-xs text-slate-200 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span>{asset.folder || 'Wedding'}</span>
                      <span>{asset.size ? `${Math.round(asset.size / 1024)}KB` : ''}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{previewAsset.name}</h3>
                <p className="text-[10px] font-mono text-amber-400">
                  Folder: {previewAsset.folder} | Type: {previewAsset.type}
                </p>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-slate-950 flex items-center justify-center max-h-[60vh] overflow-auto">
              {previewAsset.type === 'image' && (
                <img src={previewAsset.url} alt={previewAsset.name} className="max-h-[50vh] object-contain rounded-xl" />
              )}
              {previewAsset.type === 'music' && (
                <audio controls src={previewAsset.url} className="w-full" />
              )}
              {previewAsset.type === 'video' && (
                <video controls src={previewAsset.url} className="max-h-[50vh] rounded-xl" />
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[300px]">
                {previewAsset.url}
              </span>
              <button
                onClick={() => handleCopyUrl(previewAsset.url)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
