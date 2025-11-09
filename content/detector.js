// Meme Detector - Detection Logic

class MemeDetector {
  constructor(selectedMemes) {
    this.memes = selectedMemes || [];
    this.detectionInterval = null;
    this.lastGlobalDetection = null; // Track last detection time (global cooldown)
    this.cooldownPeriod = 15000; // 30 seconds global cooldown between ANY meme detections
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
      this.detectMemes(pageContent, { source: 'page' });
    } catch (error) {
      console.error('Error scanning page:', error);
    }
  }

  /**
   * Scan arbitrary text for meme keywords (e.g., user input)
   * @param {string} rawText - Text to scan
   * @param {Object} context - Additional metadata about the text source
   */
  scanText(rawText, context = {}) {
    if (typeof rawText !== 'string') return;

    const normalizedText = rawText.toLowerCase();
    if (!normalizedText.trim()) return;

    const scanContext = {
      source: context.source || 'input',
      element: context.element || null
    };

    this.detectMemes(normalizedText, scanContext);
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
  detectMemes(pageText, context = {}) {
    if (typeof pageText !== 'string' || !pageText.trim()) {
      return;
    }

    const now = Date.now();
    const detectionSource = context.source || 'page';

    // Check global cooldown first - only 1 meme every 30 seconds
    if (this.lastGlobalDetection && (now - this.lastGlobalDetection) < this.cooldownPeriod) {
      const remaining = Math.ceil((this.cooldownPeriod - (now - this.lastGlobalDetection)) / 1000);
      // Silently skip - in cooldown
      return;
    }
    
    // Build frequency map for all memes
    const memeFrequencies = [];

    for (const meme of this.memes) {
      // Count how many keywords match for this meme
      const matchCount = this.countKeywordMatches(pageText, meme.keywords);

      if (matchCount > 0) {
        memeFrequencies.push({
          meme,
          count: matchCount,
          keywords: this.getMatchedKeywords(pageText, meme.keywords)
        });
      }
    }

    // If we found matches, trigger the most common one
    if (memeFrequencies.length > 0) {
      // Sort by frequency (highest first)
      memeFrequencies.sort((a, b) => b.count - a.count);

      // Log frequency map
      console.log(`🎯 Meme frequency analysis [source: ${detectionSource}]:`);
      memeFrequencies.forEach((entry, index) => {
        console.log(`  ${index + 1}. ${entry.meme.name}: ${entry.count} matches (${entry.keywords.join(', ')})`);
      });

      const mostCommon = memeFrequencies[0];
      console.log(`✓ Showing most common: ${mostCommon.meme.name} [source: ${detectionSource}]`);
      console.log('⏳ Next detection possible in 30 seconds');
      this.handleDetection(mostCommon.meme, mostCommon.keywords.join(', '), context);
    } else {
      // No matches found - don't play anything
      // Silently continue scanning
    }
  }

  /**
   * Count how many keywords match in the text
   * @param {string} text - Text to search
   * @param {Array} keywords - Keywords to look for
   * @returns {number} Number of matches
   */
  countKeywordMatches(text, keywords) {
    let count = 0;
    for (const keyword of keywords) {
      const searchTerm = keyword.toLowerCase();
      // Count occurrences of this keyword
      const matches = (text.match(new RegExp(searchTerm, 'g')) || []).length;
      count += matches;
    }
    return count;
  }

  /**
   * Get all keywords that match in the text
   * @param {string} text - Text to search
   * @param {Array} keywords - Keywords to look for
   * @returns {Array} Matched keywords
   */
  getMatchedKeywords(text, keywords) {
    const matched = [];
    for (const keyword of keywords) {
      const searchTerm = keyword.toLowerCase();
      if (text.includes(searchTerm)) {
        matched.push(keyword);
      }
    }
    return matched;
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
  handleDetection(meme, matchedKeyword, context = {}) {
    // Update global detection time - starts 30 second cooldown for ALL memes
    this.lastGlobalDetection = Date.now();

    // Trigger callback
    if (this.onDetectionCallback) {
      this.onDetectionCallback(meme, matchedKeyword, context);
    }

    // Report detection to background script for stats
    try {
      chrome.runtime.sendMessage({
        type: 'DETECTION_EVENT',
        memeId: meme.id,
        memeName: meme.name,
        matchedKeyword: matchedKeyword,
        source: context.source || 'page'
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
