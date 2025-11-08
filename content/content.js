// Main Content Script
// Coordinates detector and overlay components

(async function() {
  'use strict';

  console.log('Meme Detector content script loaded');

  // Global instances
  let detector = null;
  let overlay = null;
  let selectedMemes = [];
  let settings = null;

  /**
   * Initialize the content script
   */
  async function initialize() {
    try {
      // Check if page is blacklisted
      const isBlacklisted = await checkBlacklist();
      if (isBlacklisted) {
        console.log('Page is blacklisted, skipping detection');
        return;
      }

      // Get settings and selected memes from background
      const data = await getDataFromBackground();

      if (!data.success) {
        console.error('Failed to get data from background:', data.error);
        return;
      }

      settings = data.settings;
      selectedMemes = data.selectedMemes;

      // Initialize overlay
      overlay = new window.MemeOverlay();
      overlay.initialize(settings);
      window.memeOverlay = overlay;

      // Initialize detector
      detector = new window.MemeDetector();
      await detector.initialize(selectedMemes, settings);
      window.memeDetector = detector;

      // Start detection if enabled and memes are selected
      if (settings.enabled && selectedMemes.length > 0) {
        detector.startDetection();
      } else {
        console.log('Detection not started:', {
          enabled: settings.enabled,
          memesCount: selectedMemes.length
        });
      }

      console.log('Meme Detector initialized successfully');
    } catch (error) {
      console.error('Error initializing Meme Detector:', error);
    }
  }

  /**
   * Check if current page is blacklisted
   */
  async function checkBlacklist() {
    try {
      const result = await chrome.storage.sync.get('blacklistedUrls');
      const blacklist = result.blacklistedUrls || [];
      const hostname = window.location.hostname;

      return blacklist.some(url => hostname.includes(url));
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return false;
    }
  }

  /**
   * Get data from background script
   */
  async function getDataFromBackground() {
    try {
      // Get memes and selected memes
      const memesResponse = await chrome.runtime.sendMessage({
        type: 'GET_MEMES'
      });

      if (!memesResponse.success) {
        return {
          success: false,
          error: 'Failed to get memes'
        };
      }

      // Get settings
      const settingsResult = await chrome.storage.sync.get('settings');
      const defaultSettings = {
        enabled: true,
        detectionSensitivity: 0.7,
        autoplay: true,
        overlayPosition: 'bottom-right',
        showNotifications: true,
        detectionCooldown: 30000
      };

      const settings = { ...defaultSettings, ...(settingsResult.settings || {}) };

      // Filter memes to only selected ones
      const allMemes = memesResponse.memes || [];
      const selectedIds = memesResponse.selectedMemes || [];
      const selectedMemes = allMemes.filter(meme => selectedIds.includes(meme.id));

      return {
        success: true,
        settings: settings,
        selectedMemes: selectedMemes,
        allMemes: allMemes
      };
    } catch (error) {
      console.error('Error getting data from background:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Listen for messages from background script
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message.type);

    switch (message.type) {
      case 'SETTINGS_UPDATED':
        handleSettingsUpdate(message.settings);
        sendResponse({ success: true });
        break;

      case 'SELECTED_MEMES_UPDATED':
        handleSelectedMemesUpdate(message.selectedMemes);
        sendResponse({ success: true });
        break;

      case 'STOP_DETECTION':
        if (detector) {
          detector.stopDetection();
        }
        sendResponse({ success: true });
        break;

      case 'START_DETECTION':
        if (detector && settings && settings.enabled) {
          detector.startDetection();
        }
        sendResponse({ success: true });
        break;

      case 'PING':
        sendResponse({ success: true, active: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }

    return false;
  });

  /**
   * Handle settings update
   */
  async function handleSettingsUpdate(newSettings) {
    settings = { ...settings, ...newSettings };

    // Update detector
    if (detector) {
      detector.updateSettings(settings);
    }

    // Update overlay
    if (overlay) {
      overlay.updateSettings(settings);
    }

    console.log('Settings updated:', settings);
  }

  /**
   * Handle selected memes update
   */
  async function handleSelectedMemesUpdate(newSelectedIds) {
    try {
      // Get all memes
      const memesResponse = await chrome.runtime.sendMessage({
        type: 'GET_MEMES'
      });

      if (memesResponse.success) {
        const allMemes = memesResponse.memes || [];
        selectedMemes = allMemes.filter(meme => newSelectedIds.includes(meme.id));

        // Update detector
        if (detector) {
          detector.updateSelectedMemes(selectedMemes);

          // Restart detection if it was running
          if (settings && settings.enabled) {
            detector.stopDetection();
            detector.startDetection();
          }
        }

        console.log('Selected memes updated:', selectedMemes.length);
      }
    } catch (error) {
      console.error('Error updating selected memes:', error);
    }
  }

  /**
   * Handle page visibility changes
   */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, pause detection to save resources
      if (detector) {
        detector.stopDetection();
      }
    } else {
      // Page is visible again, resume detection
      if (detector && settings && settings.enabled && selectedMemes.length > 0) {
        detector.startDetection();
      }
    }
  });

  /**
   * Clean up on page unload
   */
  window.addEventListener('beforeunload', () => {
    if (detector) {
      detector.stopDetection();
    }
    if (overlay) {
      overlay.destroy();
    }
  });

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM is already ready
    initialize();
  }

})();
