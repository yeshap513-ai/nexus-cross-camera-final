import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldAlert, 
  Navigation, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  UserX, 
  Car, 
  Fingerprint, 
  CheckCircle2, 
  Flame, 
  Share2,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TacticalCard } from '../common/TacticalCard';
import { HSRPPlate } from '../common/HSRPPlate';
import { ThreatBadge } from '../common/ThreatBadge';

export const InvestigationDossierView = () => {
  const { selectedVehiclePlate, setSelectedVehiclePlate, vehicleJourneys, setActivePage } = useApp();

  const journey = vehicleJourneys[selectedVehiclePlate] || vehicleJourneys['GJ-01-AB-1234'];
  const target = journey.target;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 print:text-black print:bg-white">
      {/* Dossier Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-cyan-500/25 backdrop-blur-xl print:border-black">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 print:hidden">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                OFFICIAL EVIDENCE REPORT
              </span>
              <span className="text-xs font-mono text-slate-400">
                CASE REF: {target.caseNumber}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans mt-0.5 print:text-black">
              Vehicle Intelligence & Forensic Movement Dossier
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 print:hidden">
          <button
            onClick={() => setActivePage('tracking')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow"
          >
            <Navigation className="w-4 h-4" />
            <span>View GIS Route</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Target Suspect & Vehicle Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suspect Photo & Specs */}
        <TacticalCard
          className="lg:col-span-1"
          title="Target Profile"
          subtitle="Registered particulars and BOLO mandate"
          icon={UserX}
          alert={target.threatLevel === 'CRITICAL'}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <HSRPPlate plate={selectedVehiclePlate} size="lg" threatLevel={target.threatLevel} />
              <ThreatBadge level={target.threatLevel} size="xs" />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">PRIMARY CHARGE:</span>
                <span className="text-rose-400 font-bold text-right max-w-[170px] truncate">
                  {target.crimeCategory}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">REGISTERED OWNER:</span>
                <span className="text-slate-200 font-semibold">{target.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VEHICLE BODY:</span>
                <span className="text-cyan-300 font-semibold">{target.vehicle} ({target.color})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ISSUING BRANCH:</span>
                <span className="text-slate-200">{target.issuedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">BULLETIN DATE:</span>
                <span className="text-slate-300">{target.issuedDate}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200">
              <span className="font-mono font-bold text-rose-400 block mb-1">OFFICER BRIEFING:</span>
              <p className="font-sans leading-relaxed text-[11px] text-slate-200">
                {target.notes}
              </p>
            </div>
          </div>
        </TacticalCard>

        {/* Multi-Hop Transit Metrics & Convoy Correlation */}
        <div className="lg:col-span-2 space-y-4">
          <TacticalCard
            title="Multi-Junction Movement Summary"
            subtitle="Cross-camera spatio-temporal transit telemetry"
            icon={Clock}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">TOTAL CORRIDOR HOPS</span>
                <span className="text-xl font-bold text-cyan-300 mt-1 block">
                  {journey.totalHops} Cameras
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">CUMULATIVE DISTANCE</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {journey.totalDistanceKm} km
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AVERAGE TRANSIT VELOCITY</span>
                <span className="text-xl font-bold text-amber-400 mt-1 block">
                  {journey.avgSpeedKmH} km/h
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">RE-ID CONFIDENCE</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block">
                  99.1%
                </span>
              </div>
            </div>

            {/* Co-Traveler Convoy Correlation */}
            <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
              <div className="flex items-center space-x-2 text-indigo-300 font-mono text-xs font-bold">
                <Users className="w-4 h-4" />
                <span>CO-TRAVELER CONVOY CORRELATION DETECTED</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                Secondary vehicle <span className="font-mono text-cyan-300 font-bold">DL-03-CC-9988 (Silver Fortuner)</span> was detected trailing 45 seconds behind this target across 3 consecutive camera nodes (CAM-01, CAM-04, CAM-09). Possible coordinated escort convoy.
              </p>
            </div>
          </TacticalCard>
        </div>
      </div>

      {/* Forensic Photographic Timeline Evidence */}
      <TacticalCard
        title="Chronological Forensic Timeline & Camera Ingress Captures"
        subtitle="Uncompressed optical plate captures with timestamp and vector telemetry"
        icon={Fingerprint}
      >
        <div className="space-y-4">
          {journey.waypoints.map((wp) => (
            <div
              key={wp.step}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
            >
              {/* Photo Crop */}
              <div className="relative rounded-lg overflow-hidden border border-slate-700 aspect-video bg-slate-900">
                <img
                  src={wp.cropUrl}
                  alt={`Capture at ${wp.cameraName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-cyan-600 text-slate-950 font-mono text-[9px] font-bold">
                  STEP #{wp.step}
                </div>
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-cyan-300 font-mono text-[9px]">
                  {wp.timestamp}
                </div>
              </div>

              {/* Waypoint Meta */}
              <div className="md:col-span-2 space-y-1 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    {wp.cameraId}
                  </span>
                  <span className="text-white font-semibold">{wp.cameraName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div>Direction: <span className="text-slate-200">{wp.direction}</span></div>
                  <div>Lane: <span className="text-slate-200">{wp.lane}</span></div>
                  <div>Speed: <span className="text-amber-400 font-bold">{wp.speed} km/h</span></div>
                  <div>AI OCR: <span className="text-cyan-400 font-bold">{wp.confidence}%</span></div>
                </div>

                <p className="text-[11px] text-slate-300 font-sans mt-2">
                  {wp.notes}
                </p>
              </div>

              {/* Anomaly Badge */}
              <div className="flex flex-col items-end justify-center">
                {wp.anomaly ? (
                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/50 text-right">
                    <span className="text-[10px] font-mono font-bold text-rose-400 block">ANOMALY DETECTED</span>
                    <span className="text-[11px] text-rose-200 font-sans">{wp.anomaly}</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Normal Transit
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </TacticalCard>
    </div>
  );
};
