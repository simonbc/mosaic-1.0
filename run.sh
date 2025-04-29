#!/bin/bash

echo "🔄 Starting Mosaic..."

# Start backend
echo "🚀 Launching backend..."
(cd backend && source venv/bin/activate && uvicorn main:app --reload) &

# Start frontend
echo "🎨 Launching frontend..."
(cd frontend && npm run dev)

# Wait for background processes (like backend) to finish
wait