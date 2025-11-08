// Background Service Worker
// Handles API communication, message passing, and lifecycle management

// Import API (note: in MV3, we need to handle imports differently)
// We'll use importScripts or inline the necessary code

const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Initialize extension on install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Meme Detector installed:', details.reason);

  if (details.reason === 'install') {
    // First-time installation
    await initializeExtension();
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
    await handleUpdate();
  }
});

/**
 * Initialize extension with default settings and fetch memes
 */
async function initializeExtension() {
  try {
    // Set default settings if not exists
    const settings = await chrome.storage.sync.get('settings');
    if (!settings.settings) {
      await chrome.storage.sync.set({
        settings: {
          enabled: true,
          detectionSensitivity: 0.7,
          autoplay: true,
          overlayPosition: 'bottom-right',
          showNotifications: true,
          detectionCooldown: 30000
        }
      });
    }

    // Initialize stats
    const stats = await chrome.storage.local.get('stats');
    if (!stats.stats) {
      await chrome.storage.local.set({
        stats: {
          totalDetections: 0,
          detectionsByMeme: {},
          lastDetection: null,
          todayDetections: 0,
          lastResetDate: new Date().toDateString()
        }
      });
    }

    // Fetch memes from API
    await fetchAndCacheMemes();

    console.log('Meme Detector initialized successfully');
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
}

/**
 * Handle extension updates
 */
async function handleUpdate() {
  // Refresh meme cache on update
  await fetchAndCacheMemes();
}

/**
 * Fetch memes from API and cache them
 */
async function fetchAndCacheMemes() {
  try {
    const API_BASE_URL = 'http://localhost:3000/api';

    const response = await fetch(`${API_BASE_URL}/memes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const memes = data.memes || [];

    // Cache the memes
    await chrome.storage.local.set({
      cachedMemes: {
        data: memes,
        timestamp: Date.now(),
        ttl: CACHE_DURATION
      }
    });

    console.log(`Cached ${memes.length} memes`);
    return memes;
  } catch (error) {
    console.error('Error fetching memes:', error);

    // Try to use cached data if fetch fails
    const cached = await chrome.storage.local.get('cachedMemes');
    if (cached.cachedMemes && cached.cachedMemes.data) {
      console.log('Using cached memes data');
      return cached.cachedMemes.data;
    }

    return [];
  }
}

/**
 * Get memes (from cache if fresh, otherwise fetch)
 */
async function getMemes() {
  const cached = await chrome.storage.local.get('cachedMemes');

  if (cached.cachedMemes) {
    const { data, timestamp, ttl } = cached.cachedMemes;
    const age = Date.now() - timestamp;

    // If cache is still fresh, use it
    if (age < ttl) {
      return data;
    }
  }

  // Cache expired or doesn't exist, fetch new data
  return await fetchAndCacheMemes();
}

/**
 * Listen for messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);

  switch (message.type) {
    case 'GET_MEMES':
      handleGetMemes(sendResponse);
      return true; // Keep channel open for async response

    case 'UPDATE_SETTINGS':
      handleUpdateSettings(message.settings, sendResponse);
      return true;

    case 'DETECTION_EVENT':
      handleDetectionEvent(message.data, sender);
      sendResponse({ success: true });
      return false;

    case 'GET_STATS':
      handleGetStats(sendResponse);
      return true;

    case 'HEALTH_CHECK':
      handleHealthCheck(sendResponse);
      return true;

    case 'REFRESH_MEMES':
      handleRefreshMemes(sendResponse);
      return true;

    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
      return false;
  }
});

/**
 * Handle get memes request
 */
async function handleGetMemes(sendResponse) {
  try {
    const memes = await getMemes();
    const selectedMemes = await chrome.storage.sync.get('selectedMemes');

    sendResponse({
      success: true,
      memes: memes,
      selectedMemes: selectedMemes.selectedMemes || []
    });
  } catch (error) {
    console.error('Error handling get memes:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handle update settings request
 */
async function handleUpdateSettings(settings, sendResponse) {
  try {
    const current = await chrome.storage.sync.get('settings');
    const updated = { ...(current.settings || {}), ...settings };

    await chrome.storage.sync.set({ settings: updated });

    // Notify all content scripts of settings change
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'SETTINGS_UPDATED',
          settings: updated
        });
      } catch (error) {
        // Tab might not have content script injected, ignore
      }
    }

    sendResponse({ success: true, settings: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle detection event from content script
 */
async function handleDetectionEvent(data, sender) {
  try {
    const { memeId, memeName, url } = data;

    // Update statistics
    const stats = await chrome.storage.local.get('stats');
    const currentStats = stats.stats || {
      totalDetections: 0,
      detectionsByMeme: {},
      todayDetections: 0,
      lastResetDate: new Date().toDateString()
    };

    const today = new Date().toDateString();

    // Reset daily counter if new day
    if (currentStats.lastResetDate !== today) {
      currentStats.todayDetections = 0;
      currentStats.lastResetDate = today;
    }

    currentStats.totalDetections += 1;
    currentStats.todayDetections += 1;
    currentStats.lastDetection = {
      memeId,
      memeName,
      timestamp: Date.now(),
      url: url || sender.url
    };

    if (!currentStats.detectionsByMeme[memeId]) {
      currentStats.detectionsByMeme[memeId] = {
        count: 0,
        name: memeName,
        lastDetected: null
      };
    }

    currentStats.detectionsByMeme[memeId].count += 1;
    currentStats.detectionsByMeme[memeId].lastDetected = Date.now();

    await chrome.storage.local.set({ stats: currentStats });

    console.log('Detection event logged:', memeName);
  } catch (error) {
    console.error('Error handling detection event:', error);
  }
}

/**
 * Handle get stats request
 */
async function handleGetStats(sendResponse) {
  try {
    const stats = await chrome.storage.local.get('stats');
    sendResponse({
      success: true,
      stats: stats.stats || {}
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handle health check request
 */
async function handleHealthCheck(sendResponse) {
  try {
    const API_BASE_URL = 'http://localhost:3000/api';
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET'
    });

    sendResponse({
      success: response.ok,
      status: response.status
    });
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Handle refresh memes request
 */
async function handleRefreshMemes(sendResponse) {
  try {
    const memes = await fetchAndCacheMemes();
    sendResponse({
      success: true,
      memes: memes
    });
  } catch (error) {
    console.error('Error refreshing memes:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Listen for storage changes and notify content scripts
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log('Storage changed:', Object.keys(changes), 'in', areaName);

  // If selected memes changed, notify content scripts
  if (changes.selectedMemes) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'SELECTED_MEMES_UPDATED',
          selectedMemes: changes.selectedMemes.newValue || []
        }).catch(() => {
          // Ignore errors for tabs without content script
        });
      });
    });
  }
});

/**
 * Periodic cache refresh (every hour)
 */
chrome.alarms.create('refreshCache', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshCache') {
    console.log('Refreshing meme cache...');
    fetchAndCacheMemes();
  }
});

console.log('Meme Detector background service worker loaded');
