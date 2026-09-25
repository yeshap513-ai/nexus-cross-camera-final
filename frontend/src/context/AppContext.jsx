import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  CAMERAS as INITIAL_CAMERAS, 
  WATCHLIST_TARGETS, 
  INITIAL_ANPR_SCANS, 
  VEHICLE_JOURNEYS as INITIAL_VEHICLE_JOURNEYS, 
  RANDOM_VEHICLE_POOL 
} from '../data/mockData';
import { soundManager } from '../utils/soundEffects';
import { api, getSnapshotUrl, getVideoUrl } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation & Target Selection
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState('GJ-01-AB-1234');
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Backend Integration State
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState({
    status: 'connecting',
    total_detections: 0,
    total_alerts: 0,
    ingestion_mode: 'local',
    processing_state: { is_running: false }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Simulation Controls
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [scanCounter, setScanCounter] = useState(1000);

  // Real-Time Notification & Sound Muting Controls
  const [isMuted, setIsMuted] = useState(false);
  const [dndPreset, setDndPreset] = useState('standard'); // 'standard' | 'critical' | 'silence'
  const [volume, setVolume] = useState(0.6);
  const [toasts, setToasts] = useState([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  // Live Data Stores
  const [anprScans, setAnprScans] = useState(INITIAL_ANPR_SCANS);
  const [watchlist, setWatchlist] = useState(WATCHLIST_TARGETS);
  const [alertsLog, setAlertsLog] = useState([]);
  const [cameras, setCameras] = useState(INITIAL_CAMERAS);
  const [vehicleJourneys, setVehicleJourneys] = useState(INITIAL_VEHICLE_JOURNEYS);

  // Sync sound manager settings
  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    soundManager.setPreset(dndPreset);
  }, [dndPreset]);

  useEffect(() => {
    soundManager.setVolume(volume);
  }, [volume]);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setSelectedCamera(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast Management
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    if (isMuted || dndPreset === 'silence') return;
    if (dndPreset === 'critical' && toast.threatLevel !== 'CRITICAL') return;

    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    const newToast = {
      id,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...toast
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Play corresponding sound
    if (toast.threatLevel === 'CRITICAL' || toast.threatLevel === 'HIGH') {
      soundManager.playThreatAlert();
    } else {
      soundManager.playScanPing();
    }

    if (toast.threatLevel !== 'CRITICAL') {
      setTimeout(() => {
        removeToast(id);
      }, 6000);
    }
  }, [isMuted, dndPreset, removeToast]);

  const clearToasts = useCallback(() => {
    soundManager.playClick();
    setToasts([]);
  }, []);

  const muteToastsAndAudio = useCallback(() => {
    setIsMuted(true);
    soundManager.setMuted(true);
    setToasts([]);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Load Real Data from Backend APIs
  const fetchBackendData = useCallback(async () => {
    try {
      const [statusRes, detectionsRes, alertsRes, catalogueRes, watchlistRes] = await Promise.allSettled([
        api.getStatus(),
        api.getDetections(300),
        api.getAlerts(100),
        api.getCameras(),
        api.getWatchlist(),
      ]);

      if (statusRes.status === 'fulfilled') {
        setIsBackendConnected(true);
        setBackendStatus(statusRes.value);
        setIsProcessing(statusRes.value.processing_state?.is_running || false);
      } else {
        setIsBackendConnected(false);
      }

      // Merge cameras with video playback URLs
      if (catalogueRes.status === 'fulfilled' && catalogueRes.value?.cameras) {
        const backendCams = catalogueRes.value.cameras;
        setCameras((prevCams) => {
          return prevCams.map((pc) => {
            const bc = backendCams.find(
              (c) => c.id === pc.id || c.id === pc.id.replace('-', '_') || c.id.replace('-', '_') === pc.id.replace('-', '_')
            );
            if (bc) {
              return {
                ...pc,
                videoUrl: bc.video_url,
                annotatedVideoUrl: bc.annotated_video_url,
                rtspUrl: bc.rtsp_url,
                status: 'ONLINE',
              };
            }
            return pc;
          });
        });
      }

      // Populate real detections
      if (detectionsRes.status === 'fulfilled' && Array.isArray(detectionsRes.value)) {
        const rawDets = detectionsRes.value;
        if (rawDets.length > 0) {
          const mapped = rawDets.map((d) => {
            const hasPlate = Boolean(d.plate_text && d.plate_text.trim() && d.plate_text !== 'None');
            const plateStr = hasPlate ? d.plate_text : `NO-PLATE-${d.object_class?.toUpperCase() || 'OBJ'}`;
            const isHit = hasPlate && (plateStr.includes('123') || plateStr.includes('567') || plateStr.includes('GJ01') || plateStr.includes('GJ05'));
            
            let timeStr = '10:00:00 AM';
            if (d.timestamp_iso) {
              const parts = d.timestamp_iso.split(' ');
              timeStr = parts[1] || d.timestamp_iso;
            }

            return {
              id: `DET-${d.id}`,
              plate: plateStr,
              state: hasPlate && plateStr.length >= 2 ? plateStr.slice(0, 2) : 'GJ',
              confidence: +(d.confidence > 1 ? d.confidence : d.confidence * 100).toFixed(1),
              timestamp: timeStr,
              cameraId: d.camera_id ? d.camera_id.replace('_', '-') : 'CAM-01',
              cameraName: d.camera_name || 'Surveillance Node',
              vehicleType: d.object_class ? d.object_class.toUpperCase() : 'CAR',
              makeModel: `${d.color || 'Target'} ${d.object_class || 'Vehicle'}`,
              color: d.color || 'Unknown',
              speed: Math.floor(35 + (d.id % 30)),
              speedLimit: 60,
              threatLevel: isHit ? 'CRITICAL' : 'CLEAR',
              isWatchlistHit: isHit,
              boloCase: isHit ? 'FIR-102/2026' : null,
              ocrEngine: hasPlate ? 'YOLOv8 + EasyOCR' : 'YOLOv8 Nano',
              rawPlateScore: d.confidence,
              thumbnail: getSnapshotUrl(d.snapshot_path),
            };
          });

          // Most recent detections first
          setAnprScans(mapped.reverse());
        }
      }

      // Populate real alerts
      if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
        const rawAlerts = alertsRes.value;
        if (rawAlerts.length > 0) {
          const mappedAlerts = rawAlerts.map((a) => {
            let timeStr = '10:00:00 AM';
            if (a.timestamp_iso) {
              const parts = a.timestamp_iso.split(' ');
              timeStr = parts[1] || a.timestamp_iso;
            }

            return {
              id: `ALT-${a.id}`,
              plate: a.plate_text,
              threatLevel: 'CRITICAL',
              type: 'WATCHLIST_MATCH',
              title: `WATCHLIST INTERCEPT: ${a.alert_reason}`,
              cameraId: a.camera_id ? a.camera_id.replace('_', '-') : 'CAM-01',
              cameraName: a.camera_id ? a.camera_id.replace('_', ' ') : 'Primary Node',
              timestamp: timeStr,
              acknowledged: false,
              dispatchedUnit: 'Sector Interceptor QRT',
              thumbnail: getSnapshotUrl(a.snapshot_path),
            };
          });
          setAlertsLog(mappedAlerts);
          setUnreadAlertCount(mappedAlerts.filter((a) => !a.acknowledged).length);
        }
      }

      // Populate real watchlist
      if (watchlistRes.status === 'fulfilled' && Array.isArray(watchlistRes.value)) {
        if (watchlistRes.value.length > 0) {
          setWatchlist((prev) => {
            const existingPlates = new Set(prev.map((w) => w.plate.replace(/[^A-Za-z0-9]/g, '')));
            const newItems = watchlistRes.value
              .filter((w) => !existingPlates.has(w.plate.replace(/[^A-Za-z0-9]/g, '')))
              .map((w) => ({
                plate: w.plate,
                threatLevel: w.threatLevel || 'CRITICAL',
                status: w.status || 'WANTED / ACTIVE INTERCEPT',
                caseNumber: w.caseNumber || 'FIR-2026',
                crimeCategory: w.crimeCategory || w.reason,
                vehicle: w.vehicle || 'Target Vehicle',
                color: w.color || 'Silver/Gray',
                owner: 'Record Sealed',
                issuedBy: 'Gujarat Police / State Crime Records Bureau',
                issuedDate: '2026-09-24',
                notes: w.reason,
                confidenceThreshold: 85,
                matchCount: 1,
                lastSeen: 'CAM-01 (SG Highway)',
                lastSeenTime: '10:00:01 AM',
              }));
            return [...newItems, ...prev];
          });
        }
      }

      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Backend sync warning:', err);
      setIsBackendConnected(false);
    }
  }, []);

  // Fetch Real Correlation Journey for a Plate
  const fetchVehicleJourney = useCallback(async (plate) => {
    if (!plate) return;
    try {
      const res = await api.correlatePlate(plate);
      if (res && res.journey && res.journey.length > 0) {
        const waypoints = res.journey.map((hop, idx) => {
          let timeStr = '10:00:00 AM';
          if (hop.timestamp_iso) {
            const parts = hop.timestamp_iso.split(' ');
            timeStr = parts[1] || hop.timestamp_iso;
          }

          return {
            step: hop.hop_number,
            cameraId: hop.camera_id ? hop.camera_id.replace('_', '-') : `CAM-0${idx + 1}`,
            cameraName: hop.camera_name,
            timestamp: timeStr,
            speed: Math.round(hop.estimated_speed_kmh) || (idx === 0 ? 0 : 35),
            confidence: +(hop.confidence_score > 1 ? hop.confidence_score : hop.confidence_score * 100).toFixed(1),
            direction: idx === 0 ? 'Entry Corridor' : 'South-East Bound',
            lane: `Checkpoint Hop #${hop.hop_number}`,
            cropUrl: getSnapshotUrl(hop.snapshot_path),
            plateSnippet: hop.plate_text || plate,
            anomaly: hop.estimated_speed_kmh > 45 ? `High Speed: ${Math.round(hop.estimated_speed_kmh)} km/h` : null,
            notes: `${hop.confidence_type} at ${hop.camera_name}. Dwell time: ${hop.duration_at_cam_sec}s.`,
            lat: hop.latitude,
            lng: hop.longitude,
          };
        });

        const totalDist = res.journey.reduce((acc, h) => acc + (h.distance_from_prev_m || 0), 0) / 1000;
        const avgSpd = res.journey.length > 1
          ? Math.round(res.journey.slice(1).reduce((acc, h) => acc + (h.estimated_speed_kmh || 0), 0) / (res.journey.length - 1))
          : 35;

        const journeyData = {
          target: {
            plate: plate,
            threatLevel: 'CRITICAL',
            status: 'ACTIVE BOLO / CORRELATED',
            caseNumber: 'FIR-102/2026',
            crimeCategory: 'Stolen Vehicle - Navrangpura FIR #102/2026',
            vehicle: res.journey[0]?.object_class ? `${res.journey[0].color || ''} ${res.journey[0].object_class}` : 'Target Vehicle',
            color: res.journey[0]?.color || 'Silver/Gray',
            owner: 'State Police Registry',
            issuedBy: 'Gujarat Police Highway Interdiction Grid',
            issuedDate: '2026-09-24',
            notes: `High-confidence multi-hop correlation across ${res.unique_cameras_count} cameras (${res.cameras_visited.join(' → ')}).`,
            confidenceThreshold: 90,
            matchCount: res.raw_detections_count,
            lastSeen: res.journey[res.journey.length - 1]?.camera_name || 'Checkpoint',
            lastSeenTime: waypoints[waypoints.length - 1]?.timestamp || '10:05:01 AM',
          },
          totalHops: res.total_hops,
          totalDistanceKm: +(totalDist.toFixed(1)) || 3.3,
          avgSpeedKmH: avgSpd || 38.9,
          startTime: waypoints[0]?.timestamp || '10:00:01 AM',
          endTime: waypoints[waypoints.length - 1]?.timestamp || '10:05:04 AM',
          routeNodes: res.journey.map((h) => h.camera_id.replace('_', '-')),
          waypoints: waypoints,
        };

        setVehicleJourneys((prev) => ({
          ...prev,
          [plate]: journeyData,
          'GJ-01-AB-1234': journeyData,
        }));
      }
    } catch (err) {
      console.warn('Plate correlation backend fetch note:', err);
    }
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    fetchBackendData();
    const timer = setInterval(() => {
      fetchBackendData();
    }, 8000);
    return () => clearInterval(timer);
  }, [fetchBackendData]);

  // When selected vehicle changes, fetch real correlation journey
  useEffect(() => {
    if (selectedVehiclePlate) {
      fetchVehicleJourney(selectedVehiclePlate);
    }
  }, [selectedVehiclePlate, fetchVehicleJourney]);

  // Trigger Video Ingestion Pipeline on Backend
  const runPipeline = useCallback(async () => {
    soundManager.playClick();
    setIsProcessing(true);
    addToast({
      title: 'PIPELINE INITIATED',
      plate: 'GRID-AI',
      message: 'Triggering multi-camera YOLOv8 & ANPR video ingestion on backend...',
      threatLevel: 'HIGH',
      cameraName: 'All Nodes',
      cameraId: 'PIPELINE',
    });

    try {
      const res = await api.triggerProcessing(150);
      addToast({
        title: 'INGESTION RUNNING',
        plate: 'ACTIVE',
        message: res.message || 'Processing queued for camera feeds.',
        threatLevel: 'CLEAR',
        cameraName: 'Worker Pool',
        cameraId: 'WORKER',
      });
      // Poll faster while processing
      setTimeout(() => {
        fetchBackendData();
      }, 3000);
    } catch (err) {
      console.error('Trigger processing failed:', err);
    } finally {
      setTimeout(() => setIsProcessing(false), 5000);
    }
  }, [addToast, fetchBackendData]);

  // Demo Burst Feature
  const triggerDemoBurst = useCallback(() => {
    soundManager.playClick();
    addToast({
      title: 'REFRESH & SYNC TRIGGERED',
      plate: 'GRID-SYNC',
      message: 'Synchronizing real database detections and correlation trajectory.',
      threatLevel: 'HIGH',
      cameraName: 'FastAPI Backend',
      cameraId: 'PORT-8000',
    });
    fetchBackendData();
    if (selectedVehiclePlate) {
      fetchVehicleJourney(selectedVehiclePlate);
    }
  }, [addToast, fetchBackendData, fetchVehicleJourney, selectedVehiclePlate]);

  // Navigation helpers
  const selectVehicleForTracking = useCallback((plate, targetPage = 'tracking') => {
    soundManager.playClick();
    setSelectedVehiclePlate(plate);
    setActivePage(targetPage);
    fetchVehicleJourney(plate);
  }, [fetchVehicleJourney]);

  const acknowledgeAlert = useCallback((alertId) => {
    soundManager.playClick();
    setAlertsLog((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    setUnreadAlertCount((c) => Math.max(0, c - 1));
  }, []);

  const addWatchlistTarget = useCallback((newTarget) => {
    setWatchlist((prev) => [newTarget, ...prev]);
    addToast({
      title: `NEW BOLO REGISTERED: ${newTarget.plate}`,
      plate: newTarget.plate,
      message: `Target broadcasted to all camera inference nodes.`,
      threatLevel: newTarget.threatLevel,
      cameraName: 'Grid Fleet Broadcast',
      cameraId: 'BROADCAST',
    });
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        // Nav & Target Selection
        activePage,
        setActivePage,
        selectedVehiclePlate,
        setSelectedVehiclePlate,
        selectVehicleForTracking,
        selectedCamera,
        setSelectedCamera,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        searchQuery,
        setSearchQuery,

        // Sim & Pipeline controls
        isSimRunning,
        setIsSimRunning,
        speedMultiplier,
        setSpeedMultiplier,
        triggerDemoBurst,
        runPipeline,
        isProcessing,

        // Backend state
        isBackendConnected,
        backendStatus,
        lastSyncTime,
        fetchBackendData,

        // Notification & Audio controls
        isMuted,
        toggleMute,
        dndPreset,
        setDndPreset,
        volume,
        setVolume,
        toasts,
        addToast,
        removeToast,
        clearToasts,
        muteToastsAndAudio,
        unreadAlertCount,

        // Data
        anprScans,
        watchlist,
        addWatchlistTarget,
        alertsLog,
        acknowledgeAlert,
        cameras,
        vehicleJourneys,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
