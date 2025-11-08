# Meme Detector Chrome Extension - Project Prompts

## CENTRAL PROJECT PROMPT

### Project Overview

You are building a Chrome Web Extension called "Meme Detector" that automatically detects memes on web pages and plays corresponding meme videos from a backend database. The system allows users to select which memes they want to detect, then scans web pages in real-time for related content and triggers video playback when matches are found.

### System Architecture

**Components:**

1. **Chrome Extension (Frontend)**

   - Popup UI for meme selection and settings
   - Content scripts for page scanning and detection
   - Background service worker for API communication
   - Video overlay component for playback

2. **Backend API**

   - RESTful API for meme library management
   - Database storing meme metadata, keywords, and video URLs
   - Optional: ML-based detection service for advanced matching

3. **Database Schema**

   ```
   memes:
     - id (primary key)
     - name (string)
     - description (text)
     - keywords (array of strings)
     - template_image_url (string, optional)
     - video_url (string)
     - category (string)
     - created_at (timestamp)
     - popularity_score (integer)

   user_selections:
     - user_id (string, browser fingerprint)
     - meme_ids (array)
     - settings (json)
   ```

### Core Functionality Flow

1. **Setup Phase:**

   - User opens extension popup
   - Extension fetches available memes from backend API
   - User selects memes to detect and configures settings
   - Selections stored locally using Chrome Storage API

2. **Detection Phase:**

   - Content script injected into active web pages
   - Script continuously monitors page content (text, images, DOM changes)
   - Compares page content against selected meme keywords/patterns
   - Uses MutationObserver for dynamic content detection

3. **Playback Phase:**
   - When match detected, content script creates overlay
   - Fetches video URL from backend (or retrieves from cache)
   - Displays video player with controls
   - Tracks user interactions (dismiss, replay, disable)

### Technical Requirements

**Chrome Extension:**

- Manifest V3 compliance
- Permissions: activeTab, storage, scripting, host permissions for API
- Technologies: Vanilla JS or React for popup, CSS for styling
- Content Security Policy compliant

**Backend API:**

- RESTful endpoints (Express.js, Flask, or FastAPI)
- Authentication: Optional API key for extension
- CORS enabled for extension origin
- Video hosting: CDN or cloud storage (S3, Cloudflare R2)

**Detection Algorithms:**

- Text matching: Fuzzy string matching, keyword presence
- Image matching: perceptual hashing (pHash), template matching
- Context awareness: analyze surrounding text for relevance
- Performance: debounced/throttled detection to avoid lag

### API Endpoints

```
GET /api/memes
  Response: { memes: Array<Meme> }

GET /api/memes/:id
  Response: { meme: Meme }

POST /api/detect
  Body: { content: string, imageUrls: string[] }
  Response: { matches: Array<{ memeId, confidence }> }

GET /api/video/:memeId
  Response: { videoUrl: string, metadata: Object }
```

### User Experience Priorities

- Non-intrusive detection (user controls when/where)
- Fast, lightweight page scanning (<50ms detection cycles)
- Smooth video playback without page disruption
- Clear visual feedback for detections
- Easy meme management (add/remove from detection list)

### Security & Privacy

- No collection of browsing history
- Local storage of user preferences
- Secure API communication (HTTPS only)
- No third-party analytics without consent
- Content script isolation from page scripts

---

## FRONTEND PROMPT (Chrome Extension)

### Objective

Build the Chrome Web Extension frontend for the Meme Detector project. This includes the popup interface, content scripts for detection, and video overlay components.

### Extension Structure

```
meme-detector-extension/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/
│   ├── content.js
│   ├── detector.js
│   ├── overlay.js
│   └── content.css
├── background/
│   └── service-worker.js
├── assets/
│   ├── icons/
│   └── styles/
└── utils/
    ├── storage.js
    └── api.js
```

### Component 1: Popup Interface (popup.html, popup.js, popup.css)

**Requirements:**

- **Header Section:**

  - Extension logo and title
  - Settings gear icon (opens settings panel)
  - Enable/Disable toggle for detection

- **Meme Library Section:**

  - Search bar to filter memes
  - Category tabs/filters (Trending, All, Selected)
  - Scrollable grid/list of available memes with:
    - Meme thumbnail/icon
    - Meme name
    - Checkbox or toggle to enable detection
    - Quick info icon (shows keywords on hover)

- **Selected Memes Section:**

  - List of currently active memes
  - Quick remove button for each
  - "Clear All" button

- **Settings Panel (expandable):**

  - Detection sensitivity slider
  - Video autoplay toggle
  - Overlay position selector (corner placement)
  - Notification preferences
  - API connection status indicator

- **Footer:**
  - Stats: "X memes detected today"
  - Link to feedback/support

**Functionality:**

```javascript
// Key functions needed:
-loadMemesFromAPI() -
  toggleMemeSelection(memeId) -
  saveUserPreferences() -
  updateDetectionStatus() -
  searchMemes(query) -
  filterByCategory(category);
```

**Styling:**

- Modern, clean UI (consider dark mode option)
- Smooth animations for interactions
- Responsive to different popup sizes
- Consistent color scheme (e.g., accent colors for detected memes)

### Component 2: Content Script (content.js, detector.js)

**Requirements:**

**Main Content Script (content.js):**

```javascript
// Initialize detection on page load
- Inject overlay HTML/CSS into page
- Set up MutationObserver for DOM changes
- Listen for messages from service worker
- Coordinate between detector and overlay modules
```

**Detector Module (detector.js):**

```javascript
class MemeDetector {
  constructor(selectedMemes) {
    this.memes = selectedMemes;
    this.detectionInterval = null;
    this.lastDetection = {};
  }

  // Core methods to implement:
  startDetection() {
    // Begin scanning page
  }

  stopDetection() {
    // Pause scanning
  }

  scanPageContent() {
    // Extract text from visible page elements
    // Get all image URLs
    // Return { text, images }
  }

  detectMemes(pageContent) {
    // Compare against meme keywords
    // Return matches with confidence scores
  }

  analyzeText(text, memeKeywords) {
    // Fuzzy matching logic
    // Return boolean + confidence
  }

  analyzeImages(imageUrls) {
    // Optional: send to backend for image matching
  }

  handleDetection(meme) {
    // Prevent duplicate detections (cooldown)
    // Trigger overlay display
    // Log detection
  }
}
```

**Performance Optimizations:**

- Debounce detection function (e.g., 500ms)
- Cache previous scan results
- Only scan visible viewport initially
- Use IntersectionObserver for lazy detection
- Limit text analysis to first 10,000 characters

### Component 3: Video Overlay (overlay.js, content.css)

**Requirements:**

**Overlay Structure:**

```html
<div id="meme-detector-overlay" class="md-overlay">
  <div class="md-container">
    <div class="md-header">
      <span class="md-meme-name"><!-- Meme Name --></span>
      <button class="md-close">×</button>
    </div>
    <div class="md-video-wrapper">
      <video class="md-video" autoplay muted loop>
        <source src="" type="video/mp4" />
      </video>
    </div>
    <div class="md-controls">
      <button class="md-replay">Replay</button>
      <button class="md-disable">Don't show on this page</button>
    </div>
  </div>
</div>
```

**Overlay Functionality:**

```javascript
class MemeOverlay {
  constructor() {
    this.overlay = null;
    this.currentMeme = null;
    this.isVisible = false;
  }

  // Methods to implement:
  create() {
    // Inject overlay HTML into page
  }

  show(meme) {
    // Display overlay with animation
    // Load video from meme.video_url
    // Position based on user settings
  }

  hide() {
    // Fade out animation
    // Stop video playback
  }

  updatePosition(position) {
    // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  }

  handleClose() {
    // User clicked close button
  }

  handleDisable() {
    // Add current page to blacklist
  }

  handleReplay() {
    // Restart video
  }
}
```

**Styling Requirements (content.css):**

- Fixed position overlay with high z-index (9999)
- Semi-transparent backdrop (rgba(0,0,0,0.5))
- Slide-in animation from chosen corner
- Video container: max 400px width, responsive
- Smooth transitions for show/hide
- Mobile-responsive design
- Should not break page layout or functionality

### Component 4: Background Service Worker (service-worker.js)

**Requirements:**

```javascript
// Key responsibilities:

1. API Communication:
   - Fetch memes from backend on extension load
   - Cache meme data locally
   - Handle API errors gracefully

2. Message Passing:
   - Listen for messages from popup (preference updates)
   - Forward detection requests to content scripts
   - Manage cross-tab communication

3. Storage Management:
   - Sync user preferences across devices (chrome.storage.sync)
   - Cache video URLs for offline access
   - Track detection statistics

4. Lifecycle Management:
   - Initialize on extension install
   - Handle updates/migrations
   - Clean up resources

// Key functions:
- initializeExtension()
- fetchMemesFromAPI()
- updateContentScripts(preferences)
- handleStorageChanges()
- logDetectionEvent(memeId, pageUrl)
```

### Component 5: Utility Modules

**storage.js:**

```javascript
// Wrapper for Chrome Storage API
export const storage = {
  async getSelectedMemes() {},
  async setSelectedMemes(memeIds) {},
  async getSettings() {},
  async updateSettings(settings) {},
  async getStats() {},
  async incrementDetectionCount(memeId) {},
};
```

**api.js:**

```javascript
// API communication helper
const API_BASE_URL = "YOUR_BACKEND_URL";

export const api = {
  async fetchMemes() {},
  async getMemeById(id) {},
  async getVideoUrl(memeId) {},
  async sendDetectionRequest(content) {},
};
```

### Manifest.json Configuration

```json
{
  "manifest_version": 3,
  "name": "Meme Detector",
  "version": "1.0.0",
  "description": "Detect memes on web pages and watch them instantly",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://your-api-domain.com/*"],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "assets/icons/icon16.png",
      "48": "assets/icons/icon48.png",
      "128": "assets/icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content.js", "content/detector.js", "content/overlay.js"],
      "css": ["content/content.css"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "assets/icons/icon16.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  }
}
```

### Development Checklist

**Phase 1: Basic Structure**

- [ ] Set up manifest.json
- [ ] Create popup interface with static meme list
- [ ] Implement basic content script injection
- [ ] Test extension loading in Chrome

**Phase 2: API Integration**

- [ ] Build API utility module
- [ ] Connect popup to backend API
- [ ] Implement meme selection/storage
- [ ] Set up service worker message passing

**Phase 3: Detection Logic**

- [ ] Implement text-based detection
- [ ] Add MutationObserver for dynamic content
- [ ] Test detection accuracy on various sites
- [ ] Optimize performance

**Phase 4: Video Overlay**

- [ ] Create overlay component
- [ ] Implement video playback
- [ ] Add user controls (close, disable, replay)
- [ ] Style overlay responsively

**Phase 5: Polish**

- [ ] Add settings panel
- [ ] Implement statistics tracking
- [ ] Error handling and edge cases
- [ ] Cross-browser testing
- [ ] Accessibility improvements

### Testing Strategy

- Test on different types of websites (news, social media, blogs)
- Verify detection doesn't impact page performance
- Test video playback across different domains
- Ensure overlay doesn't block interactive page elements
- Test with multiple memes selected simultaneously
- Verify storage limits aren't exceeded

### Common Pitfalls to Avoid

- Don't scan entire DOM on every change (performance killer)
- Avoid blocking main thread with heavy computations
- Handle CORS issues properly for video loading
- Don't inject overlay multiple times
- Properly clean up event listeners and observers
- Handle pages with strict CSP policies
- Test memory leaks with long browsing sessions
