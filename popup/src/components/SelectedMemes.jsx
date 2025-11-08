import React from 'react';

function SelectedMemes({ memes, onRemove, onClearAll }) {
  if (memes.length === 0) {
    return null;
  }

  return (
    <div className="selected-memes">
      <div className="selected-header">
        <h2 className="section-title">Active Memes</h2>
        <button className="clear-all-btn" onClick={onClearAll}>
          Clear All
        </button>
      </div>
      <div className="selected-list">
        {memes.map(meme => (
          <div key={meme.id} className="selected-item">
            <span className="selected-meme-name">{meme.name}</span>
            <button
              className="remove-btn"
              onClick={() => onRemove(meme.id)}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectedMemes;
