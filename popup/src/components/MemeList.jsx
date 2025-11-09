import React, { useState } from 'react';

function MemeList({ memes, selectedIds, onToggle, onToggleAll }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (memes.length === 0) {
    return (
      <div className="empty-state">
        <p>No memes available</p>
        <p className="hint">Make sure the backend API is running</p>
      </div>
    );
  }

  // Filter memes by search term
  const filteredMemes = memes.filter(meme =>
    meme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meme.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (meme.category && meme.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const allSelected = filteredMemes.length > 0 && filteredMemes.every(meme => selectedIds.includes(meme.id));

  return (
    <div className="meme-list">
      <div className="meme-list-header">
        <h2 className="section-title">
          Memes {selectedIds.length > 0 && `(${selectedIds.length} selected)`}
        </h2>
        <button
          className="toggle-all-btn"
          onClick={onToggleAll}
          title={allSelected ? "Deselect all memes" : "Select all memes"}
        >
          {allSelected ? '✓ Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search memes by name, keyword, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="clear-search-btn"
            onClick={() => setSearchTerm('')}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {filteredMemes.length === 0 ? (
        <div className="empty-state">
          <p>No memes found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="meme-grid">
          {filteredMemes.map(meme => (
            <div
              key={meme.id}
              className={`meme-card ${selectedIds.includes(meme.id) ? 'selected' : ''}`}
              onClick={() => onToggle(meme.id)}
            >
              <div className="meme-card-content">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(meme.id)}
                  onChange={() => onToggle(meme.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="meme-info">
                  <h3 className="meme-name">{meme.name}</h3>
                  <p className="meme-category">{meme.category}</p>
                  <div className="meme-keywords">
                    {meme.keywords.slice(0, 3).map((keyword, idx) => (
                      <span key={idx} className="keyword-tag">
                        {keyword}
                      </span>
                    ))}
                    {meme.keywords.length > 3 && (
                      <span className="keyword-tag more">
                        +{meme.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MemeList;
