import React, { useState } from 'react';

function AddMeme({ onMemeAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    keywords: '',
    video_url: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse keywords from comma-separated string
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
      const response = await fetch(`${API_BASE_URL}/api/memes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create meme');
      }

      const newMeme = await response.json();
      
      // Update cached memes
      const { allMemes } = await chrome.storage.local.get(['allMemes']);
      await chrome.storage.local.set({
        allMemes: [...(allMemes || []), newMeme]
      });

      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        keywords: '',
        video_url: '',
        category: 'general'
      });

      // Notify parent component
      if (onMemeAdded) {
        onMemeAdded(newMeme);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error adding meme:', err);
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

  return (
    <div className="add-meme-container">
      <h2 className="section-title">Add New Meme</h2>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="form-success">
          Meme added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="meme-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Distracted Boyfriend"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the meme..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="keywords">Keywords * (comma-separated)</label>
          <input
            type="text"
            id="keywords"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            required
            placeholder="e.g., distracted, boyfriend, looking"
          />
          <small className="form-hint">
            Separate keywords with commas. These will be used to detect the meme.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="video_url">Video/GIF/YouTube URL *</label>
          <input
            type="url"
            id="video_url"
            name="video_url"
            value={formData.video_url}
            onChange={handleChange}
            required
            placeholder="https://youtube.com/watch?v=... or https://example.com/meme.mp4"
          />
          <small className="form-hint">
            Supports YouTube URLs, .mp4, .webm, .gif files (with audio!)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="general">General</option>
            <option value="reaction">Reaction</option>
            <option value="wholesome">Wholesome</option>
            <option value="dank">Dank</option>
            <option value="classic">Classic</option>
            <option value="viral">Viral</option>
          </select>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add Meme'}
        </button>
      </form>
    </div>
  );
}

export default AddMeme;

