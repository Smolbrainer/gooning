#!/bin/bash

# Simple script to create placeholder icon files using ImageMagick
# If ImageMagick is not installed, you can create icons manually

echo "Creating placeholder icons for Meme Detector..."

# Check if ImageMagick (convert) is available
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Creating placeholder files..."
    echo "Please replace these with actual icon images."

    # Create placeholder files
    touch assets/icons/icon16.png
    touch assets/icons/icon48.png
    touch assets/icons/icon128.png

    echo "Placeholder icon files created at:"
    echo "  - assets/icons/icon16.png"
    echo "  - assets/icons/icon48.png"
    echo "  - assets/icons/icon128.png"
    echo ""
    echo "You can:"
    echo "1. Design icons using an image editor"
    echo "2. Download free icons from sites like flaticon.com or iconfinder.com"
    echo "3. Use an online icon generator"
else
    echo "Creating icons with ImageMagick..."

    # Create simple colored squares as placeholders
    # 16x16 icon
    convert -size 16x16 xc:#667eea \
        -gravity center \
        -pointsize 10 \
        -fill white \
        -annotate +0+0 "M" \
        assets/icons/icon16.png

    # 48x48 icon
    convert -size 48x48 xc:#667eea \
        -gravity center \
        -pointsize 32 \
        -fill white \
        -annotate +0+0 "M" \
        assets/icons/icon48.png

    # 128x128 icon
    convert -size 128x128 xc:#667eea \
        -gravity center \
        -pointsize 80 \
        -fill white \
        -annotate +0+0 "M" \
        assets/icons/icon128.png

    echo "Icons created successfully!"
    echo "  - assets/icons/icon16.png"
    echo "  - assets/icons/icon48.png"
    echo "  - assets/icons/icon128.png"
fi

echo ""
echo "Done! You can now load the extension in Chrome."
