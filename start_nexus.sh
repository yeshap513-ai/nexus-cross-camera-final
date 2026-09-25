#!/bin/bash
# ==============================================================================
# 🛡️  NEXUS: Cross-Camera Intelligence Command Center
# ==============================================================================
# Starts the FastAPI AI Backend (Port 8000) + React Sentinel Dashboard (Port 3000)
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================================================="
echo "🛡️  NEXUS — Cross-Camera Surveillance Intelligence Command Center"
echo "=================================================================="
echo ""

# Check Prerequisites
echo "[1/4] Checking Python & Node runtime..."
python3 --version
node --version
npm --version

# Port cleanup if stale processes exist
echo ""
echo "[2/4] Verifying network ports..."
for PORT in 8000 3000; do
  PID=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "  - Port $PORT was in use by PID $PID. Clearing..."
    kill -9 $PID 2>/dev/null || true
  fi
done

# Launch Backend
echo ""
echo "[3/4] Launching FastAPI Backend (Port 8000)..."
(
  cd "$SCRIPT_DIR/backend"
  python3 -m uvicorn server:app --host 127.0.0.1 --port 8000 --log-level info
) &
BACKEND_PID=$!

# Wait for backend to be ready
echo "  - Waiting for backend to initialize..."
for i in {1..15}; do
  if curl -s http://127.0.0.1:8000/api/status >/dev/null 2>&1; then
    echo "  ✓ Backend online at http://127.0.0.1:8000"
    break
  fi
  sleep 1
done

# Launch Frontend
echo ""
echo "[4/4] Launching NEXUS React Tactical Dashboard (Port 3000)..."
(
  cd "$SCRIPT_DIR/frontend"
  npx vite --host 127.0.0.1 --port 3000 --clearScreen false
) &
FRONTEND_PID=$!

echo ""
echo "=================================================================="
echo "🚀  NEXUS SYSTEM OPERATIONAL:"
echo "👉  Dashboard UI:   http://localhost:3000"
echo "👉  FastAPI Docs:   http://localhost:8000/docs"
echo "👉  API Status:     http://localhost:8000/api/status"
echo "👉  CCTV Snapshots: http://localhost:8000/snapshots/"
echo "👉  Video Streams:  http://localhost:8000/videos/"
echo "=================================================================="
echo "Press Ctrl+C to terminate all services."

cleanup() {
  echo ""
  echo "Shutting down NEXUS services..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM
wait
