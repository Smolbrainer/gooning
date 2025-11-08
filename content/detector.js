// Meme Detector - Detection Logic

class MemeDetector {
  constructor(selectedMemes) {
    this.memes = selectedMemes || [];
    this.detectionInterval = null;
    this.lastDetection = {}; // Track last detection time per meme
    this.cooldownPeriod = 30000; // 30 seconds cooldown between same meme detections
    this.isDetecting = false;
    this.onDetectionCallback = null;
  }

  /**
   * Update the list of memes to detect
   * @param {Array} memes - Array of meme objects
   */
  updateMemes(memes) {
    this.memes = memes || [];
    console.log('Detector updated with', this.memes.length, 'memes');
  }

  /**
   * Set callback for when meme is detected
   * @param {Function} callback - Function to call with detected meme
   */
  onDetection(callback) {
    this.onDetectionCallback = callback;
  }

  /**
   * Start detection process
   */
  startDetection() {
    if (this.isDetecting) {
      console.log('Detection already running');
      return;
    }

    if (this.memes.length === 0) {
      console.log('No memes selected, skipping detection');
      return;
    }

    console.log('Starting meme detection...');
    this.isDetecting = true;

    // Initial scan
    this.scanPage();

    // Set up periodic scanning (every 2 seconds)
    this.detectionInterval = setInterval(() => {
      this.scanPage();
    }, 2000);
  }

  /**
   * Stop detection process
   */
  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.isDetecting = false;
    console.log('Detection stopped');
  }

  /**
   * Scan page for meme keywords
   */
  scanPage() {
    if (this.memes.length === 0) return;

    try {
      const pageContent = this.extractPageContent();
      this.detectMemes(pageContent);
    } catch (error) {
      console.error('Error scanning page:', error);
    }
  }

  /**
   * Extract text content from page
   * @returns {string} Page text content
   */
  extractPageContent() {
    // Get visible text from page body
    const bodyText = document.body.innerText || document.body.textContent || '';

    // Limit to first 10,000 characters for performance
    return bodyText.substring(0, 10000).toLowerCase();
  }

  /**
   * Detect memes in page content
   * @param {string} pageText - Page text content
   */
  detectMemes(pageText) {
    const now = Date.now();

    for (const meme of this.memes) {
      // Check cooldown
      const lastDetected = this.lastDetection[meme.id];
      if (lastDetected && (now - lastDetected) < this.cooldownPeriod) {
        continue; // Still in cooldown period
      }

      // Check if any keyword matches
      const matched = this.checkKeywords(pageText, meme.keywords);

      if (matched) {
        console.log('Meme detected:', meme.name, 'keyword:', matched);
        this.handleDetection(meme, matched);
      }
    }
  }

  /**
   * Check if any keywords are present in text
   * @param {string} text - Text to search
   * @param {Array} keywords - Keywords to look for
   * @returns {string|null} Matched keyword or null
   */
  checkKeywords(text, keywords) {
    for (const keyword of keywords) {
      const searchTerm = keyword.toLowerCase();

      // Simple exact match (for MVP)
      if (text.includes(searchTerm)) {
        return keyword;
      }
    }
    return null;
  }

  /**
   * Handle a meme detection
   * @param {Object} meme - Detected meme object
   * @param {string} matchedKeyword - The keyword that matched
   */
  handleDetection(meme, matchedKeyword) {
    // Update last detection time
    this.lastDetection[meme.id] = Date.now();

    // Trigger callback
    if (this.onDetectionCallback) {
      this.onDetectionCallback(meme, matchedKeyword);
    }

    // Report detection to background script for stats
    try {
      chrome.runtime.sendMessage({
        type: 'DETECTION_EVENT',
        memeId: meme.id,
        memeName: meme.name,
        matchedKeyword: matchedKeyword
      }).catch(error => {
        // Silently ignore - extension may have been reloaded
        if (!error.message?.includes('Extension context invalidated')) {
          console.warn('Error sending detection event:', error.message);
        }
      });
    } catch (error) {
      // Extension context may be invalidated, ignore silently
    }
  }

  /**
   * Check if currently detecting
   * @returns {boolean}
   */
  isActive() {
    return this.isDetecting;
  }
}

// Make available globally for content script
if (typeof window !== 'undefined') {
  window.MemeDetector = MemeDetector;
}
