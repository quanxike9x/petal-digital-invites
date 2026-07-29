/**
 * VietQR Official Banking API Integration
 * Generates official VietQR images scannable by 100% of Vietnamese Mobile Banking Apps
 */

export interface BankInfo {
  code: string;
  name: string;
  shortName: string;
}

export const VIETNAMESE_BANKS: BankInfo[] = [
  { code: 'MB', name: 'MBBank - Ngân hàng Quân Đội', shortName: 'MB Bank' },
  { code: 'VCB', name: 'Vietcombank - Ngân hàng Ngoại Thương Việt Nam', shortName: 'Vietcombank' },
  { code: 'ICB', name: 'VietinBank - Ngân hàng Công Thương Việt Nam', shortName: 'VietinBank' },
  { code: 'TCB', name: 'Techcombank - Ngân hàng Kỹ Thương Việt Nam', shortName: 'Techcombank' },
  { code: 'BIDV', name: 'BIDV - Ngân hàng Đầu tư và Phát triển Việt Nam', shortName: 'BIDV' },
  { code: 'VBA', name: 'Agribank - Ngân hàng Nông nghiệp & PTNT Việt Nam', shortName: 'Agribank' },
  { code: 'TPB', name: 'TPBank - Ngân hàng Tiên Phong', shortName: 'TPBank' },
  { code: 'VPB', name: 'VPBank - Ngân hàng Việt Nam Thịnh Vượng', shortName: 'VPBank' },
  { code: 'ACB', name: 'ACB - Ngân hàng Á Châu', shortName: 'ACB' },
  { code: 'STB', name: 'Sacombank - Ngân hàng Sài Gòn Thương Tín', shortName: 'Sacombank' },
  { code: 'HDB', name: 'HDBank - Ngân hàng Phát triển TP. HCM', shortName: 'HDBank' },
  { code: 'VIB', name: 'VIB - Ngân hàng Quốc Tế Việt Nam', shortName: 'VIB' },
  { code: 'MSB', name: 'MSB - Ngân hàng Hàng Hải Việt Nam', shortName: 'MSB' },
  { code: 'SHB', name: 'SHB - Ngân hàng Sài Gòn - Hà Nội', shortName: 'SHB' },
  { code: 'OCB', name: 'OCB - Ngân hàng Phương Đông', shortName: 'OCB' },
  { code: 'LPB', name: 'LPBank - Ngân hàng Lộc Phát Việt Nam', shortName: 'LPBank' },
];

export const getVietQRBankCode = (bankName: string): string => {
  if (!bankName) return 'MB';
  const search = bankName.toLowerCase().trim();
  const found = VIETNAMESE_BANKS.find(
    (b) =>
      b.code.toLowerCase() === search ||
      b.shortName.toLowerCase().includes(search) ||
      b.name.toLowerCase().includes(search)
  );
  return found ? found.code : 'MB';
};

export const generateVietQRUrl = (
  bankName: string = '',
  accountNumber: string = '',
  accountName: string = '',
  addInfo: string = 'Mung cuoi'
): string => {
  if (!accountNumber || !accountNumber.trim()) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ChuaCoSoTaiKhoan';
  }

  const bankCode = getVietQRBankCode(bankName);
  const cleanAcc = accountNumber.trim();
  const cleanName = encodeURIComponent(accountName.trim());
  const cleanInfo = encodeURIComponent(addInfo.trim());

  return `https://img.vietqr.io/image/${bankCode}-${cleanAcc}-compact2.png?accountName=${cleanName}&addInfo=${cleanInfo}`;
};
