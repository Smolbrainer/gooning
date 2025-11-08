// Meme Overlay - Video Display Component

class MemeOverlay {
  constructor() {
    this.overlay = null;
    this.currentMemes = [];
    this.currentIndex = 0;
    this.isVisible = false;
    this.videos = [];
  }

  /**
   * Create overlay HTML and inject into page
   */
  create(memes = []) {
    if (this.overlay) {
      console.log('Overlay already exists');
      return;
    }

    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'meme-detector-overlay';
    this.overlay.className = 'md-overlay md-hidden';

    // Build header
    const header = `
      <div class="md-header">
        <span class="md-meme-name">Detected Memes</span>
        <button class="md-close" title="Close">×</button>
      </div>
    `;

    // Build meme containers for each meme (no UI elements)
    const memeContainers = memes.map((meme, index) => {
      const isGif = meme.video_url?.toLowerCase().endsWith('.gif');
      const mediaElement = isGif
        ? `<img class="md-video md-gif" data-video-index="${index}" src="${meme.video_url}" alt="${meme.name}">`
        : `<video class="md-video" data-video-index="${index}" loop playsinline muted>
            <source src="${meme.video_url}" type="video/mp4">
            Your browser does not support the video tag.
          </video>`;
      
      return `
        <div class="md-container" data-meme-index="${index}">
          ${mediaElement}
        </div>
      `;
    }).join('');

    this.overlay.innerHTML = memeContainers;

    // Inject into page
    document.body.appendChild(this.overlay);

    // Get all video and gif elements
    this.videos = Array.from(this.overlay.querySelectorAll('.md-video'));

    // Set up event listeners
    this.setupEventListeners();

    console.log('Overlay created with', memes.length, 'memes');
  }

  /**
   * Set up event listeners for overlay controls
   */
  setupEventListeners() {
    // No click handlers - overlay will auto-fade

    // Separate videos from GIFs
    const actualVideos = this.videos.filter(el => el.tagName === 'VIDEO');
    const gifImages = this.videos.filter(el => el.tagName === 'IMG');

    // Video error and play handling (only for actual videos)
    actualVideos.forEach((video, index) => {
      video.addEventListener('error', (e) => {
        console.error('Video playback error for video', index, ':', e);
      });

      video.addEventListener('loadeddata', () => {
        console.log('Video', index, 'loaded successfully');
      });
    });

    // GIF error handling
    gifImages.forEach((gif, index) => {
      gif.addEventListener('error', (e) => {
        console.error('GIF loading error for gif', index, ':', e);
      });

      gif.addEventListener('load', () => {
        console.log('GIF', index, 'loaded successfully');
      });
    });

    // Intersection observer to play/pause videos as they scroll into view
    // Only applies to actual video elements, not GIFs
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        if (element.tagName === 'VIDEO') {
          if (entry.isIntersecting) {
            // Video is in view, play it
            element.play().catch(e => console.warn('Autoplay blocked:', e));
          } else {
            // Video is out of view, pause it
            element.pause();
          }
        }
      });
    }, {
      threshold: 0.5 // Play when 50% visible
    });

    // Observe all media elements (videos and gifs)
    this.videos.forEach(element => observer.observe(element));

    // Hide scroll indicator after first scroll
    let hasScrolled = false;
    this.overlay.addEventListener('scroll', () => {
      if (!hasScrolled) {
        const indicator = this.overlay.querySelector('.md-scroll-indicator');
        if (indicator) {
          indicator.style.opacity = '0';
          setTimeout(() => indicator.remove(), 300);
        }
        hasScrolled = true;
      }
    });
  }

  /**
   * Show overlay with meme videos
   * @param {Array|Object} memes - Single meme or array of meme objects
   */
  async show(memes) {
    // Convert single meme to array
    if (!Array.isArray(memes)) {
      memes = [memes];
    }

    if (this.isVisible) {
      // Already showing, hide first
      this.hide();
      // Wait a bit before showing new one
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    this.currentMemes = memes;
    this.currentIndex = 0;

    // Create or recreate overlay with all memes
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    this.create(memes);

    // Show overlay with animation
    this.overlay.classList.remove('md-hidden');
    this.overlay.classList.add('md-visible');
    this.isVisible = true;

    // Start playing first video (if it's a video element, not a GIF)
    if (this.videos.length > 0 && this.videos[0].tagName === 'VIDEO') {
      try {
        await this.videos[0].play();
      } catch (error) {
        console.warn('Autoplay blocked:', error);
      }
    }

    // Auto-fade after 5 seconds
    setTimeout(() => {
      this.fadeOut();
    }, 5000);

    console.log('Showing overlay with', memes.length, 'meme(s)');
  }

  /**
   * Fade out the overlay slowly
   */
  fadeOut() {
    if (!this.overlay || !this.isVisible) return;

    // Add fade-out class for transition
    this.overlay.classList.add('md-fading-out');

    // After fade completes, hide completely
    setTimeout(() => {
      this.hide();
    }, 2000); // 2 second fade
  }

  /**
   * Hide overlay
   */
  hide() {
    if (!this.overlay || !this.isVisible) return;

    // Stop all videos (only actual video elements, not GIFs)
    this.videos.forEach(element => {
      if (element.tagName === 'VIDEO') {
        element.pause();
        element.currentTime = 0;
      }
    });

    // Hide with animation
    this.overlay.classList.remove('md-visible', 'md-fading-out');
    this.overlay.classList.add('md-hidden');
    this.isVisible = false;

    this.currentMemes = [];
    this.currentIndex = 0;

    console.log('Overlay hidden');
  }

  /**
   * Update overlay position
   * @param {string} position - 'top-left', 'top-right', 'bottom-left', 'bottom-right'
   */
  updatePosition(position) {
    this.position = position;

    if (this.overlay) {
      // Remove all position classes
      this.overlay.classList.remove('md-top-left', 'md-top-right', 'md-bottom-left', 'md-bottom-right');

      // Add new position class
      this.overlay.classList.add(`md-${position}`);
    }
  }

  /**
   * Show error message in overlay
   * @param {string} message - Error message
   */
  showError(message) {
    if (!this.overlay) return;

    const container = this.overlay.querySelector('.md-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="md-error">
        <p>${message}</p>
        <button class="md-close-error">Close</button>
      </div>
    `;

    const closeBtn = container.querySelector('.md-close-error');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
  }

  /**
   * Check if overlay is currently visible
   * @returns {boolean}
   */
  isShowing() {
    return this.isVisible;
  }

  /**
   * Destroy overlay and remove from DOM
   */
  destroy() {
    if (this.overlay) {
      this.hide();
      this.overlay.remove();
      this.overlay = null;
      this.video = null;
    }
  }
}

// Make available globally for content script
if (typeof window !== 'undefined') {
  window.MemeOverlay = MemeOverlay;
}
