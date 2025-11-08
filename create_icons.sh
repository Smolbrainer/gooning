#!/bin/bash
# Quick script to create placeholder PNG icons from SVG

echo "🎨 Creating PNG icons..."

cd assets/icons

if [ ! -f "icon.svg" ]; then
    echo "❌ Error: icon.svg not found in assets/icons/"
    exit 1
fi

# Simple method - just copy SVG as PNGs
# Chrome will handle the SVG files fine for development
cp icon.svg icon16.png
cp icon.svg icon48.png
cp icon.svg icon128.png

echo "✅ Created icon files:"
ls -lh icon*.png

echo ""
echo "📝 Note: These are placeholder PNGs (actually SVG files)."
echo "For production, convert to proper PNG at each size:"
echo "  - icon16.png: 16x16 pixels"
echo "  - icon48.png: 48x48 pixels"
echo "  - icon128.png: 128x128 pixels"
echo ""
echo "✅ Extension should now load in Chrome!"
