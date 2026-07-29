import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'rose' | 'amber' | 'emerald' | 'slate';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'rose',
  trend,
}) => {
  const variantStyles = {
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/20 text-rose-400',
      text: 'text-rose-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
      text: 'text-amber-400',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      text: 'text-emerald-400',
    },
    slate: {
      bg: 'bg-slate-800/40',
      border: 'border-slate-700/50 hover:border-slate-600',
      iconBg: 'bg-slate-700/50 text-slate-300',
      text: 'text-slate-400',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div className={`p-6 rounded-2xl border ${currentVariant.border} ${currentVariant.bg} backdrop-blur-md transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
            {trend && <span className="text-xs font-semibold text-emerald-400">{trend}</span>}
          </div>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentVariant.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
