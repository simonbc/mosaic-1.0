#!/bin/bash

echo "🔧 Setting up virtual environment..."

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "✅ Virtual environment created."
else
  echo "🔁 Virtual environment already exists."
fi

# Activate the virtual environment
source venv/bin/activate
echo "📦 Installing dependencies..."

# Install required packages
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ All dependencies installed."
echo "🚀 You can now run the server with:"
echo "   source venv/bin/activate && uvicorn backend.main:app --reload"