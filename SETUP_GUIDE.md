# 🚀 Meme Detector - Complete Setup Guide

## What You Have

A complete Chrome Extension with FastAPI backend for automatic meme detection on web pages!

## 📦 Project Components

### ✅ Chrome Extension (Frontend)
- Complete popup interface with meme library
- Real-time content detection scripts
- Video overlay component
- Background service worker
- Settings management
- Storage utilities

### ✅ FastAPI Backend (NEW!)
- RESTful API with all required endpoints
- SQLite database with async support
- 20 pre-configured popular memes
- Automatic CORS handling
- Health check endpoints
- Interactive API documentation

## 🎯 5-Minute Quick Start

### Step 1: Start the Backend (Terminal 1)

```bash
cd backend
./start.sh      # macOS/Linux
start.bat       # Windows
```

Wait for: `🎉 Starting API server on http://localhost:3000`

### Step 2: Load Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the project root folder (the one with `manifest.json`)
5. Extension loaded! ✅

### Step 3: Test It Out

1. Click the extension icon in Chrome toolbar
2. Select a few memes (try "drake-hotline-bling", "surprised-pikachu")
3. Visit any website and mention those memes in text
4. Watch for the video overlay! 🎬

## 📚 Detailed Backend Setup

### Installation

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Seed database with 20 popular memes
python seed_data.py seed

# Start server
python -m app.main
```

### Backend Features

**API Endpoints:**
- `GET /api/health` - Health check
- `GET /api/memes` - Get all memes (with filtering)
- `GET /api/memes/:id` - Get specific meme
- `POST /api/detect` - Detect memes in content
- `GET /api/video/:memeId` - Get video URL

**Interactive Documentation:**
- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

**Database Management:**
```bash
# List all memes
python seed_data.py list

# Re-seed database
python seed_data.py seed
```

## 🎨 Pre-loaded Memes

The backend comes with 20 popular memes:

1. Drake Hotline Bling
2. Distracted Boyfriend
3. Expanding Brain
4. Change My Mind
5. Woman Yelling at Cat
6. This Is Fine
7. Spider-Man Pointing
8. Success Kid
9. Stonks
10. Is This a Pigeon?
11. Roll Safe
12. Surprised Pikachu
13. Mocking SpongeBob
14. Coffin Dance
15. Trade Offer
16. Doge
17. Pepe the Frog
18. Wojak
19. Rickroll
20. Hide the Pain Harold

## ⚙️ Configuration

### Backend Settings (.env file)

```bash
API_HOST=0.0.0.0
API_PORT=3000
DATABASE_URL=sqlite+aiosqlite:///./data/memes.db
```

### Extension Settings (Popup UI)

- **Detection Toggle**: Enable/disable detection
- **Sensitivity**: 0-100% (default: 70%)
- **Autoplay**: Auto-play videos
- **Position**: Choose overlay corner
- **Notifications**: Show detection alerts

## 🧪 Testing the System

### Test Backend API

```bash
# Health check
curl http://localhost:3000/api/health

# Get all memes
curl http://localhost:3000/api/memes

# Detect memes in text
curl -X POST http://localhost:3000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"content": "This is fine, everything is burning"}'
```

### Test Extension

1. **Open Extension Popup**
   - Click extension icon
   - Should show meme library
   - Select a few memes

2. **Test Detection**
   - Open a new tab
   - Go to any website
   - Type or find text containing meme keywords
   - Example: "drake hotline bling" or "surprised pikachu"

3. **Check Console**
   - Press F12
   - Look for "Meme detected:" messages
   - Verify overlay appears

## 🐛 Troubleshooting

### Backend Issues

**Port 3000 already in use:**
```bash
# Change port in .env
API_PORT=3001

# Update extension files:
# - background/service-worker.js line 81
# - utils/api.js line 5
```

**Database errors:**
```bash
cd backend
rm data/memes.db
python seed_data.py seed
```

**Module not found:**
```bash
pip install -r requirements.txt
```

### Extension Issues

**No memes appearing in popup:**
- Check backend is running
- Open popup → Settings → Check API status
- Should show "Connected" (green dot)

**Detection not working:**
- Ensure detection is enabled (toggle in popup)
- Select at least one meme
- Check page is not blacklisted
- Open console (F12) for error messages

**Videos not playing:**
- Video URLs in sample data are placeholder links
- Replace with real video URLs in `backend/seed_data.py`
- Re-seed database

## 📝 Adding Your Own Memes

Edit `backend/seed_data.py`:

```python
{
    "id": "my-custom-meme",
    "name": "My Custom Meme",
    "description": "Description here",
    "keywords": ["keyword1", "keyword2", "phrase"],
    "video_url": "https://example.com/video.mp4",
    "category": "custom",
    "popularity_score": 75
}
```

Then re-seed:
```bash
python seed_data.py seed
```

## 📊 Project Structure

```
gooning/
├── manifest.json              # Extension config
├── popup/                     # Extension UI
├── content/                   # Detection scripts
├── background/                # Service worker
├── utils/                     # Helpers
├── assets/                    # Icons
└── backend/                   # FastAPI backend ⭐
    ├── app/
    │   ├── main.py           # API routes
    │   ├── models.py         # Database models
    │   ├── schemas.py        # Validation
    │   └── database.py       # DB config
    ├── seed_data.py          # Sample data
    ├── requirements.txt      # Dependencies
    ├── start.sh/bat          # Quick start scripts
    └── README.md             # Backend docs
```

## 🎓 Next Steps

1. **Replace Sample Videos**: Update video URLs with real links
2. **Customize Memes**: Add your favorite memes
3. **Test on Different Sites**: Try various websites
4. **Adjust Settings**: Fine-tune detection sensitivity
5. **Create Icons**: Convert SVG to PNG (see main README)

## 📚 Documentation

- **Main README**: [README.md](README.md)
- **Backend README**: [backend/README.md](backend/README.md)
- **Implementation Details**: [Prompt.md](Prompt.md)

## 💡 Tips

- Start backend before using extension
- Use Swagger UI (http://localhost:3000/docs) to test API
- Check browser console for debugging
- Lower sensitivity if too many false positives
- Increase cooldown to reduce detection frequency

## 🎉 You're Ready!

Both frontend and backend are complete and ready to use. Enjoy detecting memes across the web!

---

**Need Help?**
- Check console logs (F12)
- Verify API at http://localhost:3000/docs
- Review [backend/README.md](backend/README.md) for API details
