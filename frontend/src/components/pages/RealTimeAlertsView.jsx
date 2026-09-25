import React, { useState } from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  Flame, 
  CheckCircle2, 
  Navigation, 
  Radio, 
  FileText, 
  Filter, 
  Sparkles,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TacticalCard } from '../common/TacticalCard';
import { HSRPPlate } from '../common/HSRPPlate';
import { ThreatBadge } from '../common/ThreatBadge';

export const RealTimeAlertsView = () => {
  const { alertsLog, acknowledgeAlert, selectVehicleForTracking, setActivePage, addToast } = useApp();

  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [dispatchedUnits, setDispatchedUnits] = useState({});

  const handleDispatch = (alertId, plate) => {
    setDispatchedUnits((prev) => ({ ...prev, [alertId]: 'Unit QRT-Interceptor En Route' }));
    addToast({
      title: `POLICE UNIT DISPATCHED: ${plate}`,
      plate: plate,
      message: 'Quick Response Team Echo-4 deployed for tactical roadblock.',
      threatLevel: 'HIGH',
      cameraName: 'Dispatch Command',
      cameraId: 'DISPATCH',
    });
  };

  const filteredAlerts = alertsLog.filter((a) => {
    if (filterSeverity !== 'ALL' && a.threatLevel !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/25 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              REAL-TIME INTERCEPTION DISPATCH
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
              Live Threat Alert Queue & Interdiction Logs
            </h1>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px]">FILTER:</span>
          {['ALL', 'CRITICAL', 'HIGH'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterSeverity === sev
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.threatLevel === 'CRITICAL';
          const isDispatched = !!dispatchedUnits[alert.id];

          return (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 backdrop-blur-xl ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                  : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Alert Info */}
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {alert.id}
                      </span>
                      <ThreatBadge level={alert.threatLevel} size="xs" />
                      <span className="text-xs font-mono text-slate-400">
                        {alert.timestamp}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white font-sans mt-1">
                      {alert.title}
                    </h3>

                    <div className="flex items-center space-x-2 mt-1 font-mono text-xs text-slate-400">
                      <span>LOCATION:</span>
                      <span className="text-cyan-300 font-bold">{alert.cameraId}</span>
                      <span>({alert.cameraName})</span>
                    </div>
                  </div>
                </div>

                {/* Right: Plate & Tactical Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <HSRPPlate
                    plate={alert.plate}
                    size="md"
                    threatLevel={alert.threatLevel}
                    onClick={() => selectVehicleForTracking(alert.plate, 'tracking')}
                  />

                  {/* Acknowledge Button */}
                  {!alert.acknowledged ? (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-mono font-semibold transition-all"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACKNOWLEDGED</span>
                    </span>
                  )}

                  {/* Dispatch Intercept Unit */}
                  <button
                    onClick={() => handleDispatch(alert.id, alert.plate)}
                    disabled={isDispatched}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                      isDispatched
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isDispatched ? 'UNIT DEPLOYED' : 'Dispatch Unit'}</span>
                  </button>

                  {/* Track on GIS Map */}
                  <button
                    onClick={() => selectVehicleForTracking(alert.plate, 'tracking')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Track on Map</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
