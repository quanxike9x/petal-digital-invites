import React from 'react';

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 font-sans animate-pulse">
    <div className="h-40 bg-slate-900/80 border border-slate-800 rounded-3xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-28 bg-slate-900/80 border border-slate-800 rounded-2xl" />
      ))}
    </div>
    <div className="h-64 bg-slate-900/80 border border-slate-800 rounded-3xl" />
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="space-y-4 font-sans animate-pulse">
    <div className="h-12 bg-slate-900 border border-slate-800 rounded-2xl" />
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-14 bg-slate-900/80 border border-slate-800/60 rounded-xl" />
      ))}
    </div>
  </div>
);

export const CardGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-72 bg-slate-900/80 border border-slate-800 rounded-3xl" />
    ))}
  </div>
);

export const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
    <div className="w-12 h-12 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin" />
    <p className="text-xs font-bold text-slate-400 font-sans tracking-wide uppercase">Pudwedding Platform • Loading...</p>
  </div>
);
