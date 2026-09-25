@echo off
echo ========================================================
echo Cross-Camera Vehicle Intelligence - One-Click Start
echo ========================================================
echo.

echo [1/3] Setting up Backend Dependencies...
cd backend
python -m pip install -r requirements.txt

echo [2/3] Setting up Frontend Dependencies...
cd ../frontend
call npm install
cd ..

echo.
echo ========================================================
echo Starting Services...
echo ========================================================
echo.

start cmd /k "title Backend Streamlit && cd backend && streamlit run app.py"
start cmd /k "title Backend FastAPI && cd backend && uvicorn server:app --reload --port 8000"
start cmd /k "title Frontend React && cd frontend && npm run dev"

echo All services are launching in separate windows!
echo - React UI: http://localhost:5173
echo - Streamlit Dashboard: http://localhost:8501
echo - FastAPI Docs: http://localhost:8000/docs
echo.
pause
