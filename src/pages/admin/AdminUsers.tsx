import React from 'react';
import { mockUsers } from '../../data/mockData';
import { Badge } from '../../components/common/Badge';
import { Users, Mail, Calendar, ShieldCheck } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Quản Lý Danh Sách User Hệ Thống</span>
            </h3>
            <p className="text-xs text-slate-400">Danh sách tài khoản khách hàng & phân quyền admin</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Người dùng</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phân quyền (Role)</th>
                <th className="py-3.5 px-4">Ngày đăng ký</th>
                <th className="py-3.5 px-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar_url} alt={u.full_name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                      <div>
                        <p className="font-bold text-slate-200">{u.full_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-amber-300">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={u.role === 'admin' ? 'paid' : 'trial'}>
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-xs text-emerald-400 font-bold">Active</span>
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
