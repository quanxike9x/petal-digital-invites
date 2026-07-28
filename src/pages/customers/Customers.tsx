import React from 'react';
import { mockUsers } from '../../data/mockData';
import { Badge } from '../../components/common/Badge';
import { Users, Mail, Calendar, ShieldCheck } from 'lucide-react';

export const Customers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-400" />
              <span>Danh sách Khách hàng hệ thống</span>
            </h3>
            <p className="text-xs text-slate-400">Quản lý tài khoản và thiệp của từng khách hàng</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Ngày đăng ký</th>
                <th className="py-3.5 px-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar_url} alt={user.full_name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                      <div>
                        <p className="font-semibold text-slate-100">{user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-300">{user.email}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={user.role === 'admin' ? 'paid' : 'trial'}>
                      {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-xs text-emerald-400 font-medium">Hoạt động</span>
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
