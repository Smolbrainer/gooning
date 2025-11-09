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
   * Check if URL is a YouTube URL
   * @param {string} url - URL to check
   * @returns {boolean}
   */
  isYouTubeUrl(url) {
    if (!url) return false;
    return url.includes('youtube.com/') || url.includes('youtu.be/');
  }

  /**
   * Convert YouTube URL to embed URL
   * @param {string} url - YouTube URL
   * @returns {string} Embed URL
   */
  getYouTubeEmbedUrl(url) {
    let videoId = '';
    
    // Handle youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v');
    }
    // Handle youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split(/[?&]/)[0];
    }
    // Handle youtube.com/embed/VIDEO_ID
    else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1].split(/[?&]/)[0];
    }
    
    // Return embed URL with autoplay and sound
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`;
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
      const url = meme.video_url;
      const isGif = url?.toLowerCase().endsWith('.gif');
      const isYouTube = this.isYouTubeUrl(url);
      
      let mediaElement;
      
      if (isYouTube) {
        // Convert YouTube URL to embed URL and create iframe
        const embedUrl = this.getYouTubeEmbedUrl(url);
        mediaElement = `<iframe 
          class="md-video md-youtube" 
          data-video-index="${index}" 
          src="${embedUrl}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>`;
      } else if (isGif) {
        mediaElement = `<img class="md-video md-gif" data-video-index="${index}" src="${url}" alt="${meme.name}">`;
      } else {
        // Regular video file - muted by default to allow autoplay
        // Add preload="auto" to ensure video loads
        mediaElement = `<video class="md-video" data-video-index="${index}" loop playsinline preload="auto" crossorigin="anonymous" muted>
            <source src="${url}" type="video/mp4">
            Your browser does not support the video tag.
          </video>`;
      }
      
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

    // Separate media types
    const actualVideos = this.videos.filter(el => el.tagName === 'VIDEO');
    const gifImages = this.videos.filter(el => el.tagName === 'IMG');
    const youtubeIframes = this.videos.filter(el => el.tagName === 'IFRAME');

    // Video error and play handling (only for actual videos)
    actualVideos.forEach((video, index) => {
      video.addEventListener('error', (e) => {
        console.error('❌ Video playback error for video', index, ':', e);
        console.error('Video source:', video.src);
      });

      video.addEventListener('loadeddata', () => {
        console.log('✅ Video', index, 'loaded successfully');
      });

      video.addEventListener('loadstart', () => {
        console.log('⏳ Video', index, 'started loading...');
      });

      video.addEventListener('canplay', () => {
        console.log('▶️ Video', index, 'can play');
      });

      // Try to load the video
      video.load();
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

    // YouTube iframe handling
    youtubeIframes.forEach((iframe, index) => {
      iframe.addEventListener('load', () => {
        console.log('✅ YouTube iframe', index, 'loaded successfully');
      });

      iframe.addEventListener('error', (e) => {
        console.error('❌ YouTube iframe error for iframe', index, ':', e);
        console.error('YouTube URL:', iframe.src);
      });

      console.log('🎥 YouTube iframe', index, 'URL:', iframe.src);
    });

    // Intersection observer to play/pause videos as they scroll into view
    // Only applies to actual video elements, not GIFs or YouTube (YouTube autoplays via URL params)
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

    // Observe all media elements
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

    console.log('🎬 Showing overlay with', memes.length, 'meme(s)');
    memes.forEach((meme, idx) => {
      console.log(`  ${idx + 1}. ${meme.name}`);
      console.log(`     URL: ${meme.video_url}`);
      console.log(`     Type: ${this.isYouTubeUrl(meme.video_url) ? 'YouTube' : meme.video_url?.endsWith('.gif') ? 'GIF' : 'Video'}`);
    });

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

    // Start playing first video (if it's a video element, not a GIF or YouTube)
    // YouTube iframes autoplay via URL parameters
    if (this.videos.length > 0 && this.videos[0].tagName === 'VIDEO') {
      const video = this.videos[0];
      
      // Wait for video to be ready
      const playVideo = async () => {
        try {
          console.log('▶️ Attempting to play video (muted for autoplay)...');
          // Start muted to allow autoplay
          video.muted = true;
          await video.play();
          console.log('✅ Video playing successfully (muted)');
          
          // Unmute after it starts playing
          // Note: You can comment this out if you want videos to stay muted
          setTimeout(() => {
            video.muted = false;
            console.log('🔊 Video unmuted');
          }, 100);
        } catch (error) {
          console.warn('⚠️ Autoplay blocked or video not ready:', error.message);
          
          // Try again after a short delay
          setTimeout(async () => {
            try {
              console.log('🔄 Retrying video play (muted)...');
              video.muted = true;
              await video.play();
              console.log('✅ Video playing on retry (muted)');
              
              // Try to unmute
              setTimeout(() => {
                video.muted = false;
                console.log('🔊 Video unmuted on retry');
              }, 100);
            } catch (retryError) {
              console.error('❌ Video play failed on retry:', retryError.message);
            }
          }, 500);
        }
      };

      // If video is ready, play immediately, otherwise wait for it
      if (video.readyState >= 2) {
        playVideo();
      } else {
        video.addEventListener('canplay', playVideo, { once: true });
      }
    }

    // Auto-fade after 10 seconds
    setTimeout(() => {
      this.fadeOut();
    }, 10000);

    console.log('✨ Overlay visible');
  }

  /**
   * Fade out the overlay slowly
   */
  fadeOut() {
    if (!this.overlay || !this.isVisible) return;

    // Stop all audio immediately when fade starts
    this.stopAllAudio();

    // Add fade-out class for transition
    this.overlay.classList.add('md-fading-out');

    // After fade completes, hide completely
    setTimeout(() => {
      this.hide();
    }, 2000); // 2 second fade
  }

  /**
   * Stop audio from all media elements
   */
  stopAllAudio() {
    this.videos.forEach(element => {
      if (element.tagName === 'VIDEO') {
        // Mute and pause video elements
        element.muted = true;
        element.pause();
      } else if (element.tagName === 'IFRAME') {
        // For YouTube iframes, we need to remove them to stop audio
        // OR use YouTube API to pause, but removing is simpler
        element.src = '';
      }
    });
  }

  /**
   * Hide overlay
   */
  hide() {
    if (!this.overlay || !this.isVisible) return;

    // Stop all audio and videos
    this.videos.forEach(element => {
      if (element.tagName === 'VIDEO') {
        element.pause();
        element.currentTime = 0;
        element.muted = true;
      } else if (element.tagName === 'IFRAME') {
        // Stop YouTube audio by clearing iframe
        element.src = '';
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
