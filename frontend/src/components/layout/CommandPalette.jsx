import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Navigation, 
  Cctv, 
  ShieldAlert, 
  FileText, 
  Zap, 
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HSRPPlate } from '../common/HSRPPlate';

export const CommandPalette = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    cameras,
    watchlist,
    anprScans,
    selectVehicleForTracking,
    setActivePage,
    setSelectedCamera,
    triggerDemoBurst
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Filter Watchlist Plates & Targets
  const filteredWatchlist = watchlist.filter(
    (w) =>
      w.plate.toLowerCase().includes(normalizedQuery) ||
      w.crimeCategory.toLowerCase().includes(normalizedQuery) ||
      w.caseNumber.toLowerCase().includes(normalizedQuery) ||
      w.vehicle.toLowerCase().includes(normalizedQuery)
  );

  // Filter Cameras
  const filteredCameras = cameras.filter(
    (c) =>
      c.id.toLowerCase().includes(normalizedQuery) ||
      c.name.toLowerCase().includes(normalizedQuery) ||
      c.sector.toLowerCase().includes(normalizedQuery)
  );

  // Filter recent scans
  const uniqueScannedPlates = Array.from(
    new Set(anprScans.map((s) => s.plate))
  ).filter((p) => p.toLowerCase().includes(normalizedQuery));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-2xl glass-dropdown border border-cyan-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800/90 bg-[#060a14]">
          <Search className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type vehicle plate (e.g. GJ-01-AB-1234), camera ID, or BOLO case..."
            className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="ml-2 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 rounded border border-slate-700 hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Tactical Actions */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase px-2">
              Tactical Shortcuts
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
              <button
                onClick={() => {
                  triggerDemoBurst();
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-pink-950/20 hover:bg-pink-950/40 border border-pink-500/30 text-left transition-all group"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-mono font-semibold text-pink-200">
                    Inject Demo Burst & BOLO
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
              </button>

              <button
                onClick={() => {
                  setActivePage('map');
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/30 text-left transition-all group"
              >
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-mono font-semibold text-cyan-200">
                    Open GIS Route Tracking
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Watchlist BOLO Targets */}
          {filteredWatchlist.length > 0 && (
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-rose-400 uppercase px-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3" />
                Active Watchlist & BOLO Targets ({filteredWatchlist.length})
              </span>
              <div className="space-y-1.5 mt-1.5">
                {filteredWatchlist.map((target) => (
                  <div
                    key={target.plate}
                    onClick={() => {
                      selectVehicleForTracking(target.plate, 'tracking');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-rose-500/30 hover:border-rose-400 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <HSRPPlate plate={target.plate} size="sm" threatLevel={target.threatLevel} showCopy={false} />
                      <div>
                        <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                          <span>{target.vehicle}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-normal">
                            ({target.color})
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-300 font-mono">
                          {target.crimeCategory}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1">
                      Track <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Camera Nodes */}
          {filteredCameras.length > 0 && (
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase px-2 flex items-center gap-1.5">
                <Cctv className="w-3 h-3" />
                CCTV Node Registry ({filteredCameras.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                {filteredCameras.slice(0, 6).map((cam) => (
                  <div
                    key={cam.id}
                    onClick={() => {
                      setSelectedCamera(cam);
                      setActivePage('cameras');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {cam.id}
                        </span>
                        <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300">
                          ONLINE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate max-w-[200px]">
                        {cam.name}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono">{cam.sector}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent ANPR Scans */}
          {uniqueScannedPlates.length > 0 && (
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase px-2">
                Recent Scanned Plates
              </span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {uniqueScannedPlates.slice(0, 8).map((plate) => (
                  <button
                    key={plate}
                    onClick={() => {
                      selectVehicleForTracking(plate, 'tracking');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono transition-all"
                  >
                    <HSRPPlate plate={plate} size="sm" showCopy={false} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center space-x-3">
            <span>Press <kbd className="px-1 py-0.5 bg-slate-900 rounded border border-slate-700">ESC</kbd> to exit</span>
            <span><kbd className="px-1 py-0.5 bg-slate-900 rounded border border-slate-700">↵</kbd> to select</span>
          </div>
          <span className="text-cyan-400">SENTINEL-GRID FAST LOOKUP</span>
        </div>
      </div>
    </div>
  );
};
