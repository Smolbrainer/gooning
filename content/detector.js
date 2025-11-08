// Meme Detector Module
// Handles meme detection logic for page content

class MemeDetector {
  constructor() {
    this.selectedMemes = [];
    this.settings = null;
    this.isDetecting = false;
    this.detectionInterval = null;
    this.lastDetections = new Map(); // Track last detection time per meme
    this.observer = null;
    this.pageContent = { text: '', images: [] };
  }

  /**
   * Initialize detector with memes and settings
   */
  async initialize(selectedMemes, settings) {
    this.selectedMemes = selectedMemes;
    this.settings = settings;
    console.log('Detector initialized with', selectedMemes.length, 'selected memes');
  }

  /**
   * Start detection process
   */
  startDetection() {
    if (this.isDetecting) {
      console.log('Detection already running');
      return;
    }

    if (!this.settings || !this.settings.enabled) {
      console.log('Detection disabled in settings');
      return;
    }

    if (this.selectedMemes.length === 0) {
      console.log('No memes selected for detection');
      return;
    }

    console.log('Starting meme detection...');
    this.isDetecting = true;

    // Initial scan
    this.performScan();

    // Set up mutation observer for dynamic content
    this.setupMutationObserver();

    // Periodic scanning (every 3 seconds)
    this.detectionInterval = setInterval(() => {
      this.performScan();
    }, 3000);
  }

  /**
   * Stop detection process
   */
  stopDetection() {
    console.log('Stopping meme detection...');
    this.isDetecting = false;

    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Set up mutation observer for dynamic content changes
   */
  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      // Debounce: only scan if significant changes
      let shouldScan = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if added nodes contain text or images
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.textContent.length > 10 || node.querySelector('img')) {
                shouldScan = true;
                break;
              }
            }
          }
        }
      }

      if (shouldScan) {
        // Debounced scan
        this.debouncedScan();
      }
    });

    // Observe the entire document body
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Debounced scan function
   */
  debouncedScan = (() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => this.performScan(), 500);
    };
  })();

  /**
   * Perform a detection scan
   */
  async performScan() {
    try {
      // Extract page content
      this.pageContent = this.scanPageContent();

      // Detect memes
      const matches = await this.detectMemes(this.pageContent);

      // Handle detections
      for (const match of matches) {
        this.handleDetection(match);
      }
    } catch (error) {
      console.error('Error during detection scan:', error);
    }
  }

  /**
   * Extract text and images from page
   */
  scanPageContent() {
    const content = {
      text: '',
      images: []
    };

    try {
      // Get visible text content
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, article, section');
      const texts = [];

      textElements.forEach((el) => {
        // Only get text from visible elements
        if (this.isElementVisible(el)) {
          const text = el.textContent.trim();
          if (text.length > 0) {
            texts.push(text);
          }
        }
      });

      // Limit to first 10,000 characters for performance
      content.text = texts.join(' ').substring(0, 10000).toLowerCase();

      // Get visible images
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (this.isElementVisible(img) && img.src) {
          content.images.push(img.src);
        }
      });

      // Limit to first 20 images
      content.images = content.images.slice(0, 20);

    } catch (error) {
      console.error('Error scanning page content:', error);
    }

    return content;
  }

  /**
   * Check if element is visible
   */
  isElementVisible(element) {
    if (!element || !element.offsetParent) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }

  /**
   * Detect memes in content
   */
  async detectMemes(content) {
    const matches = [];

    for (const meme of this.selectedMemes) {
      // Check cooldown
      if (this.isOnCooldown(meme.id)) {
        continue;
      }

      // Text-based detection
      const textMatch = this.analyzeText(content.text, meme.keywords || []);

      if (textMatch.matched && textMatch.confidence >= this.settings.detectionSensitivity) {
        matches.push({
          meme: meme,
          confidence: textMatch.confidence,
          matchType: 'text'
        });
      }
    }

    return matches;
  }

  /**
   * Analyze text for meme keywords
   */
  analyzeText(text, keywords) {
    if (!keywords || keywords.length === 0) {
      return { matched: false, confidence: 0 };
    }

    let matchCount = 0;
    let maxConfidence = 0;

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();

      // Exact match (highest confidence)
      if (text.includes(lowerKeyword)) {
        matchCount++;
        maxConfidence = Math.max(maxConfidence, 1.0);
        continue;
      }

      // Fuzzy match (word boundary check)
      const words = text.split(/\s+/);
      for (const word of words) {
        const similarity = this.calculateSimilarity(word, lowerKeyword);
        if (similarity > 0.8) {
          matchCount++;
          maxConfidence = Math.max(maxConfidence, similarity);
          break;
        }
      }
    }

    // Calculate overall confidence based on match ratio
    const matchRatio = matchCount / keywords.length;
    const confidence = Math.min(maxConfidence * matchRatio * 1.2, 1.0);

    return {
      matched: matchCount > 0,
      confidence: confidence
    };
  }

  /**
   * Calculate string similarity (Levenshtein-based)
   */
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0 || len2 === 0) {
      return 0;
    }

    // Quick check for exact match
    if (str1 === str2) {
      return 1.0;
    }

    // Simple character overlap ratio
    const chars1 = new Set(str1);
    const chars2 = new Set(str2);
    const intersection = new Set([...chars1].filter(x => chars2.has(x)));

    const overlapRatio = (intersection.size * 2) / (chars1.size + chars2.size);

    // Length similarity
    const lengthSimilarity = 1 - Math.abs(len1 - len2) / Math.max(len1, len2);

    // Combined score
    return (overlapRatio + lengthSimilarity) / 2;
  }

  /**
   * Check if meme is on cooldown
   */
  isOnCooldown(memeId) {
    const lastDetection = this.lastDetections.get(memeId);
    if (!lastDetection) {
      return false;
    }

    const cooldown = this.settings.detectionCooldown || 30000;
    const timeSinceDetection = Date.now() - lastDetection;

    return timeSinceDetection < cooldown;
  }

  /**
   * Handle a meme detection
   */
  handleDetection(match) {
    const { meme, confidence } = match;

    console.log(`Meme detected: ${meme.name} (confidence: ${confidence.toFixed(2)})`);

    // Update last detection time
    this.lastDetections.set(meme.id, Date.now());

    // Trigger overlay display
    if (window.memeOverlay) {
      window.memeOverlay.show(meme);
    }

    // Send detection event to background
    chrome.runtime.sendMessage({
      type: 'DETECTION_EVENT',
      data: {
        memeId: meme.id,
        memeName: meme.name,
        confidence: confidence,
        url: window.location.href
      }
    }).catch((error) => {
      console.error('Error sending detection event:', error);
    });
  }

  /**
   * Update selected memes
   */
  updateSelectedMemes(memes) {
    this.selectedMemes = memes;
    console.log('Updated selected memes:', memes.length);
  }

  /**
   * Update settings
   */
  updateSettings(settings) {
    this.settings = settings;

    if (!settings.enabled && this.isDetecting) {
      this.stopDetection();
    } else if (settings.enabled && !this.isDetecting) {
      this.startDetection();
    }
  }
}

// Make detector available globally
if (typeof window !== 'undefined') {
  window.MemeDetector = MemeDetector;
}
