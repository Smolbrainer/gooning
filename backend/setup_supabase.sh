#!/bin/bash
# Setup script for Supabase PostgreSQL backend

echo "🚀 Setting up Meme Detector Backend with Supabase..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment found"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies (including PostgreSQL support)..."
pip install -r requirements.txt

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🗄️  Initializing Supabase database..."
echo "   This will create tables and seed with 20 popular memes..."
echo ""

# Seed database
python seed_data.py seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  ./start.sh"
echo ""
echo "Or manually:"
echo "  source venv/bin/activate"
echo "  python -m app.main"
echo ""
