import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecentPlays = ({ setCurrentSong }) => {
  const navigate = useNavigate();
  const [recentTracks, setRecentTracks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentPlays');
    if (saved) {
      setRecentTracks(JSON.parse(saved));
    }
  }, []);

  const formatTimeAgo = (isoString) => {
    if (!isoString) return '';
    const diff = (new Date() - new Date(isoString)) / 1000; // in seconds
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return `${Math.floor(diff / 86400)} gün önce`;
  };

  return (
    <div className="profile-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2>Son Çalınanlar</h2>
      </div>

      <div className="detail-content">
        <div className="recent-list">
          {recentTracks.length > 0 ? (
            recentTracks.map((track) => (
              <div className="recent-item glass-card" key={track.id} onClick={() => setCurrentSong && setCurrentSong(track)}>
                <img loading="lazy" decoding="async" src={track.coverUrl} alt={track.title} className="recent-cover"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                <div className="recent-info">
                  <h4>{track.title}</h4>
                  <p>{track.artist}</p>
                </div>
                <div className="recent-time">{formatTimeAgo(track.playedAt)}</div>
                <button className="recent-play-btn"><i className="fa-solid fa-play"></i></button>
              </div>
            ))
          ) : (
            <p style={{ color: '#a7a7a7', padding: '20px' }}>Henüz müzik dinlemediniz.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentPlays;
