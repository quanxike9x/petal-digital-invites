import React from 'react';
import { Database, HardDrive, Image } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

export const AdminStorage: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          <span>Quản Lý Lưu Trữ Assets & Storage</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Dung lượng đã dùng" value="1.42 GB" subtext="Hạn ngạch 50 GB" icon={HardDrive} variant="amber" />
          <StatCard title="Tổng số ảnh cưới" value="4.820" subtext="Ảnh cưới & covers" icon={Image} variant="rose" />
          <StatCard title="Audio / Nhạc nền" value="128 MB" subtext="Tệp MP3" icon={Database} variant="emerald" />
        </div>
      </div>
    </div>
  );
};
