#!/bin/bash
set -e

echo "Building Talently ATS Frontend..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "Installing dependencies..."
npm install

echo "Building Expo web export..."
npm run build

echo "Verifying dist directory exists..."
if [ -d "dist" ]; then
  echo "✓ dist directory created"
  ls -la dist | head -20
else
  echo "✗ ERROR: dist directory not created!"
  exit 1
fi

echo "✓ Build completed successfully"
