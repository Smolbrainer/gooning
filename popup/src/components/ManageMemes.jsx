import React, { useState } from 'react';

function ManageMemes({ memes, onMemesUpdated }) {
  const [editingMeme, setEditingMeme] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Debug log
  React.useEffect(() => {
    console.log('ManageMemes rendered with', memes?.length, 'memes');
    console.log('onMemesUpdated callback exists:', !!onMemesUpdated);
  }, [memes]);

  const startEdit = (meme) => {
    setEditingMeme(meme.id);
    setFormData({
      name: meme.name,
      description: meme.description || '',
      keywords: meme.keywords.join(', '),
      video_url: meme.video_url,
      category: meme.category
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingMeme(null);
    setFormData({});
    setError(null);
  };

  const handleUpdate = async (memeId) => {
    setLoading(true);
    setError(null);

    try {
      const keywords = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywords.length === 0) {
        throw new Error('Please add at least one keyword');
      }

      const memeData = {
        name: formData.name,
        description: formData.description || null,
        keywords,
        video_url: formData.video_url,
        category: formData.category,
        popularity_score: 0
      };

      const API_BASE_URL = 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/memes/${memeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update meme');
      }

      const updatedMeme = await response.json();

      // Update cached memes
      const { allMemes } = await chrome.storage.local.get(['allMemes']);
      const newMemes = allMemes.map(m => m.id === memeId ? updatedMeme : m);
      await chrome.storage.local.set({ allMemes: newMemes });

      setEditingMeme(null);
      setFormData({});

      if (onMemesUpdated) {
        onMemesUpdated(newMemes);
      }
    } catch (err) {
      console.error('Error updating meme:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memeId, memeName) => {
    console.log('Delete button clicked for:', memeName, memeId);
    
    if (!confirm(`Are you sure you want to delete "${memeName}"?`)) {
      console.log('Delete cancelled by user');
      return;
    }

    console.log('Starting delete process...');
    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = 'http://localhost:8000';
      console.log('Calling DELETE API:', `${API_BASE_URL}/api/memes/${memeId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/memes/${memeId}`, {
        method: 'DELETE'
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        throw new Error(errorData.detail || 'Failed to delete meme');
      }

      console.log('Delete successful, updating storage...');

      // Update cached memes
      const { allMemes, selectedMemes } = await chrome.storage.local.get(['allMemes', 'selectedMemes']);
      console.log('Current memes count:', allMemes?.length);
      
      const newMemes = allMemes.filter(m => m.id !== memeId);
      const newSelected = (selectedMemes || []).filter(id => id !== memeId);
      
      console.log('New memes count after filter:', newMemes.length);
      
      await chrome.storage.local.set({
        allMemes: newMemes,
        selectedMemes: newSelected
      });

      console.log('Storage updated successfully');

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

      console.log('Calling onMemesUpdated callback...');
      if (onMemesUpdated) {
        onMemesUpdated(newMemes);
      }
      
      console.log('Delete complete!');
    } catch (err) {
      console.error('Error deleting meme:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Filter memes by search term
  const filteredMemes = memes.filter(meme =>
    meme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meme.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="manage-memes-container">
      <h2 className="section-title">Manage Memes</h2>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search memes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="manage-list">
        {filteredMemes.length === 0 ? (
          <div className="empty-state">
            <p>No memes found</p>
          </div>
        ) : (
          filteredMemes.map(meme => (
            <div key={meme.id} className="manage-card">
              {editingMeme === meme.id ? (
                <div className="edit-form">
                  <div className="form-group-inline">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Name"
                      className="edit-input"
                    />
                  </div>
                  <div className="form-group-inline">
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleChange}
                      placeholder="Keywords (comma-separated)"
                      className="edit-input"
                    />
                  </div>
                  <div className="form-group-inline">
                    <input
                      type="url"
                      name="video_url"
                      value={formData.video_url}
                      onChange={handleChange}
                      placeholder="Video URL"
                      className="edit-input"
                    />
                  </div>
                  <div className="form-group-inline">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="edit-select"
                    >
                      <option value="general">General</option>
                      <option value="reaction">Reaction</option>
                      <option value="wholesome">Wholesome</option>
                      <option value="dank">Dank</option>
                      <option value="classic">Classic</option>
                      <option value="viral">Viral</option>
                    </select>
                  </div>
                  <div className="edit-actions">
                    <button
                      onClick={() => handleUpdate(meme.id)}
                      disabled={loading}
                      className="save-btn"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="manage-card-content">
                    <div className="manage-info">
                      <h3 className="manage-name">{meme.name}</h3>
                      <p className="manage-category">{meme.category}</p>
                      <div className="manage-keywords">
                        {meme.keywords.slice(0, 3).map((keyword, idx) => (
                          <span key={idx} className="keyword-tag">
                            {keyword}
                          </span>
                        ))}
                        {meme.keywords.length > 3 && (
                          <span className="keyword-tag more">
                            +{meme.keywords.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="manage-actions">
                      <button
                        onClick={() => {
                          console.log('Edit button clicked for:', meme.name);
                          startEdit(meme);
                        }}
                        className="edit-btn"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          console.log('Delete button CLICKED!', meme.name, meme.id);
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(meme.id, meme.name);
                        }}
                        className="delete-btn"
                        disabled={loading}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ManageMemes;

