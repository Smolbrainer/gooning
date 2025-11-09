// API communication helper for Meme Detector

const API_BASE_URL = 'http://localhost:8000';

const api = {
  /**
   * Fetch all memes from the backend
   * @param {string} category - Optional category filter
   * @returns {Promise<Object[]>} Array of meme objects
   */
  async fetchMemes(category = null) {
    try {
      let url = `${API_BASE_URL}/api/memes`;
      if (category) {
        url += `?category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const memes = await response.json();
      console.log('Fetched memes:', memes.length);
      return memes;
    } catch (error) {
      console.error('Error fetching memes:', error);
      throw error;
    }
  },

  /**
   * Fetch a single meme by ID
   * @param {string} memeId - UUID of the meme
   * @returns {Promise<Object>} Meme object
   */
  async getMemeById(memeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/memes/${memeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const meme = await response.json();
      return meme;
    } catch (error) {
      console.error('Error fetching meme:', error);
      throw error;
    }
  },

  /**
   * Get video URL for a specific meme
   * @param {string} memeId - UUID of the meme
   * @returns {Promise<Object>} Object with video_url, meme_id, and meme_name
   */
  async getVideoUrl(memeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/video/${memeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const videoData = await response.json();
      return videoData;
    } catch (error) {
      console.error('Error fetching video URL:', error);
      throw error;
    }
  },

  /**
   * Check API health
   * @returns {Promise<boolean>} True if API is healthy
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        return false;
      }

      const health = await response.json();
      return health.status === 'healthy';
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  },

  /**
   * Save user selections to backend (optional for MVP)
   * @param {string} userId - User identifier
   * @param {string[]} memeIds - Array of selected meme IDs
   * @param {Object} settings - User settings
   * @returns {Promise<Object>} Updated user selection
   */
  async saveUserSelections(userId, memeIds, settings = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-selections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          meme_ids: memeIds,
          settings: settings
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error saving user selections:', error);
      throw error;
    }
  },

  /**
   * Get user selections from backend (optional for MVP)
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} User selection object
   */
  async getUserSelections(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user-selections/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const selections = await response.json();
      return selections;
    } catch (error) {
      console.error('Error fetching user selections:', error);
      throw error;
    }
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
