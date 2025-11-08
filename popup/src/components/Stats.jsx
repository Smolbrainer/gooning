import React, { useState, useEffect } from 'react';

function Stats() {
  const [stats, setStats] = useState({
    totalDetections: 0,
    memeDetections: {}
  });
  const [memes, setMemes] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [statsData, memesData] = await Promise.all([
        chrome.storage.local.get(['stats']),
        chrome.storage.local.get(['allMemes'])
      ]);

      setStats(statsData.stats || { totalDetections: 0, memeDetections: {} });
      setMemes(memesData.allMemes || []);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const clearStats = async () => {
    if (confirm('Are you sure you want to clear all statistics?')) {
      await chrome.storage.local.set({
        stats: { totalDetections: 0, memeDetections: {} }
      });
      setStats({ totalDetections: 0, memeDetections: {} });
    }
  };

  // Get meme details for each detection
  const detectionsList = Object.entries(stats.memeDetections || {})
    .map(([memeId, count]) => {
      const meme = memes.find(m => m.id === memeId);
      return {
        id: memeId,
        name: meme?.name || 'Unknown Meme',
        count
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h2 className="section-title">Detection Statistics</h2>
        {stats.totalDetections > 0 && (
          <button className="clear-stats-btn" onClick={clearStats}>
            Clear Stats
          </button>
        )}
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{stats.totalDetections}</div>
          <div className="stat-label">Total Detections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{detectionsList.length}</div>
          <div className="stat-label">Unique Memes Detected</div>
        </div>
      </div>

      {detectionsList.length > 0 ? (
        <div className="detections-list">
          <h3 className="subsection-title">Meme Breakdown</h3>
          {detectionsList.map(({ id, name, count }) => (
            <div key={id} className="detection-item">
              <div className="detection-info">
                <span className="detection-name">{name}</span>
                <span className="detection-count">{count} detection{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="detection-bar">
                <div
                  className="detection-fill"
                  style={{
                    width: `${(count / stats.totalDetections) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-stats">
          <p>No detections yet</p>
          <p className="hint">Browse some pages with your selected memes to see stats</p>
        </div>
      )}
    </div>
  );
}

export default Stats;

