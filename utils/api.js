// API communication utility
// Handles all backend API requests

// Configure your backend API URL here
const API_BASE_URL = 'http://localhost:3000/api';

// API request timeout (10 seconds)
const REQUEST_TIMEOUT = 10000;

const api = {
  /**
   * Generic fetch wrapper with timeout and error handling
   * @param {string} endpoint
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error('API request timeout:', endpoint);
        return { success: false, error: 'Request timeout' };
      }

      console.error('API request failed:', endpoint, error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Fetch all available memes from backend
   * @returns {Promise<Object>}
   */
  async fetchMemes() {
    try {
      const result = await this.request('/memes');

      if (result.success) {
        return {
          success: true,
          memes: result.data.memes || []
        };
      }

      return {
        success: false,
        error: result.error,
        memes: []
      };
    } catch (error) {
      console.error('Error fetching memes:', error);
      return {
        success: false,
        error: error.message,
        memes: []
      };
    }
  },

  /**
   * Get a specific meme by ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getMemeById(id) {
    try {
      const result = await this.request(`/memes/${id}`);

      if (result.success) {
        return {
          success: true,
          meme: result.data.meme
        };
      }

      return {
        success: false,
        error: result.error,
        meme: null
      };
    } catch (error) {
      console.error('Error fetching meme:', error);
      return {
        success: false,
        error: error.message,
        meme: null
      };
    }
  },

  /**
   * Get video URL for a meme
   * @param {string} memeId
   * @returns {Promise<Object>}
   */
  async getVideoUrl(memeId) {
    try {
      const result = await this.request(`/video/${memeId}`);

      if (result.success) {
        return {
          success: true,
          videoUrl: result.data.videoUrl,
          metadata: result.data.metadata
        };
      }

      return {
        success: false,
        error: result.error,
        videoUrl: null
      };
    } catch (error) {
      console.error('Error fetching video URL:', error);
      return {
        success: false,
        error: error.message,
        videoUrl: null
      };
    }
  },

  /**
   * Send detection request to backend
   * @param {Object} content - { text: string, imageUrls: Array<string> }
   * @returns {Promise<Object>}
   */
  async sendDetectionRequest(content) {
    try {
      const result = await this.request('/detect', {
        method: 'POST',
        body: JSON.stringify({
          content: content.text || '',
          imageUrls: content.imageUrls || []
        })
      });

      if (result.success) {
        return {
          success: true,
          matches: result.data.matches || []
        };
      }

      return {
        success: false,
        error: result.error,
        matches: []
      };
    } catch (error) {
      console.error('Error sending detection request:', error);
      return {
        success: false,
        error: error.message,
        matches: []
      };
    }
  },

  /**
   * Health check to verify API connection
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const result = await this.request('/health');
      return result.success;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  },

  /**
   * Update the API base URL
   * @param {string} url
   */
  setBaseUrl(url) {
    API_BASE_URL = url;
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
