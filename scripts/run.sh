#!/bin/bash

echo "🔄 Starting Mosaic (dev mode)..."

# Check backend venv exists
if [ ! -d "backend/venv" ]; then
  echo "❌ Backend virtual environment not found at backend/venv"
  echo "Please run: python3 -m venv backend/venv && source backend/venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

# Start frontend in the background
echo "🟢 Launching frontend (Vite)..."
(cd frontend && npm run dev &)

# Set environment variable for dev mode
export IS_DEV=1
export DATABASE_URL=postgresql://localhost:5432/mosaic
echo $DATABASE_URL

# Start backend (FastAPI + Uvicorn)
echo "🚀 Launching backend..."
echo IS_DEV
(cd backend && source venv/bin/activate && uvicorn main:app --host mosaic.localhost --port 8000 --reload)
