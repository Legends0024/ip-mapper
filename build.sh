#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Python dependencies..."
# If using requirements.txt:
# pip install -r requirements.txt
# If using UV:
pip install uv
uv sync

echo "Installing Node dependencies..."
# Remove package-lock.json to fix Vite/Rollup cross-platform binary bugs on Render (Linux)
rm -f package-lock.json
npm install

echo "Building React Frontend..."
npm run build

echo "Build successful! Your Flask backend will now serve the dist/ directory."
