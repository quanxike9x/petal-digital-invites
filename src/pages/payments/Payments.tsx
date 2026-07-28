import React from 'react';
import { mockPayments } from '../../data/mockData';
import { Badge } from '../../components/common/Badge';
import { CreditCard, ArrowUpRight } from 'lucide-react';

export const Payments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-400" />
              <span>Lịch sử Thanh toán & Nâng cấp Gói</span>
            </h3>
            <p className="text-xs text-slate-400">Danh sách các giao dịch đăng ký gói thiệp cưới VIP / Premium</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Mã giao dịch</th>
                <th className="py-3.5 px-4">Gói dịch vụ</th>
                <th className="py-3.5 px-4">Số tiền</th>
                <th className="py-3.5 px-4">Cổng thanh toán</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs text-rose-400 font-bold">{pay.transaction_ref}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">{pay.plan_name}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    {pay.amount.toLocaleString('vi-VN')} {pay.currency}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-xs font-semibold text-slate-400">{pay.payment_method}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={pay.status === 'completed' ? 'paid' : 'pending'}>
                      {pay.status === 'completed' ? 'Thành công' : 'Đang xử lý'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                    {new Date(pay.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
