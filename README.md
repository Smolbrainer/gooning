# Meme Detector Chrome Extension - MVP

A Chrome extension that automatically detects memes on web pages and plays corresponding videos when matches are found.

## Tech Stack

- **Frontend**: Chrome Extension (Manifest V3) with React popup
- **Backend**: FastAPI + Supabase (PostgreSQL)
- **Detection**: Keyword-based text matching

## Project Structure

```
gooning/
├── backend/                 # FastAPI backend
│   ├── main.py             # API routes
│   ├── models.py           # Pydantic models
│   ├── database.py         # Supabase client
│   ├── requirements.txt    # Python dependencies
│   ├── seed_data.py        # Sample data seeding
│   ├── supabase_schema.sql # Database schema
│   └── README.md           # Backend documentation
├── popup/                   # React popup UI
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── styles.css      # Popup styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── content/                 # Content scripts
│   ├── content.js          # Main content script
│   ├── detector.js         # Detection logic
│   ├── overlay.js          # Video overlay component
│   └── content.css         # Overlay styles
├── background/
│   └── service-worker.js   # Background service worker
├── utils/
│   ├── api.js              # API communication
│   └── storage.js          # Chrome storage wrapper
├── assets/
│   └── icons/              # Extension icons
├── manifest.json           # Extension manifest
└── README.md               # This file
```

## Setup Instructions

### 1. Set Up Supabase Backend

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Project Settings > API

#### Set Up Database
1. In Supabase SQL Editor, run the contents of `backend/supabase_schema.sql`
2. This creates the `memes` and `user_selections` tables

#### Configure Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials
```

#### Seed Sample Data
```bash
python seed_data.py
```

#### Start Backend Server
```bash
# Option 1: Using start script
chmod +x start.sh
./start.sh

# Option 2: Manually
python main.py
```

Backend will be running at `http://localhost:8000`
- API docs: http://localhost:8000/docs

### 2. Build React Popup

```bash
cd popup

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `popup/dist` folder with the compiled React app.

### 3. Generate Extension Icons

The extension requires icons in three sizes: 16x16, 48x48, and 128x128 pixels.

**Quick fix for MVP**: Download placeholder icons or create simple ones:
```bash
# Place icons in assets/icons/
assets/icons/icon16.png
assets/icons/icon48.png
assets/icons/icon128.png
```

### 4. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the project root directory (`gooning/`)
5. The extension should now appear in your extensions list

## Usage

### For Users

1. **Open the Extension**: Click the Meme Detector icon in your Chrome toolbar
2. **Select Memes**: Check the memes you want to detect from the list
3. **Browse the Web**: Visit any website
4. **Automatic Detection**: When a selected meme's keyword appears on the page, a video overlay will appear
5. **Close Overlay**: Click the X button or click outside the overlay

### For Developers

#### Testing Detection

Create a test HTML file with meme keywords:

```html
<!DOCTYPE html>
<html>
<head><title>Meme Test Page</title></head>
<body>
  <h1>Testing Meme Detection</h1>
  <p>Let's talk about stonks and investing in the market!</p>
  <p>Everything is fine. This is fine. The fire is fine.</p>
  <p>Surprised pikachu face when you see this detection work!</p>
</body>
</html>
```

Open this file in Chrome and the detector should trigger overlays for any selected memes.

#### Debugging

- **View Extension Logs**:
  - Right-click extension icon > Inspect popup (for popup logs)
  - Chrome DevTools Console (for content script logs)
  - chrome://extensions/ > Service Worker > Inspect (for background logs)

- **Check API Connection**: Visit http://localhost:8000/health

- **View Storage**:
  - DevTools > Application > Storage > Extension Storage

## MVP Features

### Included
- ✅ Meme selection from backend API
- ✅ Keyword-based text detection
- ✅ Video overlay on detection
- ✅ Enable/disable toggle
- ✅ Selection persistence
- ✅ Dynamic content detection (MutationObserver)
- ✅ Cooldown between detections (30 seconds per meme)

### Not Included (Future)
- ❌ Image-based detection
- ❌ Settings panel (sensitivity, position, etc.)
- ❌ Search/filter in popup
- ❌ Statistics dashboard
- ❌ Per-page disable
- ❌ Custom overlay positioning
- ❌ Fuzzy keyword matching

## API Endpoints

- `GET /api/memes` - Get all memes
- `GET /api/memes/{id}` - Get single meme
- `GET /api/video/{id}` - Get video URL for meme
- `POST /api/user-selections` - Save user selections
- `GET /api/user-selections/{user_id}` - Get user selections

## Configuration

### Backend (backend/.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend (utils/api.js)
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## Troubleshooting

### Extension Not Loading
- Check manifest.json syntax
- Verify all file paths in manifest are correct
- Rebuild popup if React files were changed: `cd popup && npm run build`

### Detection Not Working
- Verify backend is running (http://localhost:8000/health)
- Check that memes are selected in popup
- Verify extension is enabled (toggle in popup)
- Open DevTools console to see detection logs

### Video Not Playing
- Check video URL in backend database
- Verify video URL is accessible
- Check browser autoplay settings
- See console for video errors

### API Connection Failed
- Ensure backend server is running
- Check CORS settings in backend/main.py
- Verify API_BASE_URL in utils/api.js matches backend

## Development Workflow

1. **Make Backend Changes**: Edit Python files, server auto-reloads with uvicorn
2. **Make Popup Changes**: Edit React files in `popup/src/`, then run `npm run build`
3. **Make Content Script Changes**: Edit files in `content/`, then reload extension
4. **Reload Extension**: Go to chrome://extensions/ and click reload icon

## Notes

- Sample videos use placeholder URLs - replace with real meme videos
- Cooldown period: 30 seconds between same meme detections
- Detection scans every 2 seconds + on DOM changes
- Detection limited to first 10,000 characters of page text

## Next Steps

1. Replace placeholder video URLs with real meme videos
2. Generate proper extension icons
3. Add more memes to database
4. Test on various websites
5. Improve keyword matching (fuzzy search)
6. Add settings panel for customization

## License

MIT License - feel free to use and modify for your needs.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console for errors
- Verify backend API is functioning correctly

---

**Note**: This extension requires a backend API to function. See "Backend API Requirements" section for details.
- Ts bs
This is a learning/demo project. Use at your own discretion.
