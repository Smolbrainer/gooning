import React from 'react';

function Header({ isEnabled, onToggleEnabled, selectedCount }) {
  return (
    <div className="header">
      <div className="header-top">
        <h1 className="title">Meme Detector</h1>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={onToggleEnabled}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
      <div className="header-status">
        <span className={`status-indicator ${isEnabled ? 'active' : 'inactive'}`}>
          {isEnabled ? 'Active' : 'Inactive'}
        </span>
        <span className="selected-count">
          {selectedCount} meme{selectedCount !== 1 ? 's' : ''} selected
        </span>
      </div>
    </div>
  );
}

export default Header;
