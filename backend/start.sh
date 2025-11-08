#!/bin/bash
# Quick start script for Meme Detector Backend

echo "🚀 Starting Meme Detector Backend..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check if database exists
if [ ! -f "data/memes.db" ]; then
    echo "🌱 Database not found. Seeding database..."
    python seed_data.py seed <<< "yes"
else
    echo "✅ Database found"
fi

echo ""
echo "🎉 Starting API server on http://localhost:3000"
echo "📚 API Documentation: http://localhost:3000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python -m app.main
