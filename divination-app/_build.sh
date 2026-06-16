#!/bin/bash
# Restore Vite source entry before build
cp index.src.html index.html 2>/dev/null || true
npm run build
# Keep source intact for next build
cp index.html index.src.html
# Copy deploy artifacts  
cp dist/assets/* assets/
cp dist/sw.js dist/workbox-*.js dist/registerSW.js dist/manifest.webmanifest .
cp dist/index.html .
echo "Build + deploy complete"
