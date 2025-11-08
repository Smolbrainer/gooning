@echo off
REM Quick start script for Meme Detector Backend (Windows)

echo 🚀 Starting Meme Detector Backend...
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Check if database exists
if not exist "data\memes.db" (
    echo 🌱 Database not found. Seeding database...
    echo yes | python seed_data.py seed
) else (
    echo ✅ Database found
)

echo.
echo 🎉 Starting API server on http://localhost:3000
echo 📚 API Documentation: http://localhost:3000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
python -m app.main

pause
