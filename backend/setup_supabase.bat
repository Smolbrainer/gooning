@echo off
REM Setup script for Supabase PostgreSQL backend (Windows)

echo 🚀 Setting up Meme Detector Backend with Supabase...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
) else (
    echo ✅ Virtual environment found
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📥 Installing dependencies (including PostgreSQL support)...
pip install -r requirements.txt

echo.
echo ✅ Dependencies installed!
echo.
echo 🗄️  Initializing Supabase database...
echo    This will create tables and seed with 20 popular memes...
echo.

REM Seed database
python seed_data.py seed

echo.
echo 🎉 Setup complete!
echo.
echo To start the server:
echo   start.bat
echo.
echo Or manually:
echo   venv\Scripts\activate
echo   python -m app.main
echo.

pause
