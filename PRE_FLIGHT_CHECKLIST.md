# ✈️ Pre-Flight Checklist - Before Testing

## 🎯 Quick Answer: 2 Things Left

1. **Create PNG icons** (5 minutes) - Required for Chrome
2. **Setup & start backend** (3 minutes) - Already automated!

---

## 📋 Complete Checklist

### ✅ Already Done

- [x] Chrome Extension code complete
- [x] Backend API complete
- [x] Supabase PostgreSQL configured
- [x] Database models and schemas ready
- [x] Seed data with 20 memes prepared
- [x] All documentation written

### 🔲 Need to Do Before Testing

#### 1. Create Icon Files (REQUIRED)

Chrome requires PNG icons in 3 sizes. You have 2 options:

**Option A - Create Placeholder Icons (Fastest - 1 min):**

```bash
cd assets/icons

# Create simple placeholder PNGs from SVG
# On macOS (if you have ImageMagick):
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png

# OR if you don't have ImageMagick, just copy:
cp icon.svg icon16.png
cp icon.svg icon48.png
cp icon.svg icon128.png
```

**Option B - Use Online Converter (Recommended - 2 min):**

1. Go to https://cloudconvert.com/svg-to-png
2. Upload `assets/icons/icon.svg`
3. Convert to PNG at 128x128
4. Download and save as `icon128.png`
5. Repeat for 48x48 → `icon48.png`
6. Repeat for 16x16 → `icon16.png`
7. Place all 3 files in `assets/icons/`

**Option C - Design Your Own (5+ min):**

Use any image editor to create proper icons:
- 16x16px → Browser toolbar
- 48x48px → Extensions page
- 128x128px → Chrome Web Store

#### 2. Setup Backend with Supabase (AUTOMATED - 3 min)

```bash
cd backend
./setup_supabase.sh    # macOS/Linux
setup_supabase.bat     # Windows
```

This will:
- ✅ Install Python dependencies
- ✅ Connect to your Supabase database
- ✅ Create database tables
- ✅ Seed 20 popular memes

---

## 🚀 Step-by-Step Test Plan

### Step 1: Create Icons (2 min)

```bash
cd /Users/smolbrainer/Desktop/gooning/assets/icons

# Quick method - copy SVG as placeholders
cp icon.svg icon16.png
cp icon.svg icon48.png
cp icon.svg icon128.png

# Verify files exist
ls -la
# Should see: icon.svg, icon16.png, icon48.png, icon128.png
```

### Step 2: Setup Backend (3 min)

```bash
cd /Users/smolbrainer/Desktop/gooning/backend

# Run automated setup
./setup_supabase.sh

# Wait for success messages:
# ✅ Dependencies installed
# ✅ Database initialized
# 🎉 Setup complete
```

### Step 3: Start Backend (30 sec)

```bash
# Still in backend directory
./start.sh

# Wait for:
# 🚀 Meme Detector API running on http://localhost:3000
```

### Step 4: Verify Backend (30 sec)

Open new terminal:

```bash
# Test health
curl http://localhost:3000/api/health

# Should return: {"status":"healthy",...}

# Test memes endpoint
curl http://localhost:3000/api/memes | head -20

# Should return JSON with meme data
```

### Step 5: Load Chrome Extension (1 min)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Navigate to `/Users/smolbrainer/Desktop/gooning`
6. Click "Select"

**Expected result:** Extension appears with your icon

### Step 6: Configure Extension (30 sec)

1. Click extension icon in toolbar
2. Wait for popup to open
3. Check bottom: API status should show "Connected" (green)
4. Select 2-3 memes (e.g., "Drake Hotline Bling", "Surprised Pikachu")

### Step 7: Test Detection (1 min)

1. Open new tab
2. Go to any website (try Wikipedia or Reddit)
3. Search or type: "drake hotline bling"
4. Open Console (F12)
5. Look for: `Meme detected: Drake Hotline Bling`

**Expected result:** Video overlay appears!

---

## 🔍 Verification Commands

### Check All Files Present

```bash
cd /Users/smolbrainer/Desktop/gooning

# Check manifest exists
cat manifest.json | grep "name"

# Check icons exist
ls assets/icons/
# Should see: icon.svg, icon16.png, icon48.png, icon128.png

# Check backend files
ls backend/app/
# Should see: __init__.py, main.py, models.py, schemas.py, database.py

# Check .env configured
cat backend/.env | grep "DATABASE_URL"
# Should see your Supabase URL
```

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Get all memes
curl http://localhost:3000/api/memes

# Get specific meme
curl http://localhost:3000/api/memes/drake-hotline-bling

# Test detection
curl -X POST http://localhost:3000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"content": "This is fine everything is burning"}'
```

---

## 🐛 Common Issues & Fixes

### Issue: Icons Missing Error in Chrome

**Symptom:** Extension loads but shows warning about missing icons

**Fix:**
```bash
cd assets/icons
cp icon.svg icon16.png
cp icon.svg icon48.png
cp icon.svg icon128.png
# Then reload extension in chrome://extensions
```

### Issue: Backend Won't Start

**Symptom:** `ModuleNotFoundError` or connection errors

**Fix:**
```bash
cd backend
rm -rf venv
./setup_supabase.sh
```

### Issue: Database Connection Failed

**Symptom:** `could not connect to server`

**Fix:**
1. Check Supabase project at https://supabase.com/dashboard
2. Verify project is not paused
3. Check `.env` has correct URL
4. Test connection: `python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('DATABASE_URL'))"`

### Issue: Extension Shows "Offline" API Status

**Symptom:** Popup shows red "Offline" indicator

**Fix:**
1. Verify backend is running: `curl http://localhost:3000/api/health`
2. Check browser console for CORS errors
3. Restart backend server
4. Reload extension

### Issue: No Memes Detected

**Symptom:** Browsing pages but nothing detected

**Checklist:**
- [ ] Detection toggle is ON in popup
- [ ] At least 1 meme is selected
- [ ] Backend is running
- [ ] Page content contains meme keywords
- [ ] Check console for "Meme detected:" messages
- [ ] Try lowering detection sensitivity in settings

---

## ✅ Ready to Test Checklist

Before you start testing, verify:

- [ ] **Icons created**: `ls assets/icons/` shows 4 files (svg + 3 pngs)
- [ ] **Backend setup**: `./setup_supabase.sh` completed successfully
- [ ] **Backend running**: `curl http://localhost:3000/api/health` returns healthy
- [ ] **Database seeded**: `curl http://localhost:3000/api/memes` returns 20 memes
- [ ] **Extension loaded**: Appears in `chrome://extensions/`
- [ ] **No errors**: No red errors in extension details page
- [ ] **Popup opens**: Click icon → popup opens successfully
- [ ] **API connected**: Popup shows green "Connected" status
- [ ] **Memes selected**: At least 1 meme checked in popup

---

## 🎯 Your Exact Commands

Copy and paste these in order:

```bash
# 1. Create icons (quick method)
cd /Users/smolbrainer/Desktop/gooning/assets/icons
cp icon.svg icon16.png && cp icon.svg icon48.png && cp icon.svg icon128.png
ls -la

# 2. Setup backend
cd /Users/smolbrainer/Desktop/gooning/backend
./setup_supabase.sh

# 3. Start server (in same terminal)
./start.sh

# 4. In NEW terminal - verify it works
curl http://localhost:3000/api/health
curl http://localhost:3000/api/memes
```

Then in Chrome:
1. `chrome://extensions/` → Developer mode ON → Load unpacked
2. Select `/Users/smolbrainer/Desktop/gooning`
3. Click extension icon → Select memes
4. Visit website → Test detection!

---

## 📚 If You Need Help

1. **Icons**: See [README.md](README.md) line 43-63
2. **Backend**: See [SUPABASE_SETUP.md](backend/SUPABASE_SETUP.md)
3. **Quick Start**: See [QUICK_START.md](QUICK_START.md)
4. **Extension**: Open console (F12) for error messages

---

## 🎉 That's It!

**Total Time: ~5 minutes**

1. Create icons (2 min)
2. Setup backend (3 min)
3. Load extension (1 min)
4. You're testing! 🚀
