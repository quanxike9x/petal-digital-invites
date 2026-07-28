import React from 'react';
import { mockDomains } from '../../data/mockData';
import { Badge } from '../../components/common/Badge';
import { Globe, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';

export const Domains: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-rose-400" />
              <span>Quản lý Tên miền tùy chỉnh (Custom Domains)</span>
            </h3>
            <p className="text-xs text-slate-400">Gắn tên miền riêng cho thiệp cưới (Ví dụ: cuoiphongvahoa.com)</p>
          </div>

          <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors shadow-lg shadow-rose-600/20">
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Tên Miền</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tên miền</th>
                <th className="py-3.5 px-4">Trạng thái DNS</th>
                <th className="py-3.5 px-4">Chứng chỉ SSL</th>
                <th className="py-3.5 px-4">Ngày liên kết</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockDomains.map((dom) => (
                <tr key={dom.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-rose-400 font-mono">{dom.domain_name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={dom.dns_verified ? 'active' : 'pending'}>
                      {dom.dns_verified ? 'Đã trỏ DNS' : 'Chờ trỏ CNAME'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-semibold flex items-center gap-1.5 ${dom.ssl_active ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {dom.ssl_active ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {dom.ssl_active ? 'HTTPS Hoạt động' : 'Đang cấp SSL'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {new Date(dom.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-xs text-slate-400 hover:text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                      Kiểm tra DNS
                    </button>
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
