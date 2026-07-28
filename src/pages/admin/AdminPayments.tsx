import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { paymentService, getAdminBankConfig, saveAdminBankConfig, type AdminBankConfig } from '../../services/paymentService';
import { VIETNAMESE_BANKS, generateVietQRUrl } from '../../services/vietQRService';
import type { PaymentOrder, PaymentStatus } from '../../types';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  ShieldCheck, 
  Filter,
  DollarSign,
  AlertCircle,
  Crown,
  X,
  QrCode,
  Save,
  Building2,
  Copy,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminPayments: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null);

  // Admin Bank Configuration State
  const [bankConfig, setBankConfig] = useState<AdminBankConfig>(getAdminBankConfig());
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getOrders();
      setOrders(data);
    } catch (e) {
      toast.error('Không thể nạp danh sách đơn thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSaveBankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankConfig.accountNumber.trim()) {
      toast.error('Vui lòng nhập Số tài khoản nhận tiền!');
      return;
    }
    if (!bankConfig.accountName.trim()) {
      toast.error('Vui lòng nhập Tên chủ tài khoản!');
      return;
    }
    setIsSavingConfig(true);
    saveAdminBankConfig(bankConfig);
    setTimeout(() => {
      setIsSavingConfig(false);
      toast.success('Đã lưu Cấu hình STK Ngân hàng Admin! Mã VietQR thanh toán cho User đã tự động cập nhật.');
    }, 400);
  };

  // Live Preview Admin VietQR URL
  const adminLiveVietQRUrl = generateVietQRUrl(
    bankConfig.bankName,
    bankConfig.accountNumber,
    bankConfig.accountName,
    'PWD-INV-DEMO',
    199000
  );

  // Action: Approve Payment Order
  const handleApprove = async (order: PaymentOrder) => {
    try {
      await paymentService.confirmOrder(order.id, user?.email || 'admin@pudwedding.shop');
      toast.success(`Thanh toán thành công. Thiệp "${order.invitation_title}" đã được mở khóa!`);
      fetchOrders();
      if (selectedOrder?.id === order.id) setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xác nhận thanh toán.');
    }
  };

  // Action: Reject Payment Order
  const handleReject = async (order: PaymentOrder) => {
    try {
      await paymentService.rejectOrder(order.id);
      toast.info(`Đã từ chối đơn thanh toán ${order.order_code}.`);
      fetchOrders();
      if (selectedOrder?.id === order.id) setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi từ chối đơn.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      o.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.invitation_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-6 font-sans">
      {/* ADMIN BANK & VIETQR CONFIGURATION PANEL */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-rose-500" />
              <span>Cấu Hình Ngân Hàng Thanh Toán Admin (Tự Sinh Mã VietQR User)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Nhập Số tài khoản & Ngân hàng nhận tiền. Mã VietQR sẽ tự động đồng bộ trên toàn bộ cửa sổ thanh toán của Người dùng!
            </p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5" />
            <span>VietQR National Standard</span>
          </span>
        </div>

        <form onSubmit={handleSaveBankConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Chọn Ngân Hàng Thụ Hưởng</label>
              <select
                value={bankConfig.bankName}
                onChange={(e) => setBankConfig({ ...bankConfig, bankName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-rose-500"
              >
                {VIETNAMESE_BANKS.map((b) => (
                  <option key={b.code} value={b.shortName}>
                    {b.name} ({b.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Số Tài Khoản Nhận Tiền *</label>
                <input
                  type="text"
                  value={bankConfig.accountNumber}
                  onChange={(e) => setBankConfig({ ...bankConfig, accountNumber: e.target.value })}
                  placeholder="1018920192"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Tên Chủ Tài Khoản *</label>
                <input
                  type="text"
                  value={bankConfig.accountName}
                  onChange={(e) => setBankConfig({ ...bankConfig, accountName: e.target.value.toUpperCase() })}
                  placeholder="PUDWEDDING PLATFORM"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono uppercase font-bold focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingConfig}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? 'Đang lưu...' : 'Lưu Cấu Hình STK Ngân Hàng Admin'}</span>
            </button>
          </div>

          {/* Live VietQR Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-4">
            <img
              src={adminLiveVietQRUrl}
              alt="Admin Live VietQR"
              className="w-28 h-28 bg-white p-1 rounded-xl shadow-md border object-contain shrink-0"
            />
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Realtime VietQR Preview</span>
              <p className="font-bold text-white text-xs">{bankConfig.bankName}</p>
              <p className="font-mono text-amber-400 font-bold text-xs">{bankConfig.accountNumber}</p>
              <p className="font-mono text-slate-300 text-[11px] uppercase truncate">{bankConfig.accountName}</p>
              <span className="inline-block text-[10px] text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                ✔ Đã kết nối thanh toán User
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* STATS HEADER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Tổng Doanh Thu</p>
            <h4 className="text-2xl font-extrabold text-white font-mono">{totalRevenue.toLocaleString('vi-VN')}đ</h4>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Đơn Chờ Xác Nhận</p>
            <h4 className="text-2xl font-extrabold text-amber-400 font-mono">{pendingCount} Đơn</h4>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Tổng Đơn Hàng</p>
            <h4 className="text-2xl font-extrabold text-white font-mono">{orders.length} Đơn</h4>
          </div>
        </div>
      </div>

      {/* FILTER & TABLE PANEL */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-500" />
              <span>Quản Lý Đơn Thanh Toán Thiệp Cưới (Per-Invitation Payments)</span>
            </h3>
            <p className="text-xs text-slate-400">Xác nhận thanh toán để tự động mở khóa thiệp cưới cho khách hàng</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã đơn, thiệp, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận (Pending)</option>
              <option value="paid">Đã thanh toán (Paid)</option>
              <option value="trial">Dùng thử (Trial)</option>
              <option value="expired">Hết hạn (Expired)</option>
              <option value="cancelled">Đã hủy (Cancelled)</option>
            </select>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Tên Thiệp Cưới</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Gói Dịch Vụ</th>
                <th className="py-3.5 px-4">Số Tiền</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ngày Tạo</th>
                <th className="py-3.5 px-4 text-right">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">Đang nạp dữ liệu đơn hàng...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">Không tìm thấy đơn thanh toán phù hợp.</td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{ord.order_code}</td>
                    <td className="py-3.5 px-4 font-bold text-white max-w-[160px] truncate">{ord.invitation_title}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-200">{ord.user_name}</p>
                      <p className="text-[10px] text-slate-400">{ord.user_email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-400 flex items-center gap-1">
                      {ord.package_name === 'VIP' && <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                      <span>{ord.package_name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-400 font-mono text-sm">
                      {ord.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.status === 'paid' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 text-[10px] flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Đã Thanh Toán
                        </span>
                      )}
                      {ord.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 text-[10px] flex items-center gap-1 w-max animate-pulse">
                          <Clock className="w-3 h-3" /> Chờ Xác Nhận
                        </span>
                      )}
                      {ord.status === 'trial' && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/30 text-[10px] w-max block">
                          Dùng Thử
                        </span>
                      )}
                      {ord.status === 'expired' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30 text-[10px] w-max block">
                          Hết Hạn
                        </span>
                      )}
                      {ord.status === 'cancelled' && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700 text-[10px] w-max block">
                          Đã Hủy
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(ord.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Xem Chi Tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {ord.status !== 'paid' && (
                          <button
                            onClick={() => handleApprove(ord)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow"
                            title="Xác nhận thanh toán và mở khóa thiệp"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Duyệt</span>
                          </button>
                        )}
                        {ord.status === 'pending' && (
                          <button
                            onClick={() => handleReject(ord)}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                            title="Từ Chối"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 font-sans">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-500" />
                <span>Chi Tiết Đơn Thanh Toán</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">{selectedOrder.order_code}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs font-mono">
              <p><span className="text-slate-400">Thiệp Cưới:</span> <span className="text-white font-bold">{selectedOrder.invitation_title}</span></p>
              <p><span className="text-slate-400">Khách Hàng:</span> <span className="text-slate-200">{selectedOrder.user_name} ({selectedOrder.user_email})</span></p>
              <p><span className="text-slate-400">Gói Đăng Ký:</span> <span className="text-rose-400 font-bold">{selectedOrder.package_name}</span></p>
              <p><span className="text-slate-400">Số Tiền:</span> <span className="text-emerald-400 font-extrabold text-sm">{selectedOrder.amount.toLocaleString('vi-VN')}đ</span></p>
              <p><span className="text-slate-400">Trạng Thái:</span> <span className="text-amber-400 font-bold uppercase">{selectedOrder.status}</span></p>
              <p><span className="text-slate-400">Ngày Tạo:</span> <span className="text-slate-300">{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</span></p>
              {selectedOrder.paid_at && (
                <p><span className="text-slate-400">Duyệt Vào Lúc:</span> <span className="text-emerald-300">{new Date(selectedOrder.paid_at).toLocaleString('vi-VN')}</span></p>
              )}
              {selectedOrder.verified_by && (
                <p><span className="text-slate-400">Duyệt Bởi:</span> <span className="text-slate-200">{selectedOrder.verified_by}</span></p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              {selectedOrder.status !== 'paid' && (
                <button
                  onClick={() => handleApprove(selectedOrder)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Duyệt Thanh Toán & Mở Khóa Thiệp</span>
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
