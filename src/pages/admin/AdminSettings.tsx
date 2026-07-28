import React from 'react';
import { Settings as SettingsIcon, ShieldCheck, Key, Database } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6 font-sans">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <SettingsIcon className="w-5 h-5 text-amber-400" />
          <span>Cấu Hình Hệ Thống Quản Trị Admin</span>
        </h3>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <Database className="w-4 h-4" /> Kết nối Supabase Database
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Project URL</label>
              <input type="text" readOnly defaultValue="https://lujfnviekfnaxofrdwdc.supabase.co" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Anon Public Key</label>
              <input type="password" readOnly defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20">
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};
