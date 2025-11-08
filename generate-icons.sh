#!/bin/bash

# Simple icon generator script
# This creates placeholder PNG files from the SVG

cd "$(dirname "$0")/assets/icons"

# For now, just copy the SVG as placeholders
# In production, you'd want to use a tool like ImageMagick or sharp to convert
echo "Creating placeholder icon files..."

# Check if ImageMagick is installed
if command -v convert &> /dev/null; then
    echo "Using ImageMagick to convert SVG to PNG..."
    convert -background none icon.svg -resize 16x16 icon16.png
    convert -background none icon.svg -resize 48x48 icon48.png
    convert -background none icon.svg -resize 128x128 icon128.png
    echo "Icons generated successfully!"
else
    echo "ImageMagick not found. Installing placeholder files..."
    # Create simple colored squares as placeholders
    echo "Please install ImageMagick to generate proper icons:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu: sudo apt-get install imagemagick"
    echo "  Or use an online SVG to PNG converter"
    echo ""
    echo "For now, copying SVG as placeholder..."
    cp icon.svg icon16.png 2>/dev/null || echo "icon.svg not found"
    cp icon.svg icon48.png 2>/dev/null || echo "icon.svg not found"
    cp icon.svg icon128.png 2>/dev/null || echo "icon.svg not found"
fi

echo "Done!"
