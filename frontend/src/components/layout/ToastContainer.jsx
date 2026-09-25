import React from 'react';
import { 
  BellOff, 
  Trash2, 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Radio, 
  Navigation, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HSRPPlate } from '../common/HSRPPlate';

export const ToastContainer = () => {
  const { 
    toasts, 
    removeToast, 
    clearToasts, 
    muteToastsAndAudio, 
    selectVehicleForTracking,
    setActivePage 
  } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside aria-label="Notifications" className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md flex flex-col space-y-2 pointer-events-none">
      {/* Toast Stack Header Bar (Mandatory 1-click controls) */}
      <div className="pointer-events-auto flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 shadow-2xl">
        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            Live Alerts Stack ({toasts.length})
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={muteToastsAndAudio}
            className="flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-all"
            title="Mute all future audio & toast alerts"
          >
            <BellOff className="w-3 h-3" />
            <span>Mute Toasts</span>
          </button>

          <button
            onClick={clearToasts}
            className="flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
            title="Clear all active toast cards"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Stacked Toast Cards */}
      <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1 pointer-events-auto">
        {toasts.map((toast) => {
          const isCritical = toast.threatLevel === 'CRITICAL';
          const isHigh = toast.threatLevel === 'HIGH';

          return (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl transition-all duration-300 transform translate-y-0 shadow-2xl relative overflow-hidden backdrop-blur-2xl border ${
                isCritical
                  ? 'bg-[#180911]/95 border-rose-500/70 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  : isHigh
                  ? 'bg-[#181109]/95 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-[#0a1020]/95 border-cyan-500/30 shadow-lg'
              }`}
            >
              {/* Top Accent Color Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isCritical ? 'bg-rose-500 animate-pulse' : isHigh ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
              />

              {/* Toast Content Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {isCritical ? (
                    <div className="p-1 rounded bg-rose-500/20 text-rose-400">
                      <ShieldAlert className="w-4 h-4 animate-bounce" />
                    </div>
                  ) : isHigh ? (
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                      <Info className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <h5
                      className={`text-xs font-mono font-bold uppercase tracking-wider ${
                        isCritical ? 'text-rose-300' : isHigh ? 'text-amber-300' : 'text-cyan-300'
                      }`}
                    >
                      {toast.title}
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400">
                      {toast.timestamp} // {toast.cameraId || 'GRID'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toast Body Description */}
              <p className="text-xs text-slate-200 mt-2 font-sans leading-relaxed">
                {toast.message}
              </p>

              {/* Plate & Location Details */}
              {toast.plate && toast.plate !== 'GRID-BURST' && (
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <HSRPPlate plate={toast.plate} size="sm" threatLevel={toast.threatLevel} />

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => selectVehicleForTracking(toast.plate, 'tracking')}
                      className="flex items-center space-x-1 px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-[10px] font-bold transition-all shadow"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Track Route</span>
                    </button>
                    <button
                      onClick={() => selectVehicleForTracking(toast.plate, 'dossier')}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                      title="Open Investigation Dossier"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
