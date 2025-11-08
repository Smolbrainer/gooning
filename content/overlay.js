// Video Overlay Component
// Displays meme videos on the page

class MemeOverlay {
  constructor() {
    this.overlay = null;
    this.currentMeme = null;
    this.isVisible = false;
    this.settings = null;
    this.video = null;
  }

  /**
   * Initialize the overlay
   */
  initialize(settings) {
    this.settings = settings;
    this.create();
    console.log('Overlay initialized');
  }

  /**
   * Create overlay HTML and inject into page
   */
  create() {
    // Check if overlay already exists
    if (document.getElementById('meme-detector-overlay')) {
      this.overlay = document.getElementById('meme-detector-overlay');
      return;
    }

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'meme-detector-overlay';
    overlay.className = 'md-overlay md-hidden';
    overlay.innerHTML = `
      <div class="md-backdrop"></div>
      <div class="md-container">
        <div class="md-header">
          <span class="md-meme-name"></span>
          <button class="md-close" title="Close">&times;</button>
        </div>
        <div class="md-video-wrapper">
          <video class="md-video" loop playsinline>
            <source src="" type="video/mp4">
            Your browser doesn't support video playback.
          </video>
          <div class="md-loading">Loading...</div>
        </div>
        <div class="md-controls">
          <button class="md-replay" title="Replay">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            Replay
          </button>
          <button class="md-disable" title="Don't show on this page">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
            </svg>
            Disable on this page
          </button>
        </div>
      </div>
    `;

    // Append to body
    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Get references to elements
    this.video = overlay.querySelector('.md-video');
    this.videoSource = overlay.querySelector('.md-video source');
    this.memeName = overlay.querySelector('.md-meme-name');
    this.loading = overlay.querySelector('.md-loading');
    this.container = overlay.querySelector('.md-container');

    // Set up event listeners
    this.setupEventListeners();

    // Apply initial position
    if (this.settings) {
      this.updatePosition(this.settings.overlayPosition);
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Close button
    const closeBtn = this.overlay.querySelector('.md-close');
    closeBtn.addEventListener('click', () => this.hide());

    // Replay button
    const replayBtn = this.overlay.querySelector('.md-replay');
    replayBtn.addEventListener('click', () => this.handleReplay());

    // Disable button
    const disableBtn = this.overlay.querySelector('.md-disable');
    disableBtn.addEventListener('click', () => this.handleDisable());

    // Backdrop click to close
    const backdrop = this.overlay.querySelector('.md-backdrop');
    backdrop.addEventListener('click', () => this.hide());

    // Video events
    this.video.addEventListener('loadstart', () => {
      this.loading.style.display = 'block';
    });

    this.video.addEventListener('canplay', () => {
      this.loading.style.display = 'none';
    });

    this.video.addEventListener('error', (e) => {
      console.error('Video loading error:', e);
      this.loading.textContent = 'Error loading video';
      this.loading.style.color = '#f44336';
    });

    // Prevent clicks on container from closing overlay
    this.container.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Keyboard support (ESC to close)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * Show overlay with a meme
   */
  async show(meme) {
    if (!meme || !meme.video_url) {
      console.error('Invalid meme data:', meme);
      return;
    }

    this.currentMeme = meme;

    // Update meme name
    this.memeName.textContent = meme.name;

    // Set video source
    this.videoSource.src = meme.video_url;
    this.video.load();

    // Show loading
    this.loading.style.display = 'block';
    this.loading.textContent = 'Loading...';
    this.loading.style.color = '#ffffff';

    // Show overlay
    this.overlay.classList.remove('md-hidden');
    this.isVisible = true;

    // Auto-play if enabled
    if (this.settings && this.settings.autoplay) {
      try {
        // Mute for autoplay (browser requirement)
        this.video.muted = true;
        await this.video.play();
      } catch (error) {
        console.error('Autoplay failed:', error);
        // If autoplay fails, unmute and let user click play
        this.video.muted = false;
      }
    }

    // Animate in
    requestAnimationFrame(() => {
      this.container.classList.add('md-show');
    });
  }

  /**
   * Hide overlay
   */
  hide() {
    if (!this.isVisible) {
      return;
    }

    // Animate out
    this.container.classList.remove('md-show');

    // Wait for animation to complete
    setTimeout(() => {
      this.overlay.classList.add('md-hidden');
      this.isVisible = false;

      // Stop video playback
      this.video.pause();
      this.video.currentTime = 0;
      this.currentMeme = null;
    }, 300);
  }

  /**
   * Update overlay position
   */
  updatePosition(position) {
    if (!this.container) {
      return;
    }

    // Remove all position classes
    this.container.classList.remove('md-top-left', 'md-top-right', 'md-bottom-left', 'md-bottom-right');

    // Add new position class
    const positionClass = `md-${position}`;
    this.container.classList.add(positionClass);
  }

  /**
   * Handle replay button click
   */
  handleReplay() {
    this.video.currentTime = 0;
    this.video.play().catch((error) => {
      console.error('Replay failed:', error);
    });
  }

  /**
   * Handle disable button click
   */
  async handleDisable() {
    const currentUrl = window.location.href;

    try {
      // Get current blacklist
      const result = await chrome.storage.sync.get('blacklistedUrls');
      const blacklist = result.blacklistedUrls || [];

      // Add current page to blacklist
      const hostname = window.location.hostname;
      if (!blacklist.includes(hostname)) {
        blacklist.push(hostname);
        await chrome.storage.sync.set({ blacklistedUrls: blacklist });
        console.log('Added to blacklist:', hostname);
      }

      // Hide overlay
      this.hide();

      // Show confirmation
      this.showNotification('Meme detection disabled on this site');

      // Stop detection
      if (window.memeDetector) {
        window.memeDetector.stopDetection();
      }
    } catch (error) {
      console.error('Error adding to blacklist:', error);
    }
  }

  /**
   * Show a temporary notification
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'md-notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    requestAnimationFrame(() => {
      notification.classList.add('md-show');
    });

    // Hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove('md-show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Update settings
   */
  updateSettings(settings) {
    this.settings = settings;
    if (settings.overlayPosition) {
      this.updatePosition(settings.overlayPosition);
    }
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.isVisible = false;
    this.currentMeme = null;
  }
}

// Make overlay available globally
if (typeof window !== 'undefined') {
  window.MemeOverlay = MemeOverlay;
}
