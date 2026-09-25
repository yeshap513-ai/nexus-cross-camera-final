import React, { useState } from 'react';
import { 
  Cctv, 
  Grid, 
  Maximize, 
  Camera, 
  Eye, 
  EyeOff, 
  Radio, 
  Move, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon, 
  Flame, 
  ShieldAlert, 
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TacticalCard } from '../common/TacticalCard';
import { HSRPPlate } from '../common/HSRPPlate';
import { getVideoUrl } from '../../services/api';

export const LiveCamerasView = () => {
  const { cameras, selectedCamera, setSelectedCamera, anprScans, selectVehicleForTracking } = useApp();

  const [gridSize, setGridSize] = useState('2x2'); // '2x2' | '3x3' | '1x1'
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [isNightVision, setIsNightVision] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [activeCamModal, setActiveCamModal] = useState(null);

  const filteredCameras = cameras.filter((cam) => {
    if (selectedSector === 'ALL') return true;
    return cam.sector.toLowerCase().includes(selectedSector.toLowerCase());
  });

  const getVisibleCameras = () => {
    if (gridSize === '1x1') return filteredCameras.slice(0, 1);
    if (gridSize === '2x2') return filteredCameras.slice(0, 4);
    if (gridSize === '3x3') return filteredCameras.slice(0, 9);
    return filteredCameras.slice(0, 6);
  };

  const visibleCams = getVisibleCameras();

  // Stock tactical traffic CCTV imagery
  const sampleCctvImages = [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590362891988-f778047020a6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-cyan-500/25 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cctv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                RTSP / ONVIF STREAMING ACTIVE
              </span>
              <span className="text-xs font-mono text-slate-400">
                {cameras.length} VMS NODES CONVERGED
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5">
              Live Surveillance Wall & Multi-Feed Matrix
            </h1>
          </div>
        </div>

        {/* Matrix Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Night Vision / Thermal Toggle */}
          <button
            onClick={() => setIsNightVision((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              isNightVision
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>{isNightVision ? 'THERMAL ON' : 'OPTICAL MODE'}</span>
          </button>

          {/* Bounding Boxes Toggle */}
          <button
            onClick={() => setShowBoundingBoxes((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              showBoundingBoxes
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>AI Overlays</span>
          </button>

          {/* Grid Layout Selector */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['1x1', '2x2', '3x3'].map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`px-2 py-1 text-xs font-mono rounded font-bold transition-all ${
                  gridSize === size
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Sector Selector */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Sectors ({cameras.length})</option>
            <option value="North">North Corridor</option>
            <option value="Expressway">Outer Expressway</option>
            <option value="Central">Central Metro</option>
            <option value="Industrial">Industrial South</option>
          </select>
        </div>
      </div>

      {/* Camera Matrix Grid */}
      <div
        className={`grid gap-4 ${
          gridSize === '1x1'
            ? 'grid-cols-1'
            : gridSize === '2x2'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {visibleCams.map((cam, idx) => {
          // Find latest scan for this camera
          const latestCamScan = anprScans.find((s) => s.cameraId === cam.id);
          const bgImg = sampleCctvImages[idx % sampleCctvImages.length];

          return (
            <div
              key={cam.id}
              className="group relative rounded-2xl overflow-hidden bg-[#060a14] border border-cyan-500/25 hover:border-cyan-400 shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Camera Video Area */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                {cam.videoUrl ? (
                  <video
                    src={getVideoUrl(showBoundingBoxes && cam.annotatedVideoUrl ? cam.annotatedVideoUrl : cam.videoUrl)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      isNightVision ? 'filter invert brightness-125 contrast-150 hue-rotate-90' : ''
                    }`}
                  />
                ) : (
                  <img
                    src={bgImg}
                    alt={cam.name}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      isNightVision ? 'filter invert brightness-125 contrast-150 hue-rotate-90' : ''
                    }`}
                  />
                )}

                {/* Scanline CRT overlay */}
                <div className="absolute inset-0 scanlines pointer-events-none opacity-40" />

                {/* Top Video HUD Watermark */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-bold">{cam.id}</span>
                    <span className="text-slate-400">|</span>
                    <span>{cam.fps} FPS</span>
                    <span className="text-slate-400">|</span>
                    <span>{cam.resolution}</span>
                  </div>

                  <div className="bg-rose-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-rose-500/40 text-[9px] font-mono text-rose-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>REC // ONVIF</span>
                  </div>
                </div>

                {/* Bounding Box & OCR Detection Simulation */}
                {showBoundingBoxes && (
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-cyan-400/90 rounded-sm pointer-events-none p-1.5 flex flex-col justify-between shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    <div className="flex items-center justify-between">
                      <span className="px-1 py-0.2 bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold rounded-sm">
                        VEHICLE: SUV 99.2%
                      </span>
                      <span className="px-1 py-0.2 bg-slate-950/90 text-cyan-300 font-mono text-[9px] rounded-sm border border-cyan-500/40">
                        {cam.ptz ? 'PTZ LOCKED' : 'FIXED ANGLE'}
                      </span>
                    </div>

                    {latestCamScan && (
                      <div className="bg-slate-950/90 backdrop-blur-md p-1.5 rounded border border-cyan-500/40 text-left font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{latestCamScan.plate}</span>
                          <span className="text-[9px] text-cyan-400">{latestCamScan.speed} km/h</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Video HUD Overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 pointer-events-none z-10">
                  <span className="truncate max-w-[220px] font-sans text-white font-medium">
                    {cam.name}
                  </span>
                  <span className="text-cyan-400">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Bottom Quick Camera Controls & Telemetry */}
              <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">VMS SOURCE</span>
                  <span className="text-cyan-300 font-semibold truncate block max-w-[180px]">
                    {cam.vms}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {latestCamScan && (
                    <button
                      onClick={() => selectVehicleForTracking(latestCamScan.plate, 'tracking')}
                      className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition-all"
                      title="Track scanned vehicle on map"
                    >
                      Track Plate
                    </button>
                  )}

                  <button
                    onClick={() => setActiveCamModal(cam)}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
                    title="Fullscreen PTZ & Stream Inspector"
                  >
                    <Maximize className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PTZ / Camera Inspector Modal */}
      {activeCamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl rounded-2xl glass-dropdown border border-cyan-500/40 shadow-2xl p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Cctv className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-mono font-bold text-white">
                    {activeCamModal.id} // {activeCamModal.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    IP: {activeCamModal.ip} | VMS: {activeCamModal.vms} | Sector: {activeCamModal.sector}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveCamModal(null)}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700"
              >
                Close (ESC)
              </button>
            </div>

            {/* Modal Video View */}
            <div className="relative aspect-video rounded-xl overflow-hidden mt-4 bg-slate-950 border border-cyan-500/30">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
                alt="Large Feed"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
            </div>

            {/* PTZ Joystick Simulation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 font-bold block mb-2">PTZ CONTROL PADS</span>
                <div className="grid grid-cols-3 gap-1 w-28 mx-auto">
                  <div />
                  <button className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-center">▲</button>
                  <div />
                  <button className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-center">◀</button>
                  <button className="p-1.5 bg-cyan-600 text-slate-950 font-bold rounded text-center">●</button>
                  <button className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-center">▶</button>
                  <div />
                  <button className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-center">▼</button>
                  <div />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-400 font-bold block">OPTICAL ZOOM & FOCUS</span>
                <div className="flex items-center justify-center space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-2 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700">
                    <ZoomIn className="w-4 h-4" />
                    <span>Tele 2.4x</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-2 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700">
                    <ZoomOut className="w-4 h-4" />
                    <span>Wide 1.0x</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 text-center">Auto-Tracking Assisted</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-400 font-bold block">SNAPSHOT & FORENSIC CLIP</span>
                <button className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center space-x-1.5">
                  <Camera className="w-4 h-4" />
                  <span>Capture 4K Hi-Res Frame</span>
                </button>
                <span className="text-[10px] text-emerald-400 text-center">Watermarked & Cryptographically Signed</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
