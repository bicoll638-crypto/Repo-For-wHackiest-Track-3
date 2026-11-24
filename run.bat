@echo off
echo ========================================================
echo   AURA: Voice-First Personal Data Twin
echo   Hackathon Track 3: Know Thyself
echo ========================================================

echo [1/2] Launching Backend (FastAPI) at http://localhost:8000 ...
start "AURA Backend" cmd /k "cd backend && venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Launching Frontend (Next.js) at http://localhost:3000 ...
start "AURA Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  All systems running locally with zero API keys required!
echo  Backend Swagger Docs: http://localhost:8000/docs
echo  Frontend Dashboard:   http://localhost:3000
echo ========================================================
pause
