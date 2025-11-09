// Chrome Storage API wrapper for Meme Detector

const storage = {
  /**
   * Get selected meme IDs from storage
   * @returns {Promise<string[]>} Array of meme IDs
   */
  async getSelectedMemes() {
    try {
      const result = await chrome.storage.local.get(['selectedMemes']);
      return result.selectedMemes || [];
    } catch (error) {
      console.error('Error getting selected memes:', error);
      return [];
    }
  },

  /**
   * Save selected meme IDs to storage
   * @param {string[]} memeIds - Array of meme IDs
   */
  async setSelectedMemes(memeIds) {
    try {
      await chrome.storage.local.set({ selectedMemes: memeIds });
      console.log('Selected memes saved:', memeIds);
    } catch (error) {
      console.error('Error saving selected memes:', error);
    }
  },

  /**
   * Get all memes data from cache
   * @returns {Promise<Object[]>} Array of meme objects
   */
  async getAllMemes() {
    try {
      const result = await chrome.storage.local.get(['allMemes']);
      return result.allMemes || [];
    } catch (error) {
      console.error('Error getting all memes:', error);
      return [];
    }
  },

  /**
   * Cache all memes data
   * @param {Object[]} memes - Array of meme objects
   */
  async setAllMemes(memes) {
    try {
      await chrome.storage.local.set({ allMemes: memes });
      console.log('Memes cached:', memes.length);
    } catch (error) {
      console.error('Error caching memes:', error);
    }
  },

  /**
   * Get user settings
   * @returns {Promise<Object>} Settings object
   */
  async getSettings() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      return result.settings || {
        enabled: true,
        autoplay: true,
        position: 'bottom-right'
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return { enabled: true, autoplay: true, position: 'bottom-right' };
    }
  },

  /**
   * Update user settings
   * @param {Object} settings - Settings object
   */
  async updateSettings(settings) {
    try {
      await chrome.storage.local.set({ settings });
      console.log('Settings updated:', settings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  },

  /**
   * Get detection statistics
   * @returns {Promise<Object>} Stats object with detection counts
   */
  async getStats() {
    try {
      const result = await chrome.storage.local.get(['stats']);
      return result.stats || { totalDetections: 0, memeDetections: {} };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { totalDetections: 0, memeDetections: {} };
    }
  },

  /**
   * Increment detection count for a meme
   * @param {string} memeId - Meme ID
   */
  async incrementDetectionCount(memeId) {
    try {
      const stats = await this.getStats();
      stats.totalDetections = (stats.totalDetections || 0) + 1;
      stats.memeDetections[memeId] = (stats.memeDetections[memeId] || 0) + 1;
      await chrome.storage.local.set({ stats });
    } catch (error) {
      console.error('Error incrementing detection count:', error);
    }
  },

  /**
   * Get extension enabled state
   * @returns {Promise<boolean>}
   */
  async isEnabled() {
    try {
      const settings = await this.getSettings();
      return settings.enabled !== false;
    } catch (error) {
      console.error('Error checking enabled state:', error);
      return true;
    }
  },

  /**
   * Set extension enabled state
   * @param {boolean} enabled
   */
  async setEnabled(enabled) {
    try {
      const settings = await this.getSettings();
      settings.enabled = enabled;
      await this.updateSettings(settings);
    } catch (error) {
      console.error('Error setting enabled state:', error);
    }
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = storage;
}
