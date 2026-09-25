import React, { useState } from 'react';
import { 
  Server, 
  Cctv, 
  Activity, 
  Wifi, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  Search 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TacticalCard } from '../common/TacticalCard';

export const CameraFleetView = () => {
  const { cameras, setSelectedCamera, setActivePage } = useApp();
  const [search, setSearch] = useState('');
  const [selectedVms, setSelectedVms] = useState('ALL');

  const filteredCams = cameras.filter((c) => {
    if (selectedVms !== 'ALL' && !c.vms.toLowerCase().includes(selectedVms.toLowerCase())) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/25 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              VMS CONVERGENCE MIDDLEWARE
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
              Heterogeneous Camera Fleet & Edge Node Health
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>24/24 NODES SYNCHRONIZED</span>
          </span>
        </div>
      </div>

      {/* Fleet Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Camera ID, Sector, Intersection..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-slate-400 text-[11px]">VMS PLATFORM:</span>
          {['ALL', 'Genetec', 'Milestone', 'HikCentral', 'Dahua'].map((vms) => (
            <button
              key={vms}
              onClick={() => setSelectedVms(vms)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                selectedVms === vms
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {vms}
            </button>
          ))}
        </div>
      </div>

      {/* Cameras Fleet Table */}
      <TacticalCard corners={true} className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] text-slate-400 uppercase">
                <th className="py-3 px-4">Node ID</th>
                <th className="py-3 px-4">Camera Name & Sector</th>
                <th className="py-3 px-4">VMS Middleware Platform</th>
                <th className="py-3 px-4">Stream RTSP / IP</th>
                <th className="py-3 px-4">Resolution / FPS</th>
                <th className="py-3 px-4">Scans Today</th>
                <th className="py-3 px-4">PTZ Capability</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCams.map((cam) => (
                <tr key={cam.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-300">
                    {cam.id}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-medium text-white">
                    {cam.name}
                    <span className="block font-mono text-[10px] text-slate-400">{cam.sector} ({cam.zone})</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {cam.vms}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    rtsp://{cam.ip}:554/live
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {cam.resolution} @ {cam.fps} FPS
                  </td>
                  <td className="py-3.5 px-4 font-bold text-cyan-400">
                    {cam.scansToday.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {cam.ptz ? (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px]">
                        PTZ 360°
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        Fixed Angle
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ONLINE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TacticalCard>
    </div>
  );
};
