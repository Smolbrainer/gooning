// Main Content Script for Meme Detector

(async function() {
  console.log('Meme Detector content script loaded');

  let detector = null;
  let overlay = null;
  let mutationObserver = null;
  let isEnabled = true;

  const INPUT_SELECTOR = [
    'input[type="text"]',
    'input[type="search"]',
    'input[type="email"]',
    'input[type="url"]',
    'input[type="tel"]',
    'input:not([type])',
    'textarea',
    '[contenteditable="true"]',
    '[contenteditable=""]',
    '[contenteditable="plaintext-only"]'
  ].join(',');

  const inputListeners = new Map();
  const lastInputValues = new Map();
  const PAGE_BRIDGE_EXTENSION_TARGET = 'MEME_DETECTOR_EXTENSION';
  const PAGE_BRIDGE_PAGE_TARGET = 'MEME_DETECTOR_PAGE';
  let pageBridgeListener = null;
  const mirrorState = {
    activeElement: null,
    text: '',
    lastUpdated: 0
  };

  /**
   * Request the background service worker to close the active tab.
   * Returns a promise that resolves when the tab has been closed.
   */
  function requestCloseActiveTab() {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({ type: 'CLOSE_ACTIVE_TAB' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!response?.success) {
            reject(new Error(response?.error || 'Failed to close active tab'));
            return;
          }

          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Expose helper for debugging or other scripts if needed
  window.requestMemeDetectorCloseActiveTab = requestCloseActiveTab;
  window.getMemeDetectorMirrorState = () => ({ ...mirrorState });

  /**
   * Ensure the bridge listener for page -> extension communication is registered.
   */
  function ensurePageMessageBridge() {
    if (pageBridgeListener) {
      return;
    }

    pageBridgeListener = function(event) {
      try {
        if (event.source !== window) {
          return;
        }

        const data = event.data;
        if (!data || typeof data !== 'object') {
          return;
        }

        if (data.target !== PAGE_BRIDGE_EXTENSION_TARGET) {
          return;
        }

        const { type, requestId = null } = data;

        const respond = (payload) => {
          window.postMessage(
            {
              target: PAGE_BRIDGE_PAGE_TARGET,
              action: type,
              requestId,
              ...payload
            },
            '*'
          );
        };

        if (type === 'CLOSE_ACTIVE_TAB') {
          requestCloseActiveTab()
            .then(() => respond({ success: true }))
            .catch((error) => {
              respond({
                success: false,
                error: error?.message || 'Failed to close active tab'
              });
            });
          return;
        }

        respond({
          success: false,
          error: `Unsupported bridge message type: ${type}`
        });
      } catch (error) {
        console.warn('[MemeDetector] Error handling page message bridge:', error);
      }
    };

    window.addEventListener('message', pageBridgeListener);
    console.debug('[MemeDetector] Page bridge listener attached');
  }

  /**
   * Update the hidden mirror state with the latest text from the active element,
   * then run keyword detection against that mirror text.
   */
  function updateMirrorState(element, textValue) {
    mirrorState.activeElement = element || null;
    mirrorState.text = textValue || '';
    mirrorState.lastUpdated = Date.now();

    if (detector && mirrorState.text) {
      detector.scanText(mirrorState.text, {
        source: 'input-mirror',
        element: mirrorState.activeElement
      });
    }
  }

  function clearMirrorState(element) {
    if (!mirrorState.activeElement) return;
    if (element && mirrorState.activeElement !== element) return;
    mirrorState.activeElement = null;
    mirrorState.text = '';
    mirrorState.lastUpdated = Date.now();
  }

  /**
   * Build a readable identifier for an element for logging/debugging
   * @param {Element} element
   * @returns {string}
   */
  function describeElement(element) {
    if (!element || !element.tagName) return 'unknown-element';

    const tag = element.tagName.toLowerCase();
    const parts = [tag];

    if (element.id) {
      parts.push(`#${element.id}`);
    }

    if (element.name) {
      parts.push(`[name="${element.name}"]`);
    }

    if (element.classList && element.classList.length > 0) {
      parts.push(`.${Array.from(element.classList).join('.')}`);
    }

    return parts.join('');
  }

  /**
   * Initialize the content script
   */
  async function init() {
    try {
      // Check if extension is enabled
      const settings = await chrome.storage.local.get(['settings']);
      isEnabled = settings.settings?.enabled !== false;

      if (!isEnabled) {
        console.log('Meme Detector is disabled');
        return;
      }

      // Get selected memes from storage
      const result = await chrome.storage.local.get(['selectedMemes', 'allMemes']);
      const selectedIds = result.selectedMemes || [];
      const allMemes = result.allMemes || [];

      if (selectedIds.length === 0) {
        console.log('No memes selected for detection');
        return;
      }

      // Filter to get only selected memes
      const selectedMemes = allMemes.filter(meme => selectedIds.includes(meme.id));

      if (selectedMemes.length === 0) {
        console.log('No meme data available');
        return;
      }

      console.log(`Initializing detector with ${selectedMemes.length} memes`);

      // Create detector
      detector = new window.MemeDetector(selectedMemes);

      // Create overlay (will be created on first show)
      overlay = new window.MemeOverlay();

      // Set up detection callback
      detector.onDetection((meme, matchedKeyword, context) => {
        const source = context?.source || 'page';
        console.log(`Meme detected: ${meme.name} [source: ${source}] (keyword: ${matchedKeyword})`);
        overlay.show(meme);
      });

      // Start detection
      detector.startDetection();

      // Track user input fields in real time
      setupInputListeners();

      // Set up mutation observer for dynamic content
      setupMutationObserver();

      // Make sure page bridge is ready
      ensurePageMessageBridge();

      console.log('Meme Detector initialized successfully');
    } catch (error) {
      console.error('Error initializing Meme Detector:', error);
    }
  }

  /**
   * Set up MutationObserver to detect dynamic content changes
   */
  function setupMutationObserver() {
    if (mutationObserver) return;

    mutationObserver = new MutationObserver((mutations) => {
      let hasSignificantChanges = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => registerInputsFromNode(node));
          mutation.removedNodes.forEach(node => unregisterInputsFromNode(node));
        }

        if (
          mutation.addedNodes.length > 0 ||
          mutation.removedNodes.length > 0 ||
          mutation.type === 'characterData'
        ) {
          hasSignificantChanges = true;
        }
      });

      if (hasSignificantChanges && detector) {
        // Debounce: scan after changes settle
        debounce(() => {
          detector.scanPage();
        }, 500);
      }
    });

    // Observe document body for changes
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    console.log('MutationObserver set up');
  }

  /**
   * Register input listeners on relevant elements within a node
   * @param {Node} node - Node to inspect for inputs/textareas/contenteditables
   */
  function registerInputsFromNode(node) {
    if (!node) return;

    if (node === document) {
      setupInputListeners(document);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      setupInputListeners(node);
    }
  }

  /**
   * Remove input listeners for elements within a node that's leaving the DOM
   * @param {Node} node - Node being removed
   */
  function unregisterInputsFromNode(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

    removeInputListeners(node);
  }

  /**
   * Attach input listeners to elements matching INPUT_SELECTOR
   * @param {Document|Element} root - Root to search for inputs
   */
  function setupInputListeners(root = document) {
    if (!detector) return;

    let elements = [];

    if (root === document) {
      elements = Array.from(document.querySelectorAll(INPUT_SELECTOR));
    } else {
      if (root.matches && root.matches(INPUT_SELECTOR)) {
        elements.push(root);
      }
      if (root.querySelectorAll) {
        elements = elements.concat(Array.from(root.querySelectorAll(INPUT_SELECTOR)));
      }
    }

    elements.forEach(element => {
      if (inputListeners.has(element)) {
        return;
      }

      const handler = (event) => {
        if (!element.isConnected) {
          console.debug(`[MemeDetector] Input event on detached element ${describeElement(element)}, cleaning up listener.`);
          removeInputListeners(element);
          return;
        }

        if (!(element instanceof HTMLElement)) {
          console.debug('[MemeDetector] Input target is not an HTMLElement, skipping.');
          return;
        }

        console.debug(`[MemeDetector] Input event captured on ${describeElement(element)}`);

        if (!detector) return;

        const rawText = getElementText(element);
        if (typeof rawText !== 'string') {
          console.debug('[MemeDetector] Ignored input event: unable to extract text value');
          return;
        }

        const normalizedForComparison = rawText.toLowerCase();
        const previousValue = lastInputValues.get(element);
        if (previousValue === normalizedForComparison) {
          console.debug('[MemeDetector] Input text unchanged since last scan, skipping detection');
          return;
        }

        lastInputValues.set(element, normalizedForComparison);

        const previewLength = 50;
        const preview = rawText.length > previewLength
          ? `${rawText.slice(0, previewLength)}…`
          : rawText;

        console.debug(`[MemeDetector] Typing detected on ${describeElement(element)} -> "${preview}"`);
        updateMirrorState(element, rawText);
      };

      element.addEventListener('input', handler, { passive: true });
      inputListeners.set(element, handler);
      console.debug(`[MemeDetector] Attached input listener to ${describeElement(element)}`);
    });
  }

  /**
   * Remove input listeners from a root element and its descendants
   * @param {Element} root - Root element whose inputs should be cleaned up
   */
  function removeInputListeners(root) {
    if (!root) return;

    const elements = [];

    if (root.matches && inputListeners.has(root)) {
      elements.push(root);
    }

    if (root.querySelectorAll) {
      elements.push(...root.querySelectorAll(INPUT_SELECTOR));
    }

    elements.forEach(element => {
      const handler = inputListeners.get(element);
      if (handler) {
        element.removeEventListener('input', handler);
        inputListeners.delete(element);
        console.debug(`[MemeDetector] Removed input listener from ${describeElement(element)}`);
        clearMirrorState(element);
      }
      if (lastInputValues.has(element)) {
        lastInputValues.delete(element);
      }
    });
  }

  /**
   * Clean up all registered input listeners
   */
  function cleanupInputListeners() {
    inputListeners.forEach((handler, element) => {
      element.removeEventListener('input', handler);
    });
    inputListeners.clear();
    lastInputValues.clear();
  }

  /**
   * Safely extract text from an input/textarea/contenteditable element
   * @param {Element} element - The element to read from
   * @returns {string} Text content
   */
  function getElementText(element) {
    if (!element) return '';

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      return element.value || '';
    }

    return element.textContent || '';
  }

  /**
   * Debounce function to limit execution frequency
   */
  let debounceTimer;
  function debounce(func, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
  }

  /**
   * Clean up resources
   */
  function cleanup() {
    if (detector) {
      detector.stopDetection();
      detector = null;
    }

    // Remove input listeners
    cleanupInputListeners();

    if (overlay) {
      overlay.destroy();
      overlay = null;
    }

    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }

    if (pageBridgeListener) {
      window.removeEventListener('message', pageBridgeListener);
      pageBridgeListener = null;
    }

    mirrorState.activeElement = null;
    mirrorState.text = '';
    mirrorState.lastUpdated = Date.now();

    console.log('Cleaned up Meme Detector');
  }

  /**
   * Handle messages from popup or background script
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script received message:', message.type);

    if (message.type === 'MEMES_UPDATED') {
      // User changed meme selection in popup
      console.log('Memes updated, reinitializing...');
      cleanup();

      // Reinitialize with new selection
      setTimeout(() => {
        init();
      }, 100);

      sendResponse({ success: true });
    }

    if (message.type === 'ENABLED_CHANGED') {
      // Extension enabled/disabled
      isEnabled = message.enabled;

      if (isEnabled) {
        console.log('Extension enabled, starting detection...');
        init();
      } else {
        console.log('Extension disabled, stopping detection...');
        cleanup();
      }

      sendResponse({ success: true });
    }

    if (message.type === 'PING') {
      // Health check
      sendResponse({
        active: detector?.isActive() || false,
        memesCount: detector?.memes?.length || 0
      });
    }
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.selectedMemes || changes.settings) {
        console.log('Storage changed, reinitializing...');
        cleanup();
        setTimeout(() => init(), 100);
      }
    }
  });

  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Page already loaded
    init();
  }

  // Clean up on page unload
  window.addEventListener('beforeunload', cleanup);

})();
