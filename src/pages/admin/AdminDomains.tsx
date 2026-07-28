import React from 'react';
import { mockDomains } from '../../data/mockData';
import { Badge } from '../../components/common/Badge';
import { Globe, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminDomains: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-400" />
          <span>Quản Lý Custom Domains Toàn Hệ Thống</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tên miền</th>
                <th className="py-3.5 px-4">Trạng thái DNS</th>
                <th className="py-3.5 px-4">Chứng chỉ SSL</th>
                <th className="py-3.5 px-4">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockDomains.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-300">{d.domain_name}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={d.dns_verified ? 'active' : 'pending'}>
                      {d.dns_verified ? 'Đã Verified' : 'Chờ trỏ DNS'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-semibold flex items-center gap-1.5 ${d.ssl_active ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {d.ssl_active ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {d.ssl_active ? 'HTTPS Active' : 'Pending SSL'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {new Date(d.created_at).toLocaleDateString('vi-VN')}
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
