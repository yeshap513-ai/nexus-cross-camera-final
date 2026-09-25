import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Navigation, 
  Calendar, 
  Clock, 
  Car, 
  MapPin, 
  ShieldAlert, 
  FileText, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TacticalCard } from '../common/TacticalCard';
import { HSRPPlate } from '../common/HSRPPlate';
import { ThreatBadge } from '../common/ThreatBadge';

export const VehicleSearchView = () => {
  const { anprScans, selectVehicleForTracking, watchlist, cameras, setActivePage } = useApp();

  const [plateQuery, setPlateQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('ALL');
  const [selectedColor, setSelectedColor] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [threatOnly, setThreatOnly] = useState(false);

  // Filter scans based on multi-parameter query
  const searchResults = anprScans.filter((scan) => {
    if (plateQuery.trim()) {
      const cleanQ = plateQuery.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const cleanP = scan.plate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (!cleanP.includes(cleanQ)) return false;
    }
    if (selectedMake !== 'ALL' && !scan.makeModel.toLowerCase().includes(selectedMake.toLowerCase())) {
      return false;
    }
    if (selectedColor !== 'ALL' && !scan.color.toLowerCase().includes(selectedColor.toLowerCase())) {
      return false;
    }
    if (selectedSector !== 'ALL') {
      const cam = cameras.find((c) => c.id === scan.cameraId);
      if (cam && !cam.sector.toLowerCase().includes(selectedSector.toLowerCase())) {
        return false;
      }
    }
    if (threatOnly && scan.threatLevel === 'CLEAR') {
      return false;
    }
    return true;
  });

  const resetFilters = () => {
    setPlateQuery('');
    setSelectedMake('ALL');
    setSelectedColor('ALL');
    setSelectedSector('ALL');
    setThreatOnly(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search Header Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/25 backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              CROSS-CORRELATION ENGINE
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
              Historical & Real-Time Vehicle ANPR Intelligence Search
            </h1>
          </div>
        </div>

        {/* Multi-Parameter Search Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* License Plate Search (Fuzzy / Partial) */}
          <div className="lg:col-span-2">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              LICENSE PLATE (FULL OR PARTIAL):
            </label>
            <div className="relative">
              <input
                type="text"
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value)}
                placeholder="e.g. GJ-01-AB-1234, 1234, DL-03..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
              />
              {plateQuery && (
                <button
                  onClick={() => setPlateQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Vehicle Make/Model */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              VEHICLE MAKE / MODEL:
            </label>
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Models</option>
              <option value="Scorpio">Mahindra Scorpio</option>
              <option value="Fortuner">Toyota Fortuner</option>
              <option value="City">Honda City</option>
              <option value="Creta">Hyundai Creta</option>
              <option value="Nexon">Tata Nexon EV</option>
              <option value="Royal Enfield">Royal Enfield Bike</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              BODY COLOR:
            </label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Colors</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Silver">Silver</option>
              <option value="Grey">Grey</option>
              <option value="Red">Red</option>
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              CAMERA ZONE:
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Grid Sectors</option>
              <option value="North">North Corridor</option>
              <option value="Expressway">Outer Expressway</option>
              <option value="Central">Central Metro</option>
              <option value="Industrial">Industrial South</option>
              <option value="Riverfront">Riverfront Corridor</option>
            </select>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setThreatOnly((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                threatOnly
                  ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Flagged BOLO Only ({searchResults.filter((s) => s.isWatchlistHit).length})
            </button>

            {/* Quick Demo Plates */}
            <span className="text-slate-500 hidden md:inline">Quick Samples:</span>
            {['GJ-01-AB-1234', 'DL-03-CC-9988', 'MH-12-DE-4567'].map((p) => (
              <button
                key={p}
                onClick={() => setPlateQuery(p)}
                className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px]"
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 text-slate-400 hover:text-cyan-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Search Results Count */}
      <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1">
        <span>MATCHING RECORDS FOUND: {searchResults.length}</span>
        <span>CORRELATION ENGINE ACCURACY: 99.4%</span>
      </div>

      {/* Results Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((result, idx) => {
          const isThreat = result.isWatchlistHit;

          return (
            <TacticalCard
              key={result.id + '-' + idx}
              corners={true}
              alert={isThreat}
              className="flex flex-col justify-between"
            >
              <div>
                {/* Header with Plate & Threat Badge */}
                <div className="flex items-center justify-between mb-3">
                  <HSRPPlate
                    plate={result.plate}
                    size="md"
                    threatLevel={result.threatLevel}
                    onClick={() => selectVehicleForTracking(result.plate, 'tracking')}
                  />
                  <ThreatBadge level={result.threatLevel} size="xs" />
                </div>

                {/* Vehicle Thumbnail & Specs */}
                <div className="flex space-x-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <img
                    src={result.thumbnail}
                    alt={result.makeModel}
                    className="w-20 h-16 object-cover rounded-lg border border-slate-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {result.makeModel}
                    </h4>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      <div>Color: <span className="text-slate-200">{result.color}</span></div>
                      <div>Type: <span className="text-cyan-400">{result.vehicleType}</span></div>
                    </div>
                  </div>
                </div>

                {/* Telemetry Log */}
                <div className="mt-3 space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>LAST SEEN CAMERA:</span>
                    <span className="text-cyan-300 font-bold">{result.cameraId}</span>
                  </div>
                  <div className="text-slate-300 truncate text-[11px] font-sans">
                    {result.cameraName}
                  </div>
                  <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>SPEED: <span className="text-slate-200 font-bold">{result.speed} km/h</span></span>
                    <span>CONF: <span className="text-cyan-400 font-bold">{result.confidence}%</span></span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => selectVehicleForTracking(result.plate, 'tracking')}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Track Route on GIS</span>
                </button>

                <button
                  onClick={() => selectVehicleForTracking(result.plate, 'dossier')}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                  title="View Full Investigation Dossier"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </TacticalCard>
          );
        })}
      </div>
    </div>
  );
};
