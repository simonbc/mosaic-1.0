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

# Start backend (FastAPI + Uvicorn)
echo "🚀 Launching backend..."
(cd backend && source venv/bin/activate && uvicorn main:app --reload)