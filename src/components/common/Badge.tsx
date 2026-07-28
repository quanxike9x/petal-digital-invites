import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'trial' | 'paid' | 'published' | 'draft' | 'archived' | 'active' | 'pending' | 'failed';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'draft', size = 'sm' }) => {
  const styles = {
    trial: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    published: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    draft: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    archived: 'bg-red-500/10 text-red-400 border-red-500/30',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    failed: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styles[variant]} ${sizeStyles[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
};
