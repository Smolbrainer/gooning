// Background Service Worker for Meme Detector Extension

const API_BASE_URL = 'http://localhost:8000';

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Meme Detector extension installed:', details.reason);

  if (details.reason === 'install') {
    // First time install - set defaults
    await initializeExtension();
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('Extension updated');
  }
});

// Initialize extension data
async function initializeExtension() {
  console.log('Initializing Meme Detector...');

  try {
    // Set default settings
    const defaultSettings = {
      enabled: true,
      autoplay: true,
      position: 'bottom-right'
    };

    await chrome.storage.local.set({
      settings: defaultSettings,
      selectedMemes: [],
      stats: { totalDetections: 0, memeDetections: {} }
    });

    // Fetch memes from API and cache them
    await fetchAndCacheMemes();

    console.log('Initialization complete');
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
}

// Fetch memes from API and cache them
async function fetchAndCacheMemes() {
  try {
    console.log('Fetching memes from API...');
    const response = await fetch(`${API_BASE_URL}/api/memes`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const memes = await response.json();
    console.log(`Fetched ${memes.length} memes from API`);

    // Cache memes in local storage
    await chrome.storage.local.set({ allMemes: memes });

    return memes;
  } catch (error) {
    console.error('Error fetching memes:', error);
    // Return empty array if API is not available
    return [];
  }
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);

  if (message.type === 'FETCH_MEMES') {
    // Popup requesting fresh memes
    fetchAndCacheMemes()
      .then(memes => sendResponse({ success: true, memes }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'GET_SELECTED_MEMES') {
    // Content script requesting selected memes
    chrome.storage.local.get(['selectedMemes', 'allMemes'], (result) => {
      const selectedIds = result.selectedMemes || [];
      const allMemes = result.allMemes || [];
      const selectedMemes = allMemes.filter(m => selectedIds.includes(m.id));
      sendResponse({ memes: selectedMemes });
    });
    return true;
  }

  if (message.type === 'DETECTION_EVENT') {
    // Content script reporting a detection
    handleDetectionEvent(message.memeId, message.memeName, sender.tab?.url);
    sendResponse({ success: true });
  }

  if (message.type === 'CHECK_API_HEALTH') {
    // Check if API is available
    fetch(`${API_BASE_URL}/health`)
      .then(response => response.ok)
      .then(healthy => sendResponse({ healthy }))
      .catch(() => sendResponse({ healthy: false }));
    return true;
  }

  if (message.type === 'CLOSE_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      const activeTab = tabs && tabs[0];
      if (!activeTab || activeTab.id === undefined) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }

      chrome.tabs.remove(activeTab.id, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
      });
    });

    return true; // Asynchronous response
  }
});

// Handle detection event
async function handleDetectionEvent(memeId, memeName, pageUrl) {
  try {
    // Update stats
    const result = await chrome.storage.local.get(['stats']);
    const stats = result.stats || { totalDetections: 0, memeDetections: {} };

    stats.totalDetections = (stats.totalDetections || 0) + 1;
    stats.memeDetections[memeId] = (stats.memeDetections[memeId] || 0) + 1;

    await chrome.storage.local.set({ stats });

    console.log(`Detection logged: ${memeName} on ${pageUrl}`);
  } catch (error) {
    console.error('Error handling detection event:', error);
  }
}

// Periodic refresh of memes (every 30 minutes)
if (chrome.alarms) {
  chrome.alarms.create('refreshMemes', { periodInMinutes: 30 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'refreshMemes') {
      console.log('Refreshing memes from API...');
      fetchAndCacheMemes();
    }
  });
} else {
  console.warn('chrome.alarms API not available - periodic refresh disabled');
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.selectedMemes) {
      console.log('Selected memes updated:', changes.selectedMemes.newValue);
    }
    if (changes.settings) {
      console.log('Settings updated:', changes.settings.newValue);
    }
  }
});

console.log('Meme Detector service worker loaded');
