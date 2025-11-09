import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MemeList from './components/MemeList';
import Stats from './components/Stats';
import AddMeme from './components/AddMeme';
import ManageMemes from './components/ManageMemes';

function App() {
  const [memes, setMemes] = useState([]);
  const [selectedMemeIds, setSelectedMemeIds] = useState([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('select');

  // Load memes and settings on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load from chrome storage
      const [storedMemes, storedSelected, settings] = await Promise.all([
        chrome.storage.local.get(['allMemes']),
        chrome.storage.local.get(['selectedMemes']),
        chrome.storage.local.get(['settings'])
      ]);

      // If we have cached memes, use them
      if (storedMemes.allMemes && storedMemes.allMemes.length > 0) {
        setMemes(storedMemes.allMemes);
      }

      setSelectedMemeIds(storedSelected.selectedMemes || []);
      setIsEnabled(settings.settings?.enabled !== false);

      // Fetch fresh memes from API in background
      fetchMemesFromAPI();
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load memes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemesFromAPI = async () => {
    try {
      const API_BASE_URL = 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/memes`);

      if (!response.ok) {
        throw new Error('Failed to fetch memes from API');
      }

      const freshMemes = await response.json();
      setMemes(freshMemes);

      // Cache in storage
      await chrome.storage.local.set({ allMemes: freshMemes });
    } catch (err) {
      console.error('Error fetching memes from API:', err);
      // Don't show error if we already have cached memes
      if (memes.length === 0) {
        setError('Could not connect to API. Make sure the backend is running.');
      }
    }
  };

  const toggleMemeSelection = async (memeId) => {
    const newSelected = selectedMemeIds.includes(memeId)
      ? selectedMemeIds.filter(id => id !== memeId)
      : [...selectedMemeIds, memeId];

    setSelectedMemeIds(newSelected);
    await chrome.storage.local.set({ selectedMemes: newSelected });

    // Notify content scripts of the update
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'MEMES_UPDATED',
          selectedMemes: newSelected
        }).catch(() => {
          // Ignore errors from tabs without content script
        });
      });
    });
  };

  const toggleAllMemes = async () => {
    const allSelected = selectedMemeIds.length === memes.length;
    const newSelected = allSelected ? [] : memes.map(m => m.id);

    setSelectedMemeIds(newSelected);
    await chrome.storage.local.set({ selectedMemes: newSelected });

    // Notify content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'MEMES_UPDATED',
          selectedMemes: newSelected
        }).catch(() => {});
      });
    });
  };

  const toggleEnabled = async () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    const settings = { enabled: newEnabled, autoplay: true, position: 'bottom-right' };
    await chrome.storage.local.set({ settings });

    // Notify content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'ENABLED_CHANGED',
          enabled: newEnabled
        }).catch(() => {});
      });
    });
  };

  const handleMemeAdded = (newMeme) => {
    setMemes([...memes, newMeme]);
    // Optionally switch back to select tab
    setActiveTab('select');
  };

  const handleMemesUpdated = async (updatedMemes) => {
    setMemes(updatedMemes);
    
    // Also refresh selected memes to ensure deleted memes are removed
    const { selectedMemes } = await chrome.storage.local.get(['selectedMemes']);
    const validSelectedIds = (selectedMemes || []).filter(id => 
      updatedMemes.some(meme => meme.id === id)
    );
    
    if (validSelectedIds.length !== selectedMemes?.length) {
      await chrome.storage.local.set({ selectedMemes: validSelectedIds });
      setSelectedMemeIds(validSelectedIds);
    }
  };

  return (
    <div className="app">
      <Header
        isEnabled={isEnabled}
        onToggleEnabled={toggleEnabled}
        selectedCount={selectedMemeIds.length}
      />

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'select' ? 'active' : ''}`}
          onClick={() => setActiveTab('select')}
        >
          Select
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <button
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add
        </button>
        <button
          className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="tab-content">
        {loading ? (
          <div className="loading">Loading memes...</div>
        ) : (
          <>
            {activeTab === 'select' && (
              <MemeList
                memes={memes}
                selectedIds={selectedMemeIds}
                onToggle={toggleMemeSelection}
                onToggleAll={toggleAllMemes}
              />
            )}

            {activeTab === 'stats' && <Stats />}

            {activeTab === 'add' && (
              <AddMeme onMemeAdded={handleMemeAdded} />
            )}

            {activeTab === 'manage' && (
              <ManageMemes
                memes={memes}
                onMemesUpdated={handleMemesUpdated}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
