# Meme Detector - Complete Setup Guide

This guide walks you through setting up the Meme Detector Chrome Extension from scratch.

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed
- Chrome browser
- Supabase account (free tier works)
- Basic command line knowledge

## Step-by-Step Setup

### Phase 1: Backend Setup (15 minutes)

#### 1.1 Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `meme-detector` (or your choice)
   - Database password: Create a strong password
   - Region: Choose closest to you
4. Wait for project to be provisioned (~2 minutes)

#### 1.2 Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

#### 1.3 Set Up Database Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Open `backend/supabase_schema.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" message
7. Go to **Table Editor** to verify `memes` and `user_selections` tables were created

#### 1.4 Configure Backend

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

In the `.env` file, paste your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=chrome-extension://*,http://localhost:*
```

Save and close the file.

#### 1.5 Seed Database with Sample Memes

```bash
# Still in backend directory with venv activated
python seed_data.py
```

You should see output like:

```
Starting database seeding...
Inserting 10 sample memes...
Successfully seeded 10 memes!
```

#### 1.6 Start Backend Server

```bash
# Option 1: Using the start script
chmod +x start.sh
./start.sh

# Option 2: Direct command
python main.py
```

You should see:

```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test it**: Open http://localhost:8000/docs in your browser. You should see the FastAPI Swagger documentation.

**Keep this terminal open** - the backend needs to stay running.

---

### Phase 2: Frontend Setup (10 minutes)

Open a **new terminal window** for the frontend.

#### 2.1 Build React Popup

```bash
# Navigate to popup directory
cd popup

# Install Node dependencies
npm install

# Build the React app
npm run build
```

You should see a `popup/dist` folder created with compiled files.

---

### Phase 3: Extension Setup (5 minutes)

#### 3.1 Create Extension Icons

```bash
# Navigate back to project root
cd ..

# Option 1: Auto-generate with ImageMagick (if installed)
chmod +x create-icons.sh
./create-icons.sh

# Option 2: Manual placeholder
mkdir -p assets/icons
touch assets/icons/icon16.png
touch assets/icons/icon48.png
touch assets/icons/icon128.png
```

For a real icon, you can:

- Design one using an image editor
- Download from https://www.flaticon.com (search "meme" or "detective")
- Use an AI image generator

Required sizes: 16×16, 48×48, 128×128 pixels, PNG format.

#### 3.2 Load Extension in Chrome

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Navigate to and select your project directory: `/path/to/gooning/`
6. Click **Select** (or **Open**)

The Meme Detector extension should now appear in your extensions list!

---

### Phase 4: Testing (5 minutes)

#### 4.1 Test the Popup

1. Click the Meme Detector icon in Chrome toolbar
2. You should see:
   - A purple header with "Meme Detector"
   - An "Active/Inactive" toggle (should be Active)
   - A list of 10 memes from your database
3. Select a few memes by clicking their checkboxes (try "Stonks", "This Is Fine", "Surprised Pikachu")
4. The selected memes should appear in the "Active Memes" section at the top

#### 4.2 Test Detection

1. Open the included test page:
   - In Chrome, press Cmd/Ctrl + O
   - Navigate to `gooning/test-page.html`
   - Open it
2. If you selected "Stonks", you should see a video overlay appear almost immediately (the word "stonks" is on the page)
3. Click the X or outside the overlay to close it
4. Scroll down to see other keywords that will trigger different memes

#### 4.3 Test Dynamic Detection

1. On the test page, click the "Add Dynamic Content" button
2. It will randomly add text with meme keywords
3. The detector should pick up new keywords and show overlays

---

## Verification Checklist

- [ ] Backend running at http://localhost:8000
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Extension loaded in Chrome (visible in chrome://extensions/)
- [ ] Popup opens and shows meme list
- [ ] Can select/deselect memes in popup
- [ ] Test page triggers overlays for selected memes
- [ ] Overlays display (even if video doesn't play - placeholder URLs)
- [ ] Can close overlays
- [ ] Dynamic content detection works

---

## Troubleshooting

### Backend Issues

**"Module not found" error**

```bash
# Make sure you activated the virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**"Connection refused" to Supabase**

- Double-check your `.env` file has correct SUPABASE_URL and SUPABASE_KEY
- Verify credentials in Supabase dashboard: Settings → API

**"Port 8000 already in use"**

```bash
# Find and kill the process using port 8000
# macOS/Linux:
lsof -ti:8000 | xargs kill -9
# Windows:
netstat -ano | findstr :8000
# Then: taskkill /PID <PID> /F

# Or change the port in backend/.env:
API_PORT=8001
```

### Extension Issues

**Extension won't load**

- Make sure you're selecting the project root directory, not a subdirectory
- Check for syntax errors in `manifest.json`
- Look at the error message in chrome://extensions/

**Popup won't open or is blank**

- Make sure you ran `npm run build` in the popup directory
- Check that `popup/dist/index.html` exists
- Right-click extension icon → "Inspect popup" to see console errors

**No memes in popup**

- Verify backend is running (check http://localhost:8000/health)
- Open browser console (F12) and look for API errors
- Check CORS settings in backend/main.py

**Detection not working**

- Open DevTools Console (F12) while on a webpage
- Look for messages like "Meme Detector content script loaded"
- Make sure at least one meme is selected in popup
- Verify extension toggle is "Active" in popup

**Video won't play**

- The sample videos use placeholder URLs that may not work
- Check browser autoplay settings (Chrome may block autoplay)
- You can mute the video or interact with the page first
- Replace placeholder URLs in database with real video URLs

### Database Issues

**"Table does not exist"**

- Re-run the SQL schema: Copy `backend/supabase_schema.sql` contents into Supabase SQL Editor and run

**"No memes in database"**

- Re-run seed script: `python backend/seed_data.py`
- Check Supabase Table Editor → memes table for data

---

## Next Steps

### 1. Add Real Meme Videos

The seeded memes use placeholder video URLs. Replace them with real meme videos:

1. Find or create meme video clips (MP4 format recommended)
2. Host them:
   - Upload to Supabase Storage (free tier includes storage)
   - Use Cloudflare R2, AWS S3, or similar
   - Or use direct video links
3. Update the `video_url` field in Supabase:
   - Go to Table Editor → memes
   - Edit each row's `video_url`

### 2. Add More Memes

Use the API or Supabase dashboard:

**Via Supabase Table Editor:**

1. Go to Table Editor → memes → Insert row
2. Fill in: name, description, keywords (array), video_url, category

**Via API:**

```bash
curl -X POST http://localhost:8000/api/memes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Meme Name",
    "description": "Description",
    "keywords": ["keyword1", "keyword2"],
    "video_url": "https://your-video-url.mp4",
    "category": "general",
    "popularity_score": 50
  }'
```

### 3. Improve Detection

The MVP uses exact keyword matching. To improve:

- Add more keyword variations to existing memes
- Use fuzzy matching libraries (like fuse.js)
- Implement context-aware detection
- Add image detection using ML models

### 4. Customize & Extend

- Modify popup styles in `popup/src/styles.css`
- Add settings panel for overlay position, autoplay, etc.
- Implement statistics tracking
- Add category filtering in popup
- Create per-site blacklist/whitelist

---

## Development Workflow

### Making Changes

**Backend changes:**

1. Edit Python files in `backend/`
2. Server auto-reloads (if using uvicorn with `--reload`)
3. No need to restart unless you changed `.env`

**Popup changes:**

1. Edit React files in `popup/src/`
2. Run `npm run build` in popup directory
3. Reload extension in chrome://extensions/

**Content script changes:**

1. Edit files in `content/` directory
2. Reload extension in chrome://extensions/
3. Refresh the webpage you're testing on

### Viewing Logs

- **Popup logs**: Right-click extension icon → Inspect popup
- **Content script logs**: Open DevTools (F12) on any webpage
- **Background worker logs**: chrome://extensions/ → Service Worker → Inspect
- **Backend logs**: Check terminal where `python main.py` is running

---

## FAQ

**Q: Do I need to keep the backend running?**
A: Yes, the extension fetches meme data from the backend. For production, you'd deploy the backend to a cloud service.

**Q: Can I use this extension on any website?**
A: Yes, the manifest includes `<all_urls>` permission. It will work on all websites.

**Q: How often does it check for memes?**
A: Every 2 seconds, plus whenever the page DOM changes (via MutationObserver).

**Q: Can I deploy this?**
A: Yes! Deploy backend to Railway/Render/Fly.io, and publish the extension to Chrome Web Store.

**Q: Does it work offline?**
A: Partially. Selected memes and settings are cached locally, but it needs backend for initial meme list fetch.

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review backend logs and browser console
3. Check the main [README.md](README.md) for additional info

Enjoy detecting memes! 🎭
