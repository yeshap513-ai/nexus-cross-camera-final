import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  Play, 
  Pause, 
  RotateCcw, 
  MapPin, 
  Clock, 
  Gauge, 
  ShieldAlert, 
  Cctv, 
  Layers, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  ChevronRight, 
  Info,
  Sparkles,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TacticalCard } from '../common/TacticalCard';
import { HSRPPlate } from '../common/HSRPPlate';
import { ThreatBadge } from '../common/ThreatBadge';

export const GISRouteTrackingView = () => {
  const {
    selectedVehiclePlate,
    setSelectedVehiclePlate,
    vehicleJourneys,
    watchlist,
    cameras,
    setActivePage,
    setSelectedCamera
  } = useApp();

  // Selected Target Journey Data
  const currentJourney = vehicleJourneys[selectedVehiclePlate] || vehicleJourneys['GJ-01-AB-1234'];
  const waypoints = currentJourney.waypoints;

  // Playback & Scrubber State
  const [currentStepIndex, setCurrentStepIndex] = useState(waypoints.length - 1);
  const [isPlayingRoute, setIsPlayingRoute] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Map Layer Toggles
  const [showFovCones, setShowFovCones] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showAllCameras, setShowAllCameras] = useState(true);
  const [mapZoom, setMapZoom] = useState(1);
  const [hoveredCamera, setHoveredCamera] = useState(null);
  const [activeWaypointModal, setActiveWaypointModal] = useState(null);

  // Auto playback loop
  useEffect(() => {
    let timer;
    if (isPlayingRoute) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= waypoints.length - 1) {
            setIsPlayingRoute(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2400 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlayingRoute, playbackSpeed, waypoints.length]);

  // Reset slider when vehicle changes
  useEffect(() => {
    setCurrentStepIndex(waypoints.length - 1);
    setIsPlayingRoute(false);
  }, [selectedVehiclePlate, waypoints.length]);

  const findCam = (camId) => {
    if (!camId) return null;
    const clean = camId.replace(/[-_]/g, '').toUpperCase();
    return cameras.find((c) => c.id.replace(/[-_]/g, '').toUpperCase() === clean) || null;
  };

  const activeWaypoint = waypoints[currentStepIndex] || waypoints[0];
  const activeCameraObj = findCam(activeWaypoint?.cameraId) || cameras[0];

  // Generate SVG path coordinate string for route up to currentStepIndex
  const getRoutePathCoordinates = () => {
    const points = waypoints.slice(0, currentStepIndex + 1).map((wp) => {
      const cam = findCam(wp.cameraId);
      return cam ? `${cam.mapX},${cam.mapY}` : '0,0';
    });
    return points.join(' L ');
  };

  const fullRoutePathCoordinates = () => {
    const points = waypoints.map((wp) => {
      const cam = findCam(wp.cameraId);
      return cam ? `${cam.mapX},${cam.mapY}` : '0,0';
    });
    return points.join(' L ');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Target Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-cyan-500/25 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                GIS RECONSTRUCTION ACTIVE
              </span>
              <span className="text-xs font-mono text-slate-400">
                MULTI-HOP SPATIO-TEMPORAL CORRELATION
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
              Cross-Camera Route Tracking & Trajectory Map
            </h1>
          </div>
        </div>

        {/* Target Vehicle Switcher Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">SELECT TARGET:</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(vehicleJourneys).map((plate) => {
              const j = vehicleJourneys[plate];
              const isSelected = selectedVehiclePlate === plate;
              return (
                <button
                  key={plate}
                  onClick={() => setSelectedVehiclePlate(plate)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>{plate}</span>
                  {j.target.threatLevel === 'CRITICAL' && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target Dossier Summary Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Target Card */}
        <div className="p-3.5 rounded-xl bg-[#090e1c] border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Target Plate</span>
            <div className="mt-1">
              <HSRPPlate plate={selectedVehiclePlate} size="sm" threatLevel={currentJourney.target.threatLevel} />
            </div>
          </div>
          <ThreatBadge level={currentJourney.target.threatLevel} size="xs" />
        </div>

        {/* Vehicle Spec */}
        <div className="p-3.5 rounded-xl bg-[#090e1c] border border-slate-800 flex flex-col justify-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Identified Vehicle</span>
          <span className="text-sm font-bold text-white truncate mt-0.5">
            {currentJourney.target.vehicle}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Color: {currentJourney.target.color}
          </span>
        </div>

        {/* Route Stats */}
        <div className="p-3.5 rounded-xl bg-[#090e1c] border border-slate-800 flex flex-col justify-center font-mono">
          <span className="text-[10px] text-slate-400 uppercase">Movement Metrics</span>
          <div className="flex items-center space-x-3 text-xs mt-0.5">
            <span className="text-cyan-300 font-bold">{currentJourney.totalHops} Cam Hops</span>
            <span>•</span>
            <span className="text-slate-200">{currentJourney.totalDistanceKm} km</span>
            <span>•</span>
            <span className="text-amber-300">Avg {currentJourney.avgSpeedKmH} km/h</span>
          </div>
        </div>

        {/* Quick Action to Full Dossier */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase block">Investigation Dossier</span>
            <span className="text-xs text-slate-300">Complete forensic timeline</span>
          </div>
          <button
            onClick={() => setActivePage('dossier')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Tactical Map Area + Playback Scrubber (Requirement C2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tactical GIS Map Canvas (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl bg-[#050811] border border-cyan-500/30 overflow-hidden shadow-2xl h-[520px] flex flex-col justify-between">
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 radar-grid opacity-75 pointer-events-none" />

            {/* Map Top Floating Controls Bar */}
            <div className="relative z-10 p-3 bg-[#080e1e]/90 backdrop-blur-md border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  SECTOR GRID // AHMEDABAD METROPOLITAN
                </span>
              </div>

              {/* Layer Toggles */}
              <div className="flex items-center space-x-2 text-[11px] font-mono">
                <button
                  onClick={() => setShowFovCones((prev) => !prev)}
                  className={`px-2 py-1 rounded transition-colors border ${
                    showFovCones
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  FOV Cones
                </button>
                <button
                  onClick={() => setShowHeatmap((prev) => !prev)}
                  className={`px-2 py-1 rounded transition-colors border ${
                    showHeatmap
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Density Heatmap
                </button>
                <button
                  onClick={() => setShowAllCameras((prev) => !prev)}
                  className={`px-2 py-1 rounded transition-colors border ${
                    showAllCameras
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  All Cameras
                </button>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
                  <button
                    onClick={() => setMapZoom((z) => Math.min(1.4, z + 0.1))}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setMapZoom((z) => Math.max(0.8, z - 0.1))}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setMapZoom(1)}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    title="Reset Zoom"
                  >
                    100%
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Interactive Map Canvas */}
            <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
              <svg
                viewBox="0 0 950 680"
                className="w-full h-full cursor-crosshair select-none transition-transform duration-300"
                style={{ transform: `scale(${mapZoom})` }}
              >
                {/* Background Roads and Arterials Network */}
                <g stroke="rgba(56, 189, 248, 0.12)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  {/* Outer Ring Road */}
                  <circle cx="475" cy="340" r="300" fill="none" strokeDasharray="6 4" />
                  {/* Inner Arterial Ring */}
                  <circle cx="475" cy="340" r="170" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="3" />
                  {/* Expressway Diagonal */}
                  <line x1="80" y1="120" x2="880" y2="600" strokeWidth="6" stroke="rgba(56, 189, 248, 0.18)" />
                  <line x1="120" y1="580" x2="820" y2="100" strokeWidth="5" stroke="rgba(56, 189, 248, 0.14)" />
                  {/* River corridor */}
                  <path
                    d="M 660 60 Q 720 200 680 360 T 640 640"
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.25)"
                    strokeWidth="14"
                  />
                </g>

                {/* Heatmap density overlay when enabled */}
                {showHeatmap && (
                  <g opacity="0.4">
                    <circle cx="450" cy="480" r="90" fill="url(#heatGradient1)" />
                    <circle cx="270" cy="360" r="80" fill="url(#heatGradient2)" />
                    <circle cx="580" cy="620" r="100" fill="url(#heatGradient1)" />
                  </g>
                )}

                <defs>
                  <radialGradient id="heatGradient1">
                    <stop offset="0%" stopColor="#ff3366" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="heatGradient2">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Full Prospective Route (Dotted Ghost Line) */}
                <path
                  d={`M ${fullRoutePathCoordinates()}`}
                  fill="none"
                  stroke="rgba(6, 182, 212, 0.2)"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                />

                {/* Active Historical Route Path Line (Glow Neon Cyan/Red) */}
                {currentStepIndex > 0 && (
                  <g>
                    {/* Route Glow Shadow */}
                    <path
                      d={`M ${getRoutePathCoordinates()}`}
                      fill="none"
                      stroke={currentJourney.target.threatLevel === 'CRITICAL' ? '#ff3366' : '#00f0ff'}
                      strokeWidth="8"
                      strokeOpacity="0.3"
                      strokeLinecap="round"
                    />
                    {/* Main Sharp Neon Route Line */}
                    <path
                      d={`M ${getRoutePathCoordinates()}`}
                      fill="none"
                      stroke={currentJourney.target.threatLevel === 'CRITICAL' ? '#ff3366' : '#00f0ff'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  </g>
                )}

                {/* Draw Camera Nodes & FOV Cones */}
                {cameras.map((cam) => {
                  const isNodeInTargetRoute = currentJourney.routeNodes.includes(cam.id);
                  const waypointIndex = waypoints.findIndex((w) => w.cameraId === cam.id);
                  const isPassedInCurrentStep = waypointIndex !== -1 && waypointIndex <= currentStepIndex;
                  const isCurrentActiveNode = activeWaypoint.cameraId === cam.id;

                  if (!showAllCameras && !isNodeInTargetRoute) return null;

                  return (
                    <g
                      key={cam.id}
                      transform={`translate(${cam.mapX}, ${cam.mapY})`}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredCamera(cam)}
                      onMouseLeave={() => setHoveredCamera(null)}
                      onClick={() => {
                        setSelectedCamera(cam);
                        setActiveWaypointModal(cam);
                      }}
                    >
                      {/* FOV Coverage Cone */}
                      {showFovCones && (
                        <path
                          d="M 0 0 L -35 -60 A 70 70 0 0 1 35 -60 Z"
                          transform={`rotate(${cam.fovAngle})`}
                          fill={isCurrentActiveNode ? 'rgba(255, 51, 102, 0.25)' : 'rgba(6, 182, 212, 0.08)'}
                          stroke={isCurrentActiveNode ? 'rgba(255, 51, 102, 0.6)' : 'rgba(6, 182, 212, 0.25)'}
                          strokeWidth="1"
                        />
                      )}

                      {/* Ripple animation for current active node */}
                      {isCurrentActiveNode && (
                        <circle
                          r="22"
                          fill="none"
                          stroke={currentJourney.target.threatLevel === 'CRITICAL' ? '#ff3366' : '#00f0ff'}
                          strokeWidth="2"
                          className="animate-ping opacity-60"
                        />
                      )}

                      {/* Camera Node Center Point */}
                      <circle
                        r={isCurrentActiveNode ? '11' : isPassedInCurrentStep ? '8' : '6'}
                        fill={
                          isCurrentActiveNode
                            ? '#ff3366'
                            : isPassedInCurrentStep
                            ? '#00f0ff'
                            : '#1e293b'
                        }
                        stroke={isPassedInCurrentStep ? '#ffffff' : '#38bdf8'}
                        strokeWidth="2"
                        className="transition-all"
                      />

                      {/* Waypoint Step Number Pill */}
                      {waypointIndex !== -1 && isPassedInCurrentStep && (
                        <g transform="translate(0, -18)">
                          <rect
                            x="-10"
                            y="-8"
                            width="20"
                            height="16"
                            rx="4"
                            fill="#080d1a"
                            stroke="#00f0ff"
                            strokeWidth="1"
                          />
                          <text
                            textAnchor="middle"
                            y="4"
                            fill="#00f0ff"
                            fontSize="10"
                            fontFamily="JetBrains Mono"
                            fontWeight="bold"
                          >
                            #{waypointIndex + 1}
                          </text>
                        </g>
                      )}

                      {/* Node Label Text */}
                      <text
                        y="20"
                        textAnchor="middle"
                        fill={isCurrentActiveNode ? '#ffffff' : '#94a3b8'}
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        fontWeight={isCurrentActiveNode ? 'bold' : 'normal'}
                      >
                        {cam.id}
                      </text>
                    </g>
                  );
                })}

                {/* Animated Target Vehicle Beacon Marker on active node */}
                {activeCameraObj && (
                  <g
                    transform={`translate(${activeCameraObj.mapX}, ${activeCameraObj.mapY})`}
                    className="pointer-events-none"
                  >
                    <g transform="translate(0, -32)">
                      <rect
                        x="-45"
                        y="-12"
                        width="90"
                        height="24"
                        rx="6"
                        fill="rgba(8, 13, 26, 0.95)"
                        stroke="#ff3366"
                        strokeWidth="1.5"
                      />
                      <text
                        textAnchor="middle"
                        y="4"
                        fill="#ff3366"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        TARGET HERE
                      </text>
                    </g>
                  </g>
                )}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredCamera && (
                <div className="absolute top-16 right-4 z-20 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl font-mono text-xs w-64 backdrop-blur-md">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="text-cyan-400 font-bold">{hoveredCamera.id}</span>
                    <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-300">
                      {hoveredCamera.status}
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs font-sans mt-1.5 font-semibold">
                    {hoveredCamera.name}
                  </p>
                  <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                    <div>Sector: {hoveredCamera.sector}</div>
                    <div>VMS: {hoveredCamera.vms}</div>
                    <div>Today Scans: {hoveredCamera.scansToday.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Timeline Scrubber & Player Controls (Mandatory Requirement C2) */}
            <div className="relative z-10 p-4 bg-[#080d1a]/95 backdrop-blur-xl border-t border-cyan-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center space-x-3">
                  {/* Play / Pause Playback */}
                  <button
                    onClick={() => {
                      if (currentStepIndex >= waypoints.length - 1) {
                        setCurrentStepIndex(0);
                      }
                      setIsPlayingRoute((prev) => !prev);
                    }}
                    className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    title={isPlayingRoute ? 'Pause Route Playback' : 'Play Animated Route History'}
                  >
                    {isPlayingRoute ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsPlayingRoute(false);
                      setCurrentStepIndex(0);
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                    title="Rewind to Step 1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="font-mono">
                    <span className="text-xs font-bold text-slate-200">
                      HOP {currentStepIndex + 1} OF {waypoints.length}
                    </span>
                    <span className="text-[10px] text-cyan-400 block">
                      {activeWaypoint.timestamp} // {activeWaypoint.cameraName}
                    </span>
                  </div>
                </div>

                {/* Speed Multipliers for Playback */}
                <div className="flex items-center space-x-1.5 font-mono text-xs">
                  <span className="text-slate-400 text-[11px]">Speed:</span>
                  {[1, 2, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        playbackSpeed === s
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Range Slider Scrubber */}
              <div className="space-y-1 mt-2">
                <input
                  type="range"
                  min="0"
                  max={waypoints.length - 1}
                  step="1"
                  value={currentStepIndex}
                  onChange={(e) => {
                    setIsPlayingRoute(false);
                    setCurrentStepIndex(parseInt(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                />
                
                {/* Step Waypoint Markers below slider */}
                <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                  {waypoints.map((wp, idx) => (
                    <button
                      key={wp.step}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`hover:text-cyan-300 transition-colors ${
                        idx === currentStepIndex ? 'text-cyan-400 font-bold' : ''
                      }`}
                    >
                      Step {wp.step} ({wp.cameraId})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Waypoint Forensic Intelligence & Correlation Analysis */}
        <div className="space-y-4">
          <TacticalCard
            title={`Waypoint #${activeWaypoint.step} Forensic Lock`}
            subtitle="Cross-camera ANPR capture & anomaly telemetry"
            icon={MapPin}
            alert={!!activeWaypoint.anomaly}
          >
            {/* Camera Frame Preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video bg-slate-950 group">
              <img
                src={activeWaypoint.cropUrl}
                alt="Camera Capture Crop"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              
              {/* Detection Bounding Box Simulation */}
              <div className="absolute inset-6 border-2 border-dashed border-cyan-400/90 rounded pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between items-start">
                  <span className="px-1.5 py-0.5 bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold rounded">
                    OCR: {activeWaypoint.plateSnippet} ({activeWaypoint.confidence}%)
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-950/80 text-cyan-300 font-mono text-[9px] rounded border border-cyan-500/40">
                    {activeWaypoint.speed} KM/H
                  </span>
                </div>
                <div className="text-[9px] font-mono text-cyan-300 bg-slate-950/70 p-1 rounded">
                  {activeWaypoint.direction}
                </div>
              </div>

              {/* Timestamp Watermark */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-300 z-10">
                <span>{activeWaypoint.timestamp}</span>
                <span className="text-cyan-400">{activeWaypoint.cameraId}</span>
              </div>
            </div>

            {/* Waypoint Telemetry Matrix */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">CAMERA NODE</span>
                <span className="text-slate-100 font-bold block mt-0.5 truncate">
                  {activeWaypoint.cameraName}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">DETECTED SPEED</span>
                <span className="text-amber-400 font-bold text-sm block mt-0.5">
                  {activeWaypoint.speed} km/h
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">LANE ALLOCATION</span>
                <span className="text-slate-200 font-medium block mt-0.5">
                  {activeWaypoint.lane}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AI OCR CONFIDENCE</span>
                <span className="text-cyan-300 font-bold text-sm block mt-0.5">
                  {activeWaypoint.confidence}%
                </span>
              </div>
            </div>

            {/* Anomaly Detection Banner */}
            {activeWaypoint.anomaly ? (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/60 text-rose-200 text-xs">
                <div className="flex items-center space-x-1.5 font-mono font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>ANOMALY FLAGGED</span>
                </div>
                <p className="mt-1 font-sans text-slate-200 leading-relaxed text-[11px]">
                  {activeWaypoint.anomaly}
                </p>
              </div>
            ) : (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-[11px]">Standard corridor trajectory verified</span>
              </div>
            )}

            {/* Officer Notes */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              <span className="text-[10px] font-mono text-cyan-400 block mb-1">INTEL LOG:</span>
              <p className="font-sans leading-relaxed text-[11px]">
                {activeWaypoint.notes}
              </p>
            </div>
          </TacticalCard>
        </div>

      </div>
    </div>
  );
};
