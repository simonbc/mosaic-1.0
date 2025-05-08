#!/bin/bash

echo "🏗️  Building Mosaic for production..."

# Rebuild the frontend
echo "🔧 Building frontend..."
(cd frontend && npm run build)

# Deploy to Fly.io
echo "🚀 Deploying to Fly.io..."
fly deploy