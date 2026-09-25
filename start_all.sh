#!/bin/bash
echo "========================================================"
echo "Cross-Camera Vehicle Intelligence - One-Click Start (Mac/Linux)"
echo "========================================================"
echo ""

echo "[1/3] Setting up Backend Dependencies..."
cd backend || exit
python3 -m pip install -r requirements.txt

echo "[2/3] Setting up Frontend Dependencies..."
cd ../frontend || exit
npm install
cd ..

echo ""
echo "========================================================"
echo "Starting Services..."
echo "========================================================"
echo ""

# Start services in background
(cd backend && streamlit run app.py) &
(cd backend && uvicorn server:app --reload --port 8000) &
(cd frontend && npm run dev) &

echo "All services are launching in the background!"
echo "- React UI: http://localhost:5173"
echo "- Streamlit Dashboard: http://localhost:8501"
echo "- FastAPI Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."
wait
