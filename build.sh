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
# Render environment usually supports Node.js if you add a build script constraint
npm install

echo "Building React Frontend..."
npm run build

echo "Build successful! Your Flask backend will now serve the dist/ directory."
