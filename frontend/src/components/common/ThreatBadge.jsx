import React from 'react';
import { AlertTriangle, ShieldCheck, Flame, Info } from 'lucide-react';

export const ThreatBadge = ({ level = 'CLEAR', size = 'sm' }) => {
  const normalized = (level || 'CLEAR').toUpperCase();

  const configs = {
    CRITICAL: {
      bg: 'bg-rose-500/15 border-rose-500/60 text-rose-300',
      dot: 'bg-rose-500 animate-ping',
      icon: Flame,
      label: 'CRITICAL BOLO',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
    },
    HIGH: {
      bg: 'bg-orange-500/15 border-orange-500/60 text-orange-300',
      dot: 'bg-orange-500',
      icon: AlertTriangle,
      label: 'HIGH THREAT',
      glow: 'shadow-[0_0_10px_rgba(249,115,22,0.25)]',
    },
    MEDIUM: {
      bg: 'bg-amber-500/15 border-amber-500/50 text-amber-300',
      dot: 'bg-amber-400',
      icon: AlertTriangle,
      label: 'MEDIUM',
      glow: '',
    },
    LOW: {
      bg: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
      dot: 'bg-blue-400',
      icon: Info,
      label: 'LOW',
      glow: '',
    },
    CLEAR: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'CLEAR',
      glow: '',
    }
  };

  const config = configs[normalized] || configs.CLEAR;
  const Icon = config.icon;

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-sm px-3 py-1 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono uppercase tracking-wider ${config.bg} ${config.glow} ${sizeStyles[size] || sizeStyles.sm}`}
    >
      <span className="relative flex h-2 w-2">
        {normalized === 'CRITICAL' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};
