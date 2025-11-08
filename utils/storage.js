// Storage utility for Chrome Storage API
// Handles all persistent data for the extension

const STORAGE_KEYS = {
  SELECTED_MEMES: 'selectedMemes',
  SETTINGS: 'settings',
  STATS: 'stats',
  BLACKLISTED_URLS: 'blacklistedUrls',
  CACHED_MEMES: 'cachedMemes'
};

const DEFAULT_SETTINGS = {
  enabled: true,
  detectionSensitivity: 0.7, // 0-1 scale
  autoplay: true,
  overlayPosition: 'bottom-right',
  showNotifications: true,
  detectionCooldown: 30000 // 30 seconds between same meme detections
};

const storage = {
  /**
   * Get selected meme IDs
   * @returns {Promise<Array<string>>}
   */
  async getSelectedMemes() {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEYS.SELECTED_MEMES);
      return result[STORAGE_KEYS.SELECTED_MEMES] || [];
    } catch (error) {
      console.error('Error getting selected memes:', error);
      return [];
    }
  },

  /**
   * Set selected meme IDs
   * @param {Array<string>} memeIds
   */
  async setSelectedMemes(memeIds) {
    try {
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SELECTED_MEMES]: memeIds
      });
      return true;
    } catch (error) {
      console.error('Error setting selected memes:', error);
      return false;
    }
  },

  /**
   * Add a meme to selected list
   * @param {string} memeId
   */
  async addSelectedMeme(memeId) {
    const selected = await this.getSelectedMemes();
    if (!selected.includes(memeId)) {
      selected.push(memeId);
      await this.setSelectedMemes(selected);
    }
  },

  /**
   * Remove a meme from selected list
   * @param {string} memeId
   */
  async removeSelectedMeme(memeId) {
    const selected = await this.getSelectedMemes();
    const filtered = selected.filter(id => id !== memeId);
    await this.setSelectedMemes(filtered);
  },

  /**
   * Get user settings
   * @returns {Promise<Object>}
   */
  async getSettings() {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) };
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Update user settings
   * @param {Object} settings
   */
  async updateSettings(settings) {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: updated
      });
      return updated;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  },

  /**
   * Get detection statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.STATS);
      return result[STORAGE_KEYS.STATS] || {
        totalDetections: 0,
        detectionsByMeme: {},
        lastDetection: null,
        todayDetections: 0,
        lastResetDate: new Date().toDateString()
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {};
    }
  },

  /**
   * Increment detection count for a meme
   * @param {string} memeId
   * @param {string} memeName
   */
  async incrementDetectionCount(memeId, memeName = '') {
    try {
      const stats = await this.getStats();
      const today = new Date().toDateString();

      // Reset daily counter if it's a new day
      if (stats.lastResetDate !== today) {
        stats.todayDetections = 0;
        stats.lastResetDate = today;
      }

      stats.totalDetections = (stats.totalDetections || 0) + 1;
      stats.todayDetections = (stats.todayDetections || 0) + 1;
      stats.lastDetection = {
        memeId,
        memeName,
        timestamp: Date.now()
      };

      if (!stats.detectionsByMeme) {
        stats.detectionsByMeme = {};
      }

      if (!stats.detectionsByMeme[memeId]) {
        stats.detectionsByMeme[memeId] = {
          count: 0,
          name: memeName,
          lastDetected: null
        };
      }

      stats.detectionsByMeme[memeId].count += 1;
      stats.detectionsByMeme[memeId].lastDetected = Date.now();

      await chrome.storage.local.set({
        [STORAGE_KEYS.STATS]: stats
      });

      return stats;
    } catch (error) {
      console.error('Error incrementing detection count:', error);
      return null;
    }
  },

  /**
   * Get blacklisted URLs
   * @returns {Promise<Array<string>>}
   */
  async getBlacklistedUrls() {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEYS.BLACKLISTED_URLS);
      return result[STORAGE_KEYS.BLACKLISTED_URLS] || [];
    } catch (error) {
      console.error('Error getting blacklisted URLs:', error);
      return [];
    }
  },

  /**
   * Add URL to blacklist
   * @param {string} url
   */
  async addToBlacklist(url) {
    try {
      const blacklist = await this.getBlacklistedUrls();
      if (!blacklist.includes(url)) {
        blacklist.push(url);
        await chrome.storage.sync.set({
          [STORAGE_KEYS.BLACKLISTED_URLS]: blacklist
        });
      }
      return true;
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      return false;
    }
  },

  /**
   * Check if current URL is blacklisted
   * @param {string} url
   * @returns {Promise<boolean>}
   */
  async isBlacklisted(url) {
    const blacklist = await this.getBlacklistedUrls();
    return blacklist.some(blacklistedUrl => url.includes(blacklistedUrl));
  },

  /**
   * Get cached memes data
   * @returns {Promise<Array>}
   */
  async getCachedMemes() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.CACHED_MEMES);
      return result[STORAGE_KEYS.CACHED_MEMES] || null;
    } catch (error) {
      console.error('Error getting cached memes:', error);
      return null;
    }
  },

  /**
   * Cache memes data
   * @param {Array} memes
   * @param {number} ttl - Time to live in milliseconds
   */
  async cacheMemes(memes, ttl = 3600000) {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.CACHED_MEMES]: {
          data: memes,
          timestamp: Date.now(),
          ttl
        }
      });
      return true;
    } catch (error) {
      console.error('Error caching memes:', error);
      return false;
    }
  },

  /**
   * Clear all extension data
   */
  async clearAll() {
    try {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = storage;
}
