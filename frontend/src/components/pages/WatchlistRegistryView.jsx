import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Flame, 
  Navigation, 
  FileText, 
  Radio, 
  Check, 
  X, 
  AlertTriangle,
  UserCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TacticalCard } from '../common/TacticalCard';
import { HSRPPlate } from '../common/HSRPPlate';
import { ThreatBadge } from '../common/ThreatBadge';

export const WatchlistRegistryView = () => {
  const { watchlist, addWatchlistTarget, selectVehicleForTracking, setActivePage } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedThreat, setSelectedThreat] = useState('ALL');

  // Form State for new BOLO
  const [formData, setFormData] = useState({
    plate: '',
    threatLevel: 'CRITICAL',
    status: 'ACTIVE BOLO / INTERCEPT',
    caseNumber: '',
    crimeCategory: '',
    vehicle: '',
    color: '',
    owner: '',
    issuedBy: 'Special Crime Branch Unit',
    notes: '',
  });

  const handleCreateBolo = (e) => {
    e.preventDefault();
    if (!formData.plate || !formData.crimeCategory) return;

    const newTarget = {
      ...formData,
      plate: formData.plate.toUpperCase().trim(),
      issuedDate: new Date().toLocaleString(),
      confidenceThreshold: 90,
      matchCount: 0,
      lastSeen: 'Pending First Ingress',
      lastSeenTime: 'Just Now',
    };

    addWatchlistTarget(newTarget);
    setIsAddModalOpen(false);
    setFormData({
      plate: '',
      threatLevel: 'CRITICAL',
      status: 'ACTIVE BOLO / INTERCEPT',
      caseNumber: '',
      crimeCategory: '',
      vehicle: '',
      color: '',
      owner: '',
      issuedBy: 'Special Crime Branch Unit',
      notes: '',
    });
  };

  const filteredWatchlist = watchlist.filter((item) => {
    if (selectedThreat !== 'ALL' && item.threatLevel !== selectedThreat) return false;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      return (
        item.plate.toLowerCase().includes(q) ||
        item.crimeCategory.toLowerCase().includes(q) ||
        item.caseNumber.toLowerCase().includes(q) ||
        item.vehicle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-950/20 p-5 rounded-2xl border border-rose-500/30 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-500/50">
                HIGH THREAT BOLO REGISTRY
              </span>
              <span className="text-xs font-mono text-slate-400">
                {watchlist.length} ACTIVE NATIONAL BULLETINS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
              Watchlist Registry & BOLO Interception Targets
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Register New BOLO Target</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search BOLO plate, case, offense..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-400 text-[11px]">THREAT SEVERITY:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedThreat(level)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                selectedThreat === level
                  ? 'bg-rose-500 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* BOLO Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWatchlist.map((target) => {
          const isCritical = target.threatLevel === 'CRITICAL';

          return (
            <TacticalCard
              key={target.plate}
              alert={isCritical}
              corners={true}
              className="flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <HSRPPlate
                      plate={target.plate}
                      size="lg"
                      threatLevel={target.threatLevel}
                      onClick={() => selectVehicleForTracking(target.plate, 'tracking')}
                    />
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      CASE REF: <span className="text-cyan-300 font-bold">{target.caseNumber}</span>
                    </div>
                  </div>
                  <ThreatBadge level={target.threatLevel} size="sm" />
                </div>

                {/* Offense & Priority */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90">
                  <div className="flex items-center space-x-2 text-rose-300 font-mono text-xs font-bold">
                    <Flame className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{target.crimeCategory}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 font-sans leading-relaxed">
                    {target.notes}
                  </p>
                </div>

                {/* Spec Telemetry */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">VEHICLE DETAILS</span>
                    <span className="text-slate-200 font-bold">{target.vehicle}</span>
                    <span className="text-slate-400 block text-[10px]">({target.color})</span>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">ISSUING AUTHORITY</span>
                    <span className="text-slate-200 font-medium block truncate">{target.issuedBy}</span>
                    <span className="text-slate-400 block text-[10px]">{target.issuedDate}</span>
                  </div>
                </div>

                {/* Last Sighted Node */}
                <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">LAST RECORDED SIGHTING</span>
                    <span className="text-cyan-300 font-bold">{target.lastSeen}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{target.lastSeenTime}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => selectVehicleForTracking(target.plate, 'tracking')}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Reconstruct Route on GIS</span>
                </button>

                <button
                  onClick={() => selectVehicleForTracking(target.plate, 'dossier')}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-semibold"
                >
                  Full Dossier
                </button>
              </div>
            </TacticalCard>
          );
        })}
      </div>

      {/* Add BOLO Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl glass-dropdown border border-rose-500/40 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-mono font-bold text-white uppercase">
                  Register New Law Enforcement BOLO Target
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBolo} className="mt-4 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">LICENSE PLATE NUMBER *</label>
                  <input
                    type="text"
                    required
                    value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                    placeholder="e.g. MH-04-XX-9900"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-bold uppercase focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">THREAT SEVERITY LEVEL</label>
                  <select
                    value={formData.threatLevel}
                    onChange={(e) => setFormData({ ...formData, threatLevel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="CRITICAL">CRITICAL (Armed / Kidnap / Intercept)</option>
                    <option value="HIGH">HIGH (Stolen / Wanted Suspect)</option>
                    <option value="MEDIUM">MEDIUM (Traffic Infraction / Impound)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">CASE NUMBER / FIR REF *</label>
                  <input
                    type="text"
                    required
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    placeholder="e.g. CID-2026-BOLO-904"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">CRIME CATEGORY / CHARGE *</label>
                  <input
                    type="text"
                    required
                    value={formData.crimeCategory}
                    onChange={(e) => setFormData({ ...formData, crimeCategory: e.target.value })}
                    placeholder="e.g. Armed Bank Heist Getaway Vehicle"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">VEHICLE MAKE & MODEL</label>
                  <input
                    type="text"
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    placeholder="e.g. Toyota Fortuner 4x4"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">VEHICLE BODY COLOR</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Silver Metallic"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">TACTICAL DIRECTIVES & SUSPECT NOTES</label>
                <textarea
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Enter weapon warnings, co-traveler info, interception safety rules..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-sans focus:outline-none focus:border-rose-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg"
                >
                  Broadcast BOLO to Camera Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
