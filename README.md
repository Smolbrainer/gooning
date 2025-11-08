# Meme Detector Chrome Extension

A Chrome Web Extension that automatically detects memes on web pages and plays corresponding meme videos from a backend database.

## Features

- **Real-time Meme Detection**: Automatically scans web pages for meme content using keyword matching
- **Customizable Selection**: Choose which memes you want to detect from a comprehensive library
- **Video Overlay**: Plays meme videos in a non-intrusive overlay when matches are found
- **Smart Detection**: Configurable sensitivity and cooldown periods to prevent spam
- **Lightweight**: Optimized performance with minimal impact on browsing experience
- **Privacy-Focused**: No browsing history collection, all preferences stored locally

## Project Structure

```
meme-detector-extension/
├── manifest.json                 # Extension manifest (Manifest V3)
├── popup/                        # Popup UI
│   ├── popup.html               # Popup interface
│   ├── popup.css                # Popup styles
│   └── popup.js                 # Popup logic
├── content/                      # Content scripts
│   ├── content.js               # Main content script coordinator
│   ├── detector.js              # Meme detection logic
│   ├── overlay.js               # Video overlay component
│   └── content.css              # Overlay styles
├── background/                   # Background service worker
│   └── service-worker.js        # API communication & message passing
├── utils/                        # Utility modules
│   ├── storage.js               # Chrome Storage API wrapper
│   └── api.js                   # Backend API communication
└── assets/                       # Static assets
    └── icons/                   # Extension icons
```

## Installation

### Development Setup

1. **Clone or download this extension folder**

2. **Generate Icon Files** (Optional - placeholder icons are provided)
   ```bash
   # If you want to convert the SVG icon to PNG formats
   # Install dependencies
   npm install -g sharp-cli

   # Generate icons
   cd assets/icons
   sharp -i icon.svg -o icon16.png resize 16 16
   sharp -i icon.svg -o icon48.png resize 48 48
   sharp -i icon.svg -o icon128.png resize 128 128
   ```

   Or simply copy the SVG as placeholder:
   ```bash
   cd assets/icons
   cp icon.svg icon16.png
   cp icon.svg icon48.png
   cp icon.svg icon128.png
   ```

3. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `meme-detector-extension` folder
   - The extension should now appear in your extensions list

4. **Configure Backend API** (Required)
   - Update the API URL in `background/service-worker.js` (line 7):
     ```javascript
     const API_BASE_URL = 'http://localhost:3000/api'; // Change to your backend URL
     ```
   - Update the API URL in `utils/api.js` (line 5):
     ```javascript
     const API_BASE_URL = 'http://localhost:3000/api'; // Change to your backend URL
     ```

## Backend Setup

A FastAPI backend is included in the `backend/` directory!

### Quick Start

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Run the start script:
   ```bash
   ./start.sh          # macOS/Linux
   start.bat           # Windows
   ```

3. The API will be running at `http://localhost:3000`
   - API Docs: http://localhost:3000/docs
   - Health Check: http://localhost:3000/api/health

See [backend/README.md](backend/README.md) for detailed backend documentation.

## Backend API Requirements

The extension requires a backend API with the following endpoints:

### GET /api/memes
Returns all available memes.

**Response:**
```json
{
  "memes": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "keywords": ["string"],
      "video_url": "string",
      "category": "string",
      "popularity_score": 0
    }
  ]
}
```

### GET /api/memes/:id
Returns a specific meme by ID.

**Response:**
```json
{
  "meme": {
    "id": "string",
    "name": "string",
    "description": "string",
    "keywords": ["string"],
    "video_url": "string",
    "category": "string",
    "popularity_score": 0
  }
}
```

### GET /api/video/:memeId
Returns video URL for a meme.

**Response:**
```json
{
  "videoUrl": "string",
  "metadata": {}
}
```

### POST /api/detect (Optional)
Advanced detection using backend processing.

**Request:**
```json
{
  "content": "string",
  "imageUrls": ["string"]
}
```

**Response:**
```json
{
  "matches": [
    {
      "memeId": "string",
      "confidence": 0.95
    }
  ]
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Usage

1. **Select Memes**: Click the extension icon to open the popup and select which memes you want to detect
2. **Browse Normally**: Visit any website and the extension will automatically scan for meme content
3. **Watch Videos**: When a meme is detected, a video overlay will appear with the corresponding meme video
4. **Configure Settings**: Click the settings icon to adjust detection sensitivity, overlay position, and other preferences

## Features in Detail

### Meme Detection
- **Text-based matching**: Scans page content for meme-related keywords
- **Fuzzy matching**: Uses similarity algorithms to catch variations in text
- **Dynamic content**: MutationObserver watches for new content added to the page
- **Performance optimized**: Debounced detection with configurable intervals

### Video Overlay
- **Customizable position**: Choose from 4 corner positions
- **Responsive design**: Adapts to different screen sizes
- **User controls**: Play, pause, replay, and dismiss
- **Page blacklist**: Disable detection on specific sites

### Settings
- **Detection Sensitivity**: Adjust how strict the matching algorithm is (0-100%)
- **Autoplay**: Toggle automatic video playback
- **Overlay Position**: Choose where videos appear (4 corners)
- **Notifications**: Enable/disable detection notifications
- **Detection Cooldown**: Time between detecting the same meme (default: 30s)

## Privacy & Security

- **No tracking**: Extension does not collect or transmit browsing history
- **Local storage**: All preferences stored locally using Chrome Storage API
- **Isolated scripts**: Content scripts run in isolated world, separate from page scripts
- **HTTPS only**: API communication over secure connections
- **No third-party analytics**: No external tracking or analytics services

## Troubleshooting

### Extension doesn't detect memes
- Check that detection is enabled (toggle in popup)
- Verify you have selected memes in the popup
- Check console for errors: Right-click extension icon → Inspect popup
- Ensure backend API is running and accessible

### Videos won't play
- Check that video URLs in backend are valid and accessible
- Verify CORS is enabled on video hosting server
- Check browser console for errors (F12)
- Try disabling autoplay and manually clicking play

### Settings not saving
- Check Chrome Storage API permissions in manifest.json
- Clear extension storage: Extensions page → Remove extension → Reinstall
- Check for errors in background service worker: chrome://extensions → Service worker → Inspect

### Performance issues
- Reduce detection sensitivity
- Decrease number of selected memes
- Increase detection cooldown period
- Clear browsing data and restart browser

## Development

### Testing
- Test on various websites (news, social media, blogs)
- Test with different meme keywords
- Verify performance with Developer Tools
- Check memory usage in Task Manager

### Debugging
- **Popup**: Right-click extension icon → Inspect popup
- **Background**: chrome://extensions → Service worker → Inspect
- **Content Script**: F12 on any page → Console tab
- Check "Preserve log" in console for page navigation issues

### Building for Production
1. Update version in manifest.json
2. Remove console.log statements
3. Minify JavaScript files (optional)
4. Test on clean Chrome profile
5. Zip extension folder for distribution

## Known Limitations

- Text-only detection (image recognition requires backend implementation)
- Chrome/Chromium browsers only (Manifest V3)
- Requires active internet connection for API and videos
- Maximum 100KB sync storage for settings (Chrome limitation)

## Future Enhancements

- [ ] Image-based meme detection using computer vision
- [ ] Browser notifications for detections
- [ ] Detection history and statistics dashboard
- [ ] Export/import settings and meme selections
- [ ] Dark mode theme
- [ ] Keyboard shortcuts
- [ ] Multiple language support
- [ ] Offline mode with cached videos

## Contributing

This is a demonstration project. For production use:
1. Implement proper error handling
2. Add comprehensive testing
3. Optimize bundle size
4. Add accessibility features
5. Implement analytics (optional)

## License

MIT License - feel free to use and modify for your needs.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review browser console for errors
- Verify backend API is functioning correctly

---

**Note**: This extension requires a backend API to function. See "Backend API Requirements" section for details.
