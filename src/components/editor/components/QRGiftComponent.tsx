import React, { useState, useMemo } from 'react';
import { Gift, X, CreditCard, Copy, Check } from 'lucide-react';
import type { ComponentProps } from '../../../types/componentProps';
import { useInvitationRuntime } from '../../../context/InvitationRuntimeContext';
import type { QRInformationData } from '../../../types/invitationRuntime';
import { generateVietQRUrl } from '../../../services/vietQRService';

export const QRGiftComponent: React.FC<ComponentProps> = React.memo(({ props, style }) => {
  const { invitationData } = useInvitationRuntime();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const bindingKey = typeof props?.binding === 'string' ? props.binding : 'none';
  const boundValue = bindingKey !== 'none' ? (invitationData[bindingKey] as QRInformationData) : undefined;

  const bankName = boundValue?.bankName
    || (typeof props?.bankName === 'string' && props.bankName)
    || (typeof props?.bank === 'string' && props.bank)
    || 'MB Bank';
  const accountNo = boundValue?.accountNo
    || (typeof props?.accountNo === 'string' && props.accountNo)
    || (typeof props?.account === 'string' && props.account)
    || '1018920192';
  const accountName = boundValue?.accountName
    || (typeof props?.accountName === 'string' ? props.accountName : 'TRAN MINH PHONG');

  const giftBoxImage = (props?.giftBoxImage as string) || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=200';
  const qrUrl = useMemo(() => generateVietQRUrl(bankName, accountNo, accountName, `Mung cuoi ${accountName}`), [bankName, accountNo, accountName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center font-sans select-none p-2"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        onClick={() => setIsOpen(true)}
        className="group relative p-3 rounded-2xl bg-white border border-rose-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center gap-2 max-w-[200px]"
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-rose-50 p-1 border border-rose-100 flex items-center justify-center">
          {giftBoxImage ? (
            <img src={giftBoxImage} alt="Hộp Quà Mừng Cưới" className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform" />
          ) : (
            <Gift className="w-8 h-8 text-rose-500 animate-bounce" />
          )}
        </div>
        <span className="font-serif font-bold text-xs text-rose-900 group-hover:text-rose-600 transition-colors">
          🎁 Hộp Quà Mừng Cưới
        </span>
        <span className="text-[9px] text-slate-500 font-sans italic bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
          Chạm để gửi mừng ✉️
        </span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white border-2 border-amber-300 rounded-2xl shadow-2xl p-5 max-w-sm w-full font-sans text-slate-900 space-y-4 relative animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
                <Gift className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="font-serif font-bold text-base text-rose-900 uppercase">Mừng Cưới Cô Dâu & Chú Rể</h4>
              <p className="text-[11px] text-slate-500">Quét mã QR bên dưới để gửi lời mừng cưới trực tiếp</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="w-36 h-36 bg-white border border-slate-300 rounded-xl mx-auto p-2 flex items-center justify-center shadow-inner overflow-hidden">
                <img src={qrUrl} alt="VietQR Mừng Cưới" className="w-full h-full object-contain" />
              </div>

              <div className="text-center text-xs space-y-1 font-mono pt-1">
                <p className="font-bold text-slate-900">{bankName} - {accountNo}</p>
                <p className="text-[11px] text-slate-600 uppercase font-semibold">{accountName}</p>
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-sans font-bold text-xs border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép STK!' : 'Sao chép Số Tài Khoản'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});