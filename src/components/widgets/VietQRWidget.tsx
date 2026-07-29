import React, { useState } from 'react';
import { QrCode, CreditCard, Heart, X, Building, User, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getVietQRBankCode } from '../../services/vietQRService';

export interface VietQRWidgetProps {
  id: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  memo?: string;
  style?: React.CSSProperties;
  settings?: {
    showGroom?: boolean;
    groomBank?: string;
    groomOwner?: string;
    groomAccount?: string;
    groomQrUrl?: string;

    showBride?: boolean;
    brideBank?: string;
    brideOwner?: string;
    brideAccount?: string;
    brideQrUrl?: string;
  };
}

export const VietQRWidget: React.FC<VietQRWidgetProps> = ({
  id,
  bankName,
  accountNumber,
  accountName,
  memo,
  style,
  settings = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const showGroom = settings.showGroom !== false;
  const showBride = settings.showBride !== false;

  const groomBank = settings.groomBank || bankName || 'MB Bank';
  const groomOwner = settings.groomOwner || accountName || 'TRAN MINH PHONG';
  const groomAccount = settings.groomAccount || accountNumber || '1018920192';
  const groomBankCode = getVietQRBankCode(groomBank);
  const groomQrUrl = settings.groomQrUrl || `https://img.vietqr.io/image/${groomBankCode}-${groomAccount}-compact2.png?accountName=${encodeURIComponent(groomOwner)}&addInfo=${encodeURIComponent(memo || 'Mung cuoi')}`;

  const brideBank = settings.brideBank || bankName || 'MB Bank';
  const brideOwner = settings.brideOwner || accountName || 'LE QUYNH HOA';
  const brideAccount = settings.brideAccount || accountNumber || '0988291029';
  const brideBankCode = getVietQRBankCode(brideBank);
  const brideQrUrl = settings.brideQrUrl || `https://img.vietqr.io/image/${brideBankCode}-${brideAccount}-compact2.png?accountName=${encodeURIComponent(brideOwner)}&addInfo=${encodeURIComponent(memo || 'Mung cuoi')}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`Đã sao chép số tài khoản ${label}!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div id={id} className="vietqr-widget w-full h-full font-sans flex items-center justify-center" style={style}>
      {/* Sleek Floating QR Badge Button on Canvas */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-full bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-white rounded-2xl border border-rose-500/40 p-3 shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 group"
      >
        <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
          <QrCode className="w-5 h-5" />
        </div>
        <div className="text-left leading-tight">
          <p className="font-bold text-xs text-white">Mừng Cưới QR Bank</p>
          <p className="text-[10px] text-slate-400 font-medium">Bấm xem mã QR chú rể / cô dâu</p>
        </div>
      </button>

      {/* Banking Popup Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-widget-zoom"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-rose-100 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider">Hộp Mừng Cưới</h3>
              <p className="text-xs text-slate-500">Cảm ơn tình cảm quý báu của quý khách dành cho dâu rể!</p>
            </div>

            <div className="space-y-4">
              {/* GROOM CARD */}
              {showGroom && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs text-blue-700 uppercase tracking-wider">Mừng Cưới Nhà Trai</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">{groomBank}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    <div className="col-span-2 space-y-1.5 text-xs">
                      <p className="text-slate-500 font-medium">Chủ tài khoản:</p>
                      <p className="font-bold text-slate-900 uppercase">{groomOwner}</p>
                      <div className="flex items-center justify-between bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-slate-800 text-[11px]">
                        <span>{groomAccount}</span>
                        <button
                          onClick={() => handleCopy(groomAccount, 'Nhà Trai')}
                          className="text-rose-600 hover:text-rose-700 p-1"
                        >
                          {copiedText === groomAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <img src={groomQrUrl} alt="QR Groom" className="w-full aspect-square object-contain rounded-xl border border-slate-300 shadow-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* BRIDE CARD */}
              {showBride && (
                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                    <span className="font-bold text-xs text-rose-700 uppercase tracking-wider">Mừng Cưới Nhà Gái</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">{brideBank}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 items-center">
                    <div className="col-span-2 space-y-1.5 text-xs">
                      <p className="text-slate-500 font-medium">Chủ tài khoản:</p>
                      <p className="font-bold text-slate-900 uppercase">{brideOwner}</p>
                      <div className="flex items-center justify-between bg-white border border-rose-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-slate-800 text-[11px]">
                        <span>{brideAccount}</span>
                        <button
                          onClick={() => handleCopy(brideAccount, 'Nhà Gái')}
                          className="text-rose-600 hover:text-rose-700 p-1"
                        >
                          {copiedText === brideAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <img src={brideQrUrl} alt="QR Bride" className="w-full aspect-square object-contain rounded-xl border border-slate-300 shadow-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
