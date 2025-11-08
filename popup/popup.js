// Popup Script
// Handles popup UI interactions and communication with background script

(function() {
  'use strict';

  // State
  let allMemes = [];
  let selectedMemes = [];
  let settings = {};
  let currentCategory = 'all';
  let searchQuery = '';

  // DOM Elements
  const enableToggle = document.getElementById('enableToggle');
  const settingsBtn = document.getElementById('settingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const searchInput = document.getElementById('searchInput');
  const tabs = document.querySelectorAll('.tab');
  const memeLibrary = document.getElementById('memeLibrary');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const selectTrendingBtn = document.getElementById('selectTrendingBtn');
  const selectedCount = document.getElementById('selectedCount');
  const statsText = document.getElementById('statsText');
  const feedbackLink = document.getElementById('feedbackLink');

  // Settings elements
  const sensitivitySlider = document.getElementById('sensitivitySlider');
  const sensitivityValue = document.getElementById('sensitivityValue');
  const autoplayToggle = document.getElementById('autoplayToggle');
  const notificationsToggle = document.getElementById('notificationsToggle');
  const positionBtns = document.querySelectorAll('.position-btn');
  const apiStatusIndicator = document.getElementById('apiStatusIndicator');
  const apiStatusText = document.getElementById('apiStatusText');
  const refreshApiBtn = document.getElementById('refreshApiBtn');

  /**
   * Initialize popup
   */
  async function initialize() {
    try {
      // Load data from background
      await loadData();

      // Set up event listeners
      setupEventListeners();

      // Update UI
      updateUI();

      // Check API health
      checkApiHealth();

      console.log('Popup initialized');
    } catch (error) {
      console.error('Error initializing popup:', error);
      showError('Failed to initialize extension');
    }
  }

  /**
   * Load data from background script
   */
  async function loadData() {
    try {
      // Get memes and settings
      const [memesResponse, settingsResult, statsResult] = await Promise.all([
        chrome.runtime.sendMessage({ type: 'GET_MEMES' }),
        chrome.storage.sync.get('settings'),
        chrome.runtime.sendMessage({ type: 'GET_STATS' })
      ]);

      if (memesResponse.success) {
        allMemes = memesResponse.memes || [];
        selectedMemes = memesResponse.selectedMemes || [];
      } else {
        throw new Error('Failed to load memes');
      }

      // Load settings
      const defaultSettings = {
        enabled: true,
        detectionSensitivity: 0.7,
        autoplay: true,
        overlayPosition: 'bottom-right',
        showNotifications: true,
        detectionCooldown: 30000
      };

      settings = { ...defaultSettings, ...(settingsResult.settings || {}) };

      // Update stats
      if (statsResult.success) {
        const stats = statsResult.stats || {};
        const todayDetections = stats.todayDetections || 0;
        statsText.textContent = `${todayDetections} detection${todayDetections !== 1 ? 's' : ''} today`;
      }

    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Header controls
    enableToggle.addEventListener('change', handleEnableToggle);
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);

    // Search
    searchInput.addEventListener('input', handleSearch);

    // Tabs
    tabs.forEach(tab => {
      tab.addEventListener('click', () => handleTabChange(tab.dataset.category));
    });

    // Quick actions
    clearAllBtn.addEventListener('click', handleClearAll);
    selectTrendingBtn.addEventListener('click', handleSelectTrending);

    // Settings
    sensitivitySlider.addEventListener('input', handleSensitivityChange);
    autoplayToggle.addEventListener('change', handleAutoplayToggle);
    notificationsToggle.addEventListener('change', handleNotificationsToggle);
    positionBtns.forEach(btn => {
      btn.addEventListener('click', () => handlePositionChange(btn.dataset.position));
    });
    refreshApiBtn.addEventListener('click', checkApiHealth);

    // Feedback link
    feedbackLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/yourusername/meme-detector/issues' });
    });
  }

  /**
   * Update UI based on current state
   */
  function updateUI() {
    // Update enable toggle
    enableToggle.checked = settings.enabled;

    // Update settings panel
    sensitivitySlider.value = Math.round(settings.detectionSensitivity * 100);
    sensitivityValue.textContent = `${Math.round(settings.detectionSensitivity * 100)}%`;
    autoplayToggle.checked = settings.autoplay;
    notificationsToggle.checked = settings.showNotifications;

    // Update position buttons
    positionBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.position === settings.overlayPosition);
    });

    // Update selected count
    selectedCount.textContent = selectedMemes.length;

    // Render meme library
    renderMemeLibrary();
  }

  /**
   * Render meme library
   */
  function renderMemeLibrary() {
    let memesToShow = [];

    // Filter by category
    if (currentCategory === 'selected') {
      memesToShow = allMemes.filter(meme => selectedMemes.includes(meme.id));
    } else if (currentCategory === 'trending') {
      // Sort by popularity
      memesToShow = [...allMemes].sort((a, b) => {
        return (b.popularity_score || 0) - (a.popularity_score || 0);
      });
    } else {
      memesToShow = allMemes;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      memesToShow = memesToShow.filter(meme => {
        return meme.name.toLowerCase().includes(query) ||
               (meme.keywords || []).some(k => k.toLowerCase().includes(query));
      });
    }

    // Render
    if (memesToShow.length === 0) {
      renderEmptyState();
    } else {
      renderMemeGrid(memesToShow);
    }
  }

  /**
   * Render meme grid
   */
  function renderMemeGrid(memes) {
    const grid = document.createElement('div');
    grid.className = 'meme-grid';

    memes.forEach(meme => {
      const item = createMemeItem(meme);
      grid.appendChild(item);
    });

    memeLibrary.innerHTML = '';
    memeLibrary.appendChild(grid);
  }

  /**
   * Create meme item element
   */
  function createMemeItem(meme) {
    const isSelected = selectedMemes.includes(meme.id);

    const item = document.createElement('div');
    item.className = `meme-item ${isSelected ? 'selected' : ''}`;
    item.dataset.memeId = meme.id;

    // Checkbox
    const checkbox = document.createElement('div');
    checkbox.className = 'meme-checkbox';
    checkbox.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;

    // Icon
    const icon = document.createElement('div');
    icon.className = 'meme-icon';
    icon.textContent = meme.name.charAt(0).toUpperCase();

    // Info
    const info = document.createElement('div');
    info.className = 'meme-info';

    const name = document.createElement('div');
    name.className = 'meme-name';
    name.textContent = meme.name;

    const keywords = document.createElement('div');
    keywords.className = 'meme-keywords';
    keywords.textContent = (meme.keywords || []).slice(0, 3).join(', ');

    info.appendChild(name);
    info.appendChild(keywords);

    // Assemble
    item.appendChild(checkbox);
    item.appendChild(icon);
    item.appendChild(info);

    // Click handler
    item.addEventListener('click', () => toggleMemeSelection(meme.id));

    return item;
  }

  /**
   * Render empty state
   */
  function renderEmptyState() {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>No memes found</p>
    `;

    memeLibrary.innerHTML = '';
    memeLibrary.appendChild(empty);
  }

  /**
   * Toggle meme selection
   */
  async function toggleMemeSelection(memeId) {
    const index = selectedMemes.indexOf(memeId);

    if (index > -1) {
      // Remove from selection
      selectedMemes.splice(index, 1);
    } else {
      // Add to selection
      selectedMemes.push(memeId);
    }

    // Save to storage
    await chrome.storage.sync.set({ selectedMemes: selectedMemes });

    // Update UI
    selectedCount.textContent = selectedMemes.length;
    renderMemeLibrary();
  }

  /**
   * Handle enable toggle
   */
  async function handleEnableToggle() {
    settings.enabled = enableToggle.checked;

    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { enabled: settings.enabled }
    });
  }

  /**
   * Open settings panel
   */
  function openSettings() {
    settingsPanel.classList.remove('hidden');
  }

  /**
   * Close settings panel
   */
  function closeSettings() {
    settingsPanel.classList.add('hidden');
  }

  /**
   * Handle search input
   */
  function handleSearch(e) {
    searchQuery = e.target.value;
    renderMemeLibrary();
  }

  /**
   * Handle tab change
   */
  function handleTabChange(category) {
    currentCategory = category;

    // Update tab states
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });

    // Render
    renderMemeLibrary();
  }

  /**
   * Handle clear all
   */
  async function handleClearAll() {
    if (confirm('Clear all selected memes?')) {
      selectedMemes = [];
      await chrome.storage.sync.set({ selectedMemes: [] });
      selectedCount.textContent = '0';
      renderMemeLibrary();
    }
  }

  /**
   * Handle select trending
   */
  async function handleSelectTrending() {
    // Get top 5 trending memes
    const trending = [...allMemes]
      .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0))
      .slice(0, 5)
      .map(m => m.id);

    selectedMemes = [...new Set([...selectedMemes, ...trending])];
    await chrome.storage.sync.set({ selectedMemes: selectedMemes });
    selectedCount.textContent = selectedMemes.length;
    renderMemeLibrary();
  }

  /**
   * Handle sensitivity change
   */
  function handleSensitivityChange(e) {
    const value = parseInt(e.target.value);
    sensitivityValue.textContent = `${value}%`;

    // Debounce update
    clearTimeout(handleSensitivityChange.timeout);
    handleSensitivityChange.timeout = setTimeout(async () => {
      settings.detectionSensitivity = value / 100;
      await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        settings: { detectionSensitivity: settings.detectionSensitivity }
      });
    }, 500);
  }

  /**
   * Handle autoplay toggle
   */
  async function handleAutoplayToggle() {
    settings.autoplay = autoplayToggle.checked;
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { autoplay: settings.autoplay }
    });
  }

  /**
   * Handle notifications toggle
   */
  async function handleNotificationsToggle() {
    settings.showNotifications = notificationsToggle.checked;
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { showNotifications: settings.showNotifications }
    });
  }

  /**
   * Handle position change
   */
  async function handlePositionChange(position) {
    settings.overlayPosition = position;

    // Update UI
    positionBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.position === position);
    });

    // Save
    await chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { overlayPosition: position }
    });
  }

  /**
   * Check API health
   */
  async function checkApiHealth() {
    apiStatusText.textContent = 'Checking...';
    apiStatusIndicator.className = 'status-indicator';

    try {
      const response = await chrome.runtime.sendMessage({ type: 'HEALTH_CHECK' });

      if (response.success) {
        apiStatusText.textContent = 'Connected';
        apiStatusIndicator.classList.add('online');
      } else {
        apiStatusText.textContent = 'Offline';
        apiStatusIndicator.classList.add('offline');
      }
    } catch (error) {
      apiStatusText.textContent = 'Error';
      apiStatusIndicator.classList.add('offline');
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    memeLibrary.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <p>${message}</p>
      </div>
    `;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
