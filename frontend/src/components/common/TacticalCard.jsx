import React from 'react';

export const TacticalCard = ({
  children,
  className = '',
  title,
  subtitle,
  icon: Icon,
  action,
  glow = false,
  corners = true,
  alert = false,
}) => {
  return (
    <div
      className={`relative rounded-xl border transition-all duration-300 ${
        alert
          ? 'glass-panel-alert'
          : glow
          ? 'glass-panel border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
          : 'glass-panel hover:border-cyan-500/20'
      } ${className}`}
    >
      {/* Tactical HUD Corner Brackets */}
      {corners && (
        <>
          <div className="hud-corner-tl opacity-70" />
          <div className="hud-corner-tr opacity-70" />
          <div className="hud-corner-bl opacity-70" />
          <div className="hud-corner-br opacity-70" />
        </>
      )}

      {/* Header if title is present */}
      {(title || Icon || action) && (
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 sm:px-5">
          <div className="flex items-center space-x-2.5">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase font-mono flex items-center gap-2">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-400 font-sans tracking-normal">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center space-x-2">{action}</div>}
        </div>
      )}

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};
