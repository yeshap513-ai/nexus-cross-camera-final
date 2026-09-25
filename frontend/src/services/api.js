// NEXUS: Cross-Camera Intelligence API Service
// Connects the React dashboard to the FastAPI backend (Port 8000)

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getSnapshotUrl = (snapshotPath) => {
  if (!snapshotPath) return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80';
  if (snapshotPath.startsWith('http')) return snapshotPath;
  const filename = snapshotPath.replace(/^.*[\\/]/, '');
  return `${API_BASE_URL}/snapshots/${filename}`;
};

export const getVideoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export const api = {
  baseUrl: API_BASE_URL,

  async getStatus() {
    const res = await fetch(`${API_BASE_URL}/api/status`);
    if (!res.ok) throw new Error(`Status HTTP error: ${res.status}`);
    return await res.json();
  },

  async getCameras() {
    const res = await fetch(`${API_BASE_URL}/api/ingest`);
    if (!res.ok) throw new Error(`Cameras HTTP error: ${res.status}`);
    return await res.json();
  },

  async getDetections(limit = 200, cameraId = null, objectClass = null) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit);
    if (cameraId) params.set('camera_id', cameraId);
    if (objectClass) params.set('object_class', objectClass);
    const res = await fetch(`${API_BASE_URL}/api/detections?${params.toString()}`);
    if (!res.ok) throw new Error(`Detections HTTP error: ${res.status}`);
    return await res.json();
  },

  async getAlerts(limit = 100) {
    const res = await fetch(`${API_BASE_URL}/api/alerts?limit=${limit}`);
    if (!res.ok) throw new Error(`Alerts HTTP error: ${res.status}`);
    return await res.json();
  },

  async getWatchlist() {
    const res = await fetch(`${API_BASE_URL}/api/watchlist`);
    if (!res.ok) throw new Error(`Watchlist HTTP error: ${res.status}`);
    return await res.json();
  },

  async correlatePlate(plate) {
    const res = await fetch(`${API_BASE_URL}/api/correlate?plate=${encodeURIComponent(plate)}`);
    if (!res.ok) throw new Error(`Correlate plate HTTP error: ${res.status}`);
    return await res.json();
  },

  async correlateVisual(objectClass, color, timeWindowSec = 300) {
    const params = new URLSearchParams({
      object_class: objectClass,
      color: color,
      time_window_sec: timeWindowSec,
    });
    const res = await fetch(`${API_BASE_URL}/api/correlate/visual?${params.toString()}`);
    if (!res.ok) throw new Error(`Correlate visual HTTP error: ${res.status}`);
    return await res.json();
  },

  async exportCsv() {
    const res = await fetch(`${API_BASE_URL}/api/export`, { method: 'POST' });
    if (!res.ok) throw new Error(`Export CSV HTTP error: ${res.status}`);
    return await res.json();
  },

  async triggerProcessing(maxFrames = 150) {
    const res = await fetch(`${API_BASE_URL}/api/process/run?max_frames=${maxFrames}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Trigger processing HTTP error: ${res.status}`);
    return await res.json();
  },
};
