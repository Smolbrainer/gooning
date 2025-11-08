// Main Content Script for Meme Detector

(async function() {
  console.log('Meme Detector content script loaded');

  let detector = null;
  let overlay = null;
  let mutationObserver = null;
  let isEnabled = true;

  /**
   * Initialize the content script
   */
  async function init() {
    try {
      // Check if extension is enabled
      const settings = await chrome.storage.local.get(['settings']);
      isEnabled = settings.settings?.enabled !== false;

      if (!isEnabled) {
        console.log('Meme Detector is disabled');
        return;
      }

      // Get selected memes from storage
      const result = await chrome.storage.local.get(['selectedMemes', 'allMemes']);
      const selectedIds = result.selectedMemes || [];
      const allMemes = result.allMemes || [];

      if (selectedIds.length === 0) {
        console.log('No memes selected for detection');
        return;
      }

      // Filter to get only selected memes
      const selectedMemes = allMemes.filter(meme => selectedIds.includes(meme.id));

      if (selectedMemes.length === 0) {
        console.log('No meme data available');
        return;
      }

      console.log(`Initializing detector with ${selectedMemes.length} memes`);

      // Create detector
      detector = new window.MemeDetector(selectedMemes);

      // Create overlay (will be created on first show)
      overlay = new window.MemeOverlay();

      // Set up detection callback
      detector.onDetection((meme, matchedKeyword) => {
        console.log('Meme detected:', meme.name, '(keyword:', matchedKeyword + ')');
        overlay.show(meme);
      });

      // Start detection
      detector.startDetection();

      // Set up mutation observer for dynamic content
      setupMutationObserver();

      console.log('Meme Detector initialized successfully');
    } catch (error) {
      console.error('Error initializing Meme Detector:', error);
    }
  }

  /**
   * Set up MutationObserver to detect dynamic content changes
   */
  function setupMutationObserver() {
    if (mutationObserver) return;

    mutationObserver = new MutationObserver((mutations) => {
      // Check if there are significant changes
      const hasSignificantChanges = mutations.some(mutation => {
        return mutation.addedNodes.length > 0 ||
               mutation.removedNodes.length > 0 ||
               mutation.type === 'characterData';
      });

      if (hasSignificantChanges && detector) {
        // Debounce: scan after changes settle
        debounce(() => {
          detector.scanPage();
        }, 500);
      }
    });

    // Observe document body for changes
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    console.log('MutationObserver set up');
  }

  /**
   * Debounce function to limit execution frequency
   */
  let debounceTimer;
  function debounce(func, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
  }

  /**
   * Clean up resources
   */
  function cleanup() {
    if (detector) {
      detector.stopDetection();
      detector = null;
    }

    if (overlay) {
      overlay.destroy();
      overlay = null;
    }

    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }

    console.log('Cleaned up Meme Detector');
  }

  /**
   * Handle messages from popup or background script
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message.type);

    if (message.type === 'MEMES_UPDATED') {
      // User changed meme selection in popup
      console.log('Memes updated, reinitializing...');
      cleanup();

      // Reinitialize with new selection
      setTimeout(() => {
        init();
      }, 100);

      sendResponse({ success: true });
    }

    if (message.type === 'ENABLED_CHANGED') {
      // Extension enabled/disabled
      isEnabled = message.enabled;

      if (isEnabled) {
        console.log('Extension enabled, starting detection...');
        init();
      } else {
        console.log('Extension disabled, stopping detection...');
        cleanup();
      }

      sendResponse({ success: true });
    }

    if (message.type === 'PING') {
      // Health check
      sendResponse({
        active: detector?.isActive() || false,
        memesCount: detector?.memes?.length || 0
      });
    }
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.selectedMemes || changes.settings) {
        console.log('Storage changed, reinitializing...');
        cleanup();
        setTimeout(() => init(), 100);
      }
    }
  });

  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Page already loaded
    init();
  }

  // Clean up on page unload
  window.addEventListener('beforeunload', cleanup);

})();
