#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  AURA: Voice-First Personal Data Twin (MVP)"
echo "  Hackathon Track 3: Know Thyself"
echo "========================================================"

# Trap SIGINT / SIGTERM to cleanly kill both processes
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

echo "[1/2] Starting Backend at http://localhost:8000 ..."
(cd backend && venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &

echo "[2/2] Starting Frontend at http://localhost:3000 ..."
(cd frontend && npm run dev) &

echo "Both servers started in background. Press Ctrl+C to stop."
wait
