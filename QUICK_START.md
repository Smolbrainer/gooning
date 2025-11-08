# ⚡ Quick Start - Meme Detector

## 🎯 Get Running in 3 Minutes

### Step 1: Setup Backend with Supabase (1 min)

```bash
cd backend
./setup_supabase.sh    # macOS/Linux
setup_supabase.bat     # Windows
```

**What this does:**
- Creates Python virtual environment
- Installs dependencies (FastAPI, PostgreSQL drivers)
- Connects to your Supabase database
- Creates tables and seeds 20 popular memes

### Step 2: Start Backend Server (30 sec)

```bash
./start.sh    # macOS/Linux
start.bat     # Windows
```

Server running at: **http://localhost:3000**

### Step 3: Load Chrome Extension (1 min)

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select project folder (the one with `manifest.json`)
5. Click extension icon → Select some memes

### Step 4: Test It! (30 sec)

1. Visit any website
2. Type or find text with meme keywords
3. Try: "drake hotline bling" or "surprised pikachu"
4. Watch for the video overlay! 🎬

---

## 📊 Your Supabase Database

**Connection Details:**
```
Host: db.zlotbgolmmuggqpmckyx.supabase.co
Database: postgres
User: postgres
```

**Pre-loaded Memes:**
- Drake Hotline Bling
- Surprised Pikachu
- This Is Fine
- Woman Yelling at Cat
- Stonks
- ...and 15 more!

---

## 🔍 Quick Tests

### Test Backend API

```bash
# Health check
curl http://localhost:3000/api/health

# Get all memes
curl http://localhost:3000/api/memes

# Detect memes
curl -X POST http://localhost:3000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"content": "This is fine everything is burning"}'
```

### Test Extension

1. Open extension popup (click icon)
2. Check "API Connection" shows green "Connected"
3. Select 2-3 memes
4. Visit a website and mention those memes
5. Watch console (F12) for "Meme detected:" messages

---

## 🛠️ Useful Commands

### Backend

```bash
# Start server
cd backend && ./start.sh

# View all memes in database
python seed_data.py list

# Re-seed database
python seed_data.py seed

# Stop server
Ctrl+C
```

### Extension

```bash
# Reload extension after changes
chrome://extensions → Click reload icon

# View popup logs
Right-click extension icon → Inspect popup

# View content script logs
Open any page → F12 → Console
```

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[backend/SUPABASE_SETUP.md](backend/SUPABASE_SETUP.md)** - Supabase configuration
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[README.md](README.md)** - Full project documentation

---

## 🐛 Common Issues

**Backend won't start:**
```bash
cd backend
rm -rf venv
./setup_supabase.sh
```

**Extension not detecting:**
- Check detection is enabled (toggle in popup)
- Select at least one meme
- Open console (F12) for error messages

**API connection failed:**
- Verify backend is running: http://localhost:3000/api/health
- Check Supabase project is active

**Database connection error:**
- Check `.env` has correct Supabase URL
- Verify Supabase project is not paused

---

## 🎉 You're Ready!

- ✅ Backend running on Supabase PostgreSQL
- ✅ 20 memes loaded and ready to detect
- ✅ Extension installed in Chrome
- ✅ Start browsing and detecting memes!

**Next:** Customize memes in `backend/seed_data.py` and re-seed!
