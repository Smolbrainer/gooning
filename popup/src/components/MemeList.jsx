import React from 'react';

function MemeList({ memes, selectedIds, onToggle, onToggleAll }) {
  if (memes.length === 0) {
    return (
      <div className="empty-state">
        <p>No memes available</p>
        <p className="hint">Make sure the backend API is running</p>
      </div>
    );
  }

  const allSelected = memes.length > 0 && selectedIds.length === memes.length;

  return (
    <div className="meme-list">
      <div className="meme-list-header">
        <h2 className="section-title">Available Memes</h2>
        <button
          className="toggle-all-btn"
          onClick={onToggleAll}
          title={allSelected ? "Deselect all memes" : "Select all memes"}
        >
          {allSelected ? '✓ Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="meme-grid">
        {memes.map(meme => (
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
    </div>
  );
}

export default MemeList;
