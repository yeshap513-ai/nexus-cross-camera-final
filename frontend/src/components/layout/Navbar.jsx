import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Zap, 
  Search, 
  Shield, 
  Sliders, 
  Radio, 
  ChevronDown, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar = () => {
  const {
    isSimRunning,
    setIsSimRunning,
    speedMultiplier,
    setSpeedMultiplier,
    triggerDemoBurst,
    isMuted,
    toggleMute,
    dndPreset,
    setDndPreset,
    volume,
    setVolume,
    toasts,
    clearToasts,
    muteToastsAndAudio,
    unreadAlertCount,
    setIsCommandPaletteOpen,
    alertsLog,
    setActivePage,
    selectVehicleForTracking,
    isBackendConnected,
    backendStatus,
    runPipeline,
    isProcessing
  } = useApp();

  const [isDndDropdownOpen, setIsDndDropdownOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const alertsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDndDropdownOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(e.target)) {
        setIsAlertsDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dndProfiles = [
    {
      id: 'standard',
      title: 'Standard (All Alerts)',
      desc: 'Real-time pop-ups + tactical chimes for all scanned plates & infractions',
      badge: 'Full Audio & Toasts',
      color: 'text-cyan-400',
    },
    {
      id: 'critical',
      title: 'Critical Only',
      desc: 'Silences routine traffic. Alerts strictly for high-priority BOLO & Watchlist targets',
      badge: 'BOLO / Threat Only',
      color: 'text-amber-400',
    },
    {
      id: 'silence',
      title: 'Complete Silence (DND)',
      desc: 'All detections log silently to database. Zero popups, zero chimes',
      badge: 'Stealth / Silent Log',
      color: 'text-rose-400',
    }
  ];

  const currentProfile = dndProfiles.find((p) => p.id === dndPreset) || dndProfiles[0];

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#080d1a]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Brand + Security Clearance Tag */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-base font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
                NEXUS // SENTINEL-GRID
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                v2.4-PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              CROSS-CAMERA VEHICLE INTELLIGENCE // ANPR TRACKING
            </p>
          </div>
        </div>

        {/* Live Backend Status Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/60 font-mono text-[10px]">
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className={isBackendConnected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {isBackendConnected ? `FASTAPI :8000 (${backendStatus.total_detections} DETS)` : 'STANDALONE MODE'}
          </span>
        </div>

        {/* Minimalist Security Clearance Tag */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/60 font-mono text-[10px] text-slate-300">
          <Shield className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="text-slate-400">CLEARANCE:</span>
          <span className="font-bold text-cyan-300 tracking-wider">LEVEL-4 // TS-SCI</span>
        </div>
      </div>

      {/* Middle: Global Search Bar with Ctrl+K shortcut indicator */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 transition-all duration-200 text-xs group shadow-inner"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            <span className="truncate">Search plate (e.g. GJ-01-AB-1234), camera, BOLO...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-900 rounded border border-slate-700 group-hover:border-cyan-500/50 group-hover:text-cyan-300">
            <span>Ctrl</span><span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right Controls: Simulation Controls + Muting & DND Profile Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Simulation Controls Group */}
        <div className="flex items-center bg-slate-950/80 rounded-lg p-1 border border-slate-800 shadow-sm space-x-1">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsSimRunning((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
              isSimRunning
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
            title={isSimRunning ? 'Pause live ANPR feed simulation' : 'Resume live ANPR feed simulation'}
          >
            {isSimRunning ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden sm:inline">LIVE SIM</span>
                <Pause className="w-3 h-3 ml-0.5 opacity-80" />
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="hidden sm:inline">PAUSED</span>
                <Play className="w-3 h-3 ml-0.5 opacity-80" />
              </>
            )}
          </button>

          {/* Velocity Multipliers (1x / 2x / 5x) */}
          <div className="hidden sm:flex items-center space-x-0.5 bg-slate-900/90 rounded p-0.5 border border-slate-800/80">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeedMultiplier(speed)}
                className={`px-1.5 py-0.5 text-[11px] font-mono rounded font-semibold transition-all ${
                  speedMultiplier === speed
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Simulation Speed: ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Demo Burst Button */}
          <button
            onClick={triggerDemoBurst}
            className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-mono font-semibold bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 text-pink-200 border border-pink-500/40 hover:border-pink-400 transition-all shadow-sm active:scale-95"
            title="Trigger instant high-density ANPR scan burst & BOLO match"
          >
            <Zap className="w-3.5 h-3.5 text-pink-400 animate-bounce" />
            <span className="hidden md:inline">Demo Burst</span>
          </button>
        </div>

        {/* PROMINENT NOTIFICATION & SOUND MUTING CONTROLS (Requirement A) */}
        <div className="flex items-center space-x-1.5">
          {/* Main Mute / Unmute Button with Visual Status */}
          <button
            onClick={toggleMute}
            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all duration-200 shadow-md ${
              isMuted
                ? 'bg-rose-950/50 border-rose-500/70 text-rose-300 hover:bg-rose-900/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
            }`}
            title={isMuted ? 'Notifications are MUTED (Click to Unmute)' : 'Notifications are LIVE (Click to Mute)'}
          >
            {isMuted ? (
              <>
                <BellOff className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline-block font-bold">MUTED</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline-block font-bold">ALERTS ON</span>
              </>
            )}
          </button>

          {/* DND Presets Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDndDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono transition-all"
              title="Select Notification & Audio Profile"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline text-[11px] text-slate-300 max-w-[100px] truncate">
                {currentProfile.badge}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isDndDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl glass-dropdown z-50 p-2 shadow-2xl border border-cyan-500/30 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-800/90 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    Notification Profiles
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">DND Presets</span>
                </div>
                <div className="mt-1 space-y-1">
                  {dndProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setDndPreset(p.id);
                        setIsDndDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start space-x-2.5 ${
                        dndPreset === p.id
                          ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200'
                          : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {dndPreset === p.id ? (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-100">
                            {p.title}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 ${p.color}`}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug mt-1">
                          {p.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Direct quick action buttons inside dropdown */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      clearToasts();
                      setIsDndDropdownOpen(false);
                    }}
                    className="px-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 text-center"
                  >
                    Clear All Toasts
                  </button>
                  <button
                    onClick={() => {
                      muteToastsAndAudio();
                      setIsDndDropdownOpen(false);
                    }}
                    className="px-2 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-[11px] font-mono text-rose-300 border border-rose-800/60 text-center"
                  >
                    Mute Everything
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Alert Bell Flyout Drawer Trigger */}
          <div className="relative" ref={alertsRef}>
            <button
              onClick={() => setIsAlertsDrawerOpen((prev) => !prev)}
              className="relative p-2 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
              title="Recent Threat Alerts & Intercepts"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-lg animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {isAlertsDrawerOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl glass-dropdown z-50 p-3 shadow-2xl border border-rose-500/30 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <h4 className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                      Live Threat Alerts ({alertsLog.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setActivePage('alerts');
                      setIsAlertsDrawerOpen(false);
                    }}
                    className="text-[11px] font-mono text-cyan-400 hover:underline"
                  >
                    View All Logs →
                  </button>
                </div>

                <div className="mt-2 space-y-2 max-h-72 overflow-y-auto pr-1">
                  {alertsLog.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        selectVehicleForTracking(alert.plate);
                        setIsAlertsDrawerOpen(false);
                      }}
                      className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-rose-500/20 hover:border-rose-500/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-rose-300">
                          {alert.plate}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {alert.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium mt-1">
                        {alert.title}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
                        <span>{alert.cameraName}</span>
                        <span className="text-cyan-400 font-semibold">Track Route →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              VM
            </div>
            <div className="text-left font-mono">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                Insp. V. Malhotra
              </div>
              <div className="text-[9px] text-cyan-400 font-medium">
                CID Cyber / Grid Op
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
