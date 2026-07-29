import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AssetManager } from './AssetManager';
import type { AssetRecord } from '../../repositories/AssetRepository';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMultiSelect?: boolean;
  initialSelectedUrls?: string[];
  onConfirm: (selectedUrls: string[]) => void;
  title?: string;
}

export const AssetPickerModal: React.FC<AssetPickerModalProps> = ({
  isOpen,
  onClose,
  isMultiSelect = false,
  initialSelectedUrls = [],
  onConfirm,
  title = 'Chọn Media từ Thư Viện (Asset Manager)',
}) => {
  const [selectedUrls, setSelectedUrls] = useState<string[]>(initialSelectedUrls);

  if (!isOpen) return null;

  const handleSelectAsset = (asset: AssetRecord) => {
    if (isMultiSelect) {
      if (selectedUrls.includes(asset.url)) {
        setSelectedUrls(selectedUrls.filter((u) => u !== asset.url));
      } else {
        setSelectedUrls([...selectedUrls, asset.url]);
      }
    } else {
      setSelectedUrls([asset.url]);
    }
  };

  const handleApply = () => {
    onConfirm(selectedUrls);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 select-none font-sans">
      <div className="w-full max-w-3xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div>
            <h3 className="font-bold text-sm text-white">{title}</h3>
            <p className="text-[10px] font-mono text-amber-400">
              {isMultiSelect ? 'Chọn nhiều tệp (Multi-select)' : 'Chọn 1 tệp (Single select)'} | Đã chọn: {selectedUrls.length} tệp
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApply}
              disabled={selectedUrls.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md cursor-pointer transition-all"
            >
              <Check className="w-4 h-4 font-bold" />
              <span>Áp dụng ({selectedUrls.length})</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content: Asset Manager Engine */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AssetManager
            isPickerMode={true}
            onSelectAsset={handleSelectAsset}
            selectedAssetUrls={selectedUrls}
          />
        </div>
      </div>
    </div>
  );
};
