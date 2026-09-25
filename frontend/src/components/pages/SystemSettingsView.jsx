import React from 'react';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Bell, 
  Shield, 
  Radio, 
  Sliders, 
  Play, 
  RotateCcw, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TacticalCard } from '../common/TacticalCard';
import { soundManager } from '../../utils/soundEffects';

export const SystemSettingsView = () => {
  const {
    isMuted,
    toggleMute,
    dndPreset,
    setDndPreset,
    volume,
    setVolume,
    speedMultiplier,
    setSpeedMultiplier,
    clearToasts
  } = useApp();

  const handleTestScanPing = () => {
    soundManager.playScanPing();
  };

  const handleTestThreatAlert = () => {
    soundManager.playThreatAlert();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/25 backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              TACTICAL SYSTEM CONFIGURATION
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
              Notification Rules, Audio Synthesizer & Operator Clearance
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Configure real-time audio chime profiles, Do-Not-Disturb priorities, simulation velocity thresholds, and operator node security credentials.
        </p>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio & Notification Controls */}
        <TacticalCard
          title="Audio Synthesizer & Sound Profile"
          subtitle="Web Audio API tactical sound generator and muting controls"
          icon={Volume2}
        >
          <div className="space-y-4 font-mono text-xs">
            {/* Master Audio Mute Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-sm font-bold text-white block">Master Notification Audio</span>
                <span className="text-[11px] text-slate-400">
                  {isMuted ? 'All sounds and chimes are currently SILENCED' : 'Audio chimes and tactical alerts are ACTIVE'}
                </span>
              </div>
              <button
                onClick={toggleMute}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
                  isMuted
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/70'
                    : 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
              </button>
            </div>

            {/* Volume Slider */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">Synthesizer Volume Level</span>
                <span className="text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Live Audio Test Buttons */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 block">Test Synthetic Audio Chimes</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleTestScanPing}
                  className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 flex items-center justify-center space-x-1.5 font-bold"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Routine Scan Ping (950Hz)</span>
                </button>

                <button
                  onClick={handleTestThreatAlert}
                  className="py-2 px-3 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 flex items-center justify-center space-x-1.5 font-bold"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>BOLO Threat Warble (780Hz)</span>
                </button>
              </div>
            </div>

            {/* DND Preset Selection */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 block">Default Notification Profile (DND)</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', label: 'Standard', sub: 'All alerts' },
                  { id: 'critical', label: 'Critical Only', sub: 'BOLO threats' },
                  { id: 'silence', label: 'Complete Silence', sub: 'Silent log' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setDndPreset(p.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      dndPreset === p.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs">{p.label}</span>
                    <span className="block text-[10px] text-slate-500 font-sans">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TacticalCard>

        {/* Security & Operator Credentials */}
        <TacticalCard
          title="Security Clearance & Operator Credentials"
          subtitle="Top Secret law enforcement access protocol"
          icon={Shield}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">LOGGED-IN OPERATOR:</span>
                <span className="text-white font-bold">Inspector Vikram Malhotra</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DESIGNATION:</span>
                <span className="text-slate-200">CID Special Crime Branch / Traffic Grid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CLEARANCE LEVEL:</span>
                <span className="text-cyan-300 font-bold">LEVEL-4 // TOP SECRET // TS-SCI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OPERATIONAL NODE ID:</span>
                <span className="text-slate-200">SENTINEL-NODE-0884</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP ACCESS SESSION:</span>
                <span className="text-emerald-400 font-bold">10.24.0.88 (ENCRYPTED VPN TUNNEL)</span>
              </div>
            </div>

            {/* Data Retention & Purge Policy */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 block">Data Retention & Audit Compliance</span>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                All ANPR scans and cross-camera correlation logs are retained for 90 days in accordance with State Police Cyber Security Directives. High-priority BOLO cases remain permanently archived in the national criminal registry.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={clearToasts}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs"
              >
                Clear All Cached Alerts
              </button>

              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SYSTEM OPERATIONAL (v2.4-PRO)
              </span>
            </div>
          </div>
        </TacticalCard>
      </div>
    </div>
  );
};
