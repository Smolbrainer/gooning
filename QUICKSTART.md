# Quick Start Guide

Get the Meme Detector running in under 10 minutes!

## Prerequisites Check

```bash
# Check Python version (need 3.8+)
python3 --version

# Check Node.js (need 16+)
node --version

# Check npm
npm --version
```

## 5-Minute Setup

### 1. Supabase Setup (2 min)
1. Go to https://supabase.com → Create project
2. Copy URL and anon key from Settings → API
3. In SQL Editor, paste contents of `backend/supabase_schema.sql` and run

### 2. Backend Setup (2 min)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
python seed_data.py
python main.py
```

Backend should be running at http://localhost:8000

### 3. Frontend Build (1 min)
```bash
# Open new terminal
cd popup
npm install
npm run build
```

### 4. Load Extension (30 sec)
1. Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `gooning/` directory

### 5. Test It! (30 sec)
1. Click extension icon → Select some memes
2. Open `test-page.html` in Chrome
3. Watch for video overlays to appear!

## Troubleshooting

**Backend won't start?**
- Check `.env` has correct Supabase credentials
- Run `python seed_data.py` to add memes

**Extension won't load?**
- Make sure `npm run build` completed in popup/
- Check for errors in chrome://extensions/

**No detection?**
- Backend must be running (check http://localhost:8000/health)
- At least one meme must be selected in popup
- Toggle must be "Active" in popup

## Next Steps

See [SETUP.md](SETUP.md) for detailed instructions and [README.md](README.md) for full documentation.
