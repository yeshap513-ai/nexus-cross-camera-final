import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  ShieldAlert, 
  Cctv, 
  Scan, 
  Navigation, 
  Activity, 
  Zap, 
  Eye, 
  ExternalLink, 
  Filter, 
  Layers, 
  ArrowUpRight, 
  Flame, 
  Sparkles,
  Gauge,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TacticalCard } from '../common/TacticalCard';
import { HSRPPlate } from '../common/HSRPPlate';
import { ThreatBadge } from '../common/ThreatBadge';
import { 
  HOURLY_TRAFFIC_DATA, 
  VEHICLE_DISTRIBUTION_DATA, 
  VIOLATION_METRICS_DATA 
} from '../../data/mockData';

export const DashboardView = () => {
  const {
    anprScans,
    watchlist,
    cameras,
    selectVehicleForTracking,
    setActivePage,
    triggerDemoBurst,
    setSelectedCamera
  } = useApp();

  const [filterThreatOnly, setFilterThreatOnly] = useState(false);
  const [selectedSector, setSelectedSector] = useState('ALL');

  // Filter ANPR stream
  const filteredScans = anprScans.filter((scan) => {
    if (filterThreatOnly && scan.threatLevel === 'CLEAR') return false;
    if (selectedSector !== 'ALL') {
      const cam = cameras.find((c) => c.id === scan.cameraId);
      if (cam && !cam.sector.toLowerCase().includes(selectedSector.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  // Calculate live stats
  const totalScansCount = 142890 + anprScans.length;
  const watchlistHitsCount = anprScans.filter((s) => s.isWatchlistHit).length + 15;
  const activeCamerasCount = cameras.filter((c) => c.status === 'ONLINE').length;

  // Custom Dark Recharts Tooltip
  const CustomAreaTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-[#080d1a]/95 backdrop-blur-xl border border-cyan-500/40 p-3 shadow-2xl font-mono text-xs">
          <p className="text-cyan-300 font-bold mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            TIME: {label}
          </p>
          <div className="space-y-1">
            <p className="text-slate-300 flex items-center justify-between gap-4">
              <span>Plate Scans:</span>
              <span className="font-bold text-cyan-400">{payload[0]?.value?.toLocaleString()}</span>
            </p>
            <p className="text-slate-300 flex items-center justify-between gap-4">
              <span>BOLO / Threat Hits:</span>
              <span className="font-bold text-rose-400">{payload[1]?.value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Fast Tactical Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-950 p-4 sm:p-5 rounded-2xl border border-cyan-500/20 backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              AUTOMATED ANPR & CORRELATION ENGINE ACTIVE
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              POLICE VMS CONVERGENCE LAYER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-sans">
            Tactical Surveillance & Vehicle Movement Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-sans leading-relaxed">
            Real-time multi-camera OCR correlation across municipal VMS feeds. Identifying BOLO targets, trajectory forecasting, and cross-junction tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={triggerDemoBurst}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_25px_rgba(219,39,119,0.5)] active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate BOLO Rush</span>
          </button>

          <button
            onClick={() => setActivePage('tracking')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            <span>Launch GIS Route View</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Requirement C1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Scans */}
        <TacticalCard corners={true} glow={true} className="p-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                Total Plate Scans (24H)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
                {totalScansCount.toLocaleString()}
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-xs font-mono text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+14.8% vs yesterday</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Scan className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>OCR Rate: 99.2%</span>
            <span className="text-cyan-400">Throughput: ~320/min</span>
          </div>
        </TacticalCard>

        {/* KPI 2: Active Cameras */}
        <TacticalCard corners={true} className="p-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                Active Camera Fleet
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1 flex items-baseline gap-2">
                <span>{activeCamerasCount}</span>
                <span className="text-sm font-normal text-slate-400">/ {cameras.length} nodes</span>
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>100% Stream Health</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Cctv className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>VMS Ingestion: 5 Platforms</span>
            <span className="text-emerald-400">Latency: 12.4ms</span>
          </div>
        </TacticalCard>

        {/* KPI 3: Watchlist & BOLO Hits */}
        <TacticalCard corners={true} alert={true} className="p-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold text-rose-300 uppercase tracking-wider block">
                Watchlist & BOLO Hits
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-200 font-mono mt-1 flex items-baseline gap-2">
                <span>{watchlistHitsCount}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 font-bold animate-pulse">
                  ACTIVE INTERCEPT
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-xs font-mono text-rose-400">
                <Flame className="w-3.5 h-3.5" />
                <span>5 Critical Targets Sighted</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-900/60 flex items-center justify-between text-[10px] font-mono text-rose-300">
            <span>Target Auto-Lock: ON</span>
            <span className="underline cursor-pointer" onClick={() => setActivePage('watchlist')}>
              View BOLO DB →
            </span>
          </div>
        </TacticalCard>

        {/* KPI 4: Correlation Match Rate */}
        <TacticalCard corners={true} className="p-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                Cross-Camera Correlation
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
                96.8%
              </div>
              <div className="flex items-center space-x-1.5 mt-2 text-xs font-mono text-cyan-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Re-ID Vector Match</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Navigation className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Avg Hop Handoff: 2.1s</span>
            <span className="text-indigo-400">Multi-Junction Tracked</span>
          </div>
        </TacticalCard>
      </div>

      {/* Analytics Charts Section (Area & Donut Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 24-Hour Scan Throughput vs Threat Detections (Area Chart) */}
        <TacticalCard
          className="lg:col-span-2"
          title="24-Hour Scan Volume & Threat Frequency"
          subtitle="Real-time OCR throughput vs BOLO watchlist matches across all camera clusters"
          icon={Activity}
          action={
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Total Scans
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Threat Hits
              </span>
            </div>
          }
        >
          <div className="h-64 sm:h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_TRAFFIC_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff3366" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ff3366" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={11} 
                  fontFamily="JetBrains Mono" 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  fontFamily="JetBrains Mono" 
                  tickLine={false} 
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalScans"
                  stroke="#00f0ff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scanGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="threatsDetected"
                  stroke="#ff3366"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#threatGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TacticalCard>

        {/* Right Col: Vehicle Classification Breakdown (Donut Chart) */}
        <TacticalCard
          title="Vehicle Classification"
          subtitle="YOLOv8 deep learning vehicle type taxonomy"
          icon={Gauge}
        >
          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={VEHICLE_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {VEHICLE_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#070b16" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{
                    backgroundColor: '#080d1a',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                    color: '#f8fafc'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-white">100%</span>
              <span className="text-[10px] text-slate-400 font-mono">Taxonomy</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
            {VEHICLE_DISTRIBUTION_DATA.map((item) => (
              <div key={item.name} className="flex items-center space-x-2 text-xs font-mono">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 truncate text-[11px]">{item.name}</span>
                <span className="text-slate-400 font-bold ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </TacticalCard>
      </div>

      {/* LIVE ANPR STREAM DATA TABLE (Requirement C1) */}
      <TacticalCard
        title="Live ANPR Ingestion Feed & Scanned Plates"
        subtitle="Continuous edge OCR stream with instant cross-camera BOLO match correlation"
        icon={Scan}
        action={
          <div className="flex items-center space-x-2">
            {/* Filter Threat Only Toggle */}
            <button
              onClick={() => setFilterThreatOnly((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
                filterThreatOnly
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Flame className="w-3 h-3" />
                Threats Only ({anprScans.filter((s) => s.isWatchlistHit).length})
              </span>
            </button>

            {/* Sector Dropdown */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Sectors</option>
              <option value="North">North Corridor</option>
              <option value="Expressway">Outer Expressway</option>
              <option value="Central">Central Metro</option>
              <option value="Industrial">Industrial South</option>
            </select>
          </div>
        }
      >
        {/* Table Container with Generous Row Padding & Styling */}
        <div className="overflow-x-auto -mx-4 sm:-mx-5">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Plate Number (HSRP)</th>
                <th className="py-3 px-4 font-semibold">Vehicle Specs</th>
                <th className="py-3 px-4 font-semibold">Camera Node / Location</th>
                <th className="py-3 px-4 font-semibold">Speed / Limit</th>
                <th className="py-3 px-4 font-semibold">AI Confidence</th>
                <th className="py-3 px-4 font-semibold">Status / Threat</th>
                <th className="py-3 px-4 font-semibold text-right">Tactical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
              {filteredScans.slice(0, 10).map((scan, idx) => {
                const isThreat = scan.isWatchlistHit;
                const isOverSpeed = scan.speed > scan.speedLimit;

                return (
                  <tr
                    key={scan.id + '-' + idx}
                    className={`transition-colors duration-150 group ${
                      isThreat
                        ? 'bg-rose-950/20 hover:bg-rose-950/40 border-l-2 border-l-rose-500'
                        : 'hover:bg-slate-900/60 border-l-2 border-l-transparent'
                    }`}
                  >
                    {/* HSRP Badge & Timestamp */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-2.5">
                        <HSRPPlate
                          plate={scan.plate}
                          size="md"
                          threatLevel={scan.threatLevel}
                          onClick={() => selectVehicleForTracking(scan.plate, 'tracking')}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        {scan.timestamp} // {scan.ocrEngine}
                      </span>
                    </td>

                    {/* Vehicle Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span>{scan.makeModel}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>Color: {scan.color}</span>
                        <span>•</span>
                        <span className="text-cyan-400">{scan.vehicleType}</span>
                      </div>
                    </td>

                    {/* Camera Node */}
                    <td className="py-3.5 px-4 font-mono">
                      <button
                        onClick={() => {
                          const camObj = cameras.find((c) => c.id === scan.cameraId);
                          if (camObj) {
                            setSelectedCamera(camObj);
                            setActivePage('cameras');
                          }
                        }}
                        className="text-left group-hover:text-cyan-300 transition-colors"
                      >
                        <div className="flex items-center space-x-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                            {scan.cameraId}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-300 block truncate max-w-[200px] mt-1 font-sans">
                          {scan.cameraName}
                        </span>
                      </button>
                    </td>

                    {/* Speed Indicator */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`font-bold text-sm ${
                            isOverSpeed ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          {scan.speed} km/h
                        </span>
                        {isOverSpeed && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            SPEEDING
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Limit: {scan.speedLimit} km/h
                      </span>
                    </td>

                    {/* AI Confidence Bar */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-cyan-300">
                          {scan.confidence}%
                        </span>
                      </div>
                      <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            scan.confidence > 98
                              ? 'bg-cyan-400 shadow-[0_0_6px_#00f0ff]'
                              : 'bg-indigo-400'
                          }`}
                          style={{ width: `${scan.confidence}%` }}
                        />
                      </div>
                    </td>

                    {/* Threat Level */}
                    <td className="py-3.5 px-4">
                      <ThreatBadge level={scan.threatLevel} size="xs" />
                      {scan.boloCase && (
                        <span className="text-[10px] font-mono text-rose-400 block mt-1 font-bold">
                          {scan.boloCase}
                        </span>
                      )}
                    </td>

                    {/* Quick Tactical Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => selectVehicleForTracking(scan.plate, 'tracking')}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold transition-all shadow-sm"
                          title="Track vehicle across all cameras on GIS Tactical Map"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </button>

                        <button
                          onClick={() => selectVehicleForTracking(scan.plate, 'dossier')}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all"
                          title="Open Comprehensive Law Enforcement Dossier"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Ticker */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Displaying live edge OCR scans (Auto-refreshing buffer)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>Buffer Size: {filteredScans.length} detections</span>
            <button
              onClick={() => setActivePage('search')}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Advanced Search Engine →
            </button>
          </div>
        </div>
      </TacticalCard>
    </div>
  );
};
