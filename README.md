# Meme Detector Chrome Extension

A Chrome extension that automatically detects memes on web pages and plays corresponding videos when matches are found. This repository contains the Chrome extension frontend (popup, content scripts, overlay), a lightweight FastAPI backend that stores meme metadata and videos (Supabase), and a background service worker that manages caching, settings and statistics.

## Tech Stack

- **Frontend**: Chrome Extension (Manifest V3) with React popup
- **Backend**: FastAPI + Supabase (PostgreSQL)
- **Detection**: Keyword-based text matching

## New / Notable Features (since MVP)

The project has added several user-facing and developer features beyond a minimal proof-of-concept. Highlights:

- Popup / UI
  - Add new memes directly from the popup (name, description, comma-separated keywords, category, and video/GIF/YouTube URL).
  - Manage memes: inline edit, delete (with confirmation), and search/filter.
  - Meme list supports searching by name, keyword, or category; select/deselect individual memes; and a Select All / Deselect All toggle.
  - Selected Memes panel with quick Remove buttons and a Clear All action.
  - Detection toggle and settings (autoplay, overlay position) are persisted in extension storage.

- Statistics
  - Built-in Stats view in the popup showing total detections, unique memes detected, and per-meme detection counts with a clear-stats button.

- Content script & detection
  - Scans page text for keywords every 2 seconds and whenever the DOM changes (MutationObserver). The scanned text is limited to the first 10,000 characters for performance.
  - An input "mirror" listens to user typing (inputs / textareas / contenteditables) and scans those texts in real time.
  - Detection selects the most-common matching meme (by keyword match counts) and forwards a detection event to the background script.
  - Global cooldown between detections to avoid spam: 15 seconds (implemented in code).

- Overlay / playback
  - Overlay supports YouTube embeds (converted to embed URLs with autoplay/loop), GIFs, and plain video files (mp4/webm). Videos attempt muted autoplay, then unmute shortly after.
  - IntersectionObserver is used to play/pause actual video elements as they scroll into view.
  - Overlays auto-fade after 10 seconds and gracefully stop audio when hiding.

- Background / service worker
  - Caches meme metadata from the backend (`/api/memes`) into `chrome.storage.local` on install and refreshes periodically (every 30 minutes).
  - Handles detection events to update statistics in local storage.
  - Provides bridge messages for API health checks and a page-bridge action to request closing the active tab.

These features are implemented across `popup/src/components/*`, `content/*.js`, `background/service-worker.js`, and `backend/*`.

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

1. **Open the Extension**: Click the Meme Detector icon in your Chrome toolbar.
2. **Select Memes**: Use the popup to select/deselect memes you want to detect. Use the search box to filter. Use "Select All" to enable detection for all results.
3. **Add a Meme**: Use the "Add New Meme" form to create a new meme. Enter comma-separated keywords and a video/GIF/YouTube URL. New memes are POSTed to the backend and cached locally.
4. **Manage Memes**: Open "Manage Memes" to edit or delete entries. Deleting a meme updates local cache and notifies content scripts to reinitialize detection.
5. **View Stats**: Open the "Stats" panel in the popup to see total detections and per-meme counts. Use "Clear Stats" to reset.
6. **Browse the Web**: Visit any website. Detection runs periodically and on DOM changes; when a match is found the overlay will appear.
7. **Overlay Controls**: The overlay will auto-fade after ~10 seconds. Use popup settings to change autoplay or overlay position.

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

### How the detection flow works (developer notes)

- On extension install the background service worker caches memes from the API into `chrome.storage.local` (`allMemes`).
- The popup writes `selectedMemes` (array of meme IDs) into `chrome.storage.local` when users select/deselect or save selections.
- The content script initializes a `MemeDetector` instance with selected meme objects and:
  - Scans the first 10,000 characters of page text every 2 seconds.
  - Scans input/textarea/contenteditable text in real time (input mirror).
  - Uses a MutationObserver to scan after DOM mutations (debounced).
  - When a meme is detected, it calls `MemeOverlay.show()` and sends a `DETECTION_EVENT` message to the background worker for stats.


- **View Storage**:
  - DevTools > Application > Storage > Extension Storage

### Implemented Features (MVP + additions)

The extension now includes the following implemented features:

- ✅ Meme selection from backend API (cached locally by the service worker)
- ✅ Keyword-based text detection (page scans + input mirror)
- ✅ Video overlay on detection (YouTube, GIF, mp4/webm)
- ✅ Enable/disable toggle
- ✅ Selection persistence in `chrome.storage.local`
- ✅ Dynamic content detection (MutationObserver)
- ✅ Cooldown between detections (global cooldown: 15 seconds)
- ✅ Add new memes from the popup (POST /api/memes)
- ✅ Manage memes (inline edit / PUT, delete / DELETE with confirmation)
- ✅ Popup search & filter, Select All / Deselect All
- ✅ Selected Memes panel with Clear All
- ✅ Detection statistics and a Stats view with per-meme counts


### Not Included / Future Work

The following are planned or optional improvements:

- Image-based or ML-based visual detection (not implemented)
- Advanced fuzzy keyword matching / synonyms
- Per-origin or per-page disable controls
- Rich settings UI for sensitivity, overlay size, and position presets
- Admin authentication + role-based permissions for meme management
- Built-in video hosting / CDN integration for reliability

## API Endpoints

- `GET /api/memes` - Get all memes
- `GET /api/memes/{id}` - Get single meme
- `GET /api/video/{id}` - Get video URL for meme
- `POST /api/user-selections` - Save user selections
- `GET /api/user-selections/{user_id}` - Get user selections

Additional notes:
- `GET /health` returns API health.
- The backend endpoints support create/update/delete for memes. The popup components call these endpoints (see `popup/src/components/AddMeme.jsx` and `ManageMemes.jsx`).

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

If detections are not appearing:
- Ensure the service worker has cached `allMemes` (open chrome://extensions > Service worker > Inspect and check logs). The background worker periodically refreshes memes every 30 minutes and on install.
- Confirm `selectedMemes` contains meme IDs in `chrome.storage.local` (DevTools > Application > Storage > Extension Storage).
- If a newly added meme doesn't show immediately, try "Refresh memes" from the popup (or reload the extension) to fetch the latest cache.

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

## Files to inspect for behavior

- `popup/src/components/AddMeme.jsx` — add memes via API and update local cache
- `popup/src/components/ManageMemes.jsx` — inline editing, deletion and storage sync
- `popup/src/components/Stats.jsx` — read/write stats from `chrome.storage.local`
- `content/detector.js`, `content/overlay.js`, `content/content.js` — detection, overlay and input mirroring logic
- `background/service-worker.js` — initialization, caching, stats update and periodic refresh
- `backend/main.py` — FastAPI CRUD endpoints and user selections


## Notes

- Sample videos use placeholder URLs - replace with real meme videos
- Cooldown period: 15 seconds between detections (global cooldown implemented in detector)
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

