import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConnectionsModal.css';

const ConnectionsModal = ({ isOpen, onClose, user, onUpdateCounts }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('following'); // 'following' or 'followers'
  const [connections, setConnections] = useState({ followers: [], following: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Unfollow Confirmation State
  const [confirmUser, setConfirmUser] = useState(null); // The user object we are about to unfollow
  const [unfollowing, setUnfollowing] = useState(false);

  // Fetch connections when modal is open
  useEffect(() => {
    if (isOpen && user?.token) {
      fetchConnections();
    }
  }, [isOpen, user]);

  const fetchConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/user/connections', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setConnections({
        followers: res.data.followers || [],
        following: res.data.following || []
      });
    } catch (err) {
      console.error("Bağlantılar alınamadı:", err);
      setError("Bağlantı listeniz yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (item) => {
    if (item.isArtist) {
      navigate(`/artist/${encodeURIComponent(item.username)}`);
    } else {
      navigate(`/user/${item._id}`);
    }
    onClose();
  };

  const openUnfollowConfirmation = (e, targetUser) => {
    e.stopPropagation(); // Stop navigation trigger
    setConfirmUser(targetUser);
  };

  const handleConfirmUnfollow = async () => {
    if (!confirmUser || !user?.token) return;
    setUnfollowing(true);
    try {
      if (confirmUser.isArtist) {
        // Unfavorite / unfollow artist
        const artistData = {
          id: confirmUser._id,
          name: confirmUser.username,
          imageUrl: confirmUser.profilePicture
        };
        await axios.post(
          'http://localhost:5000/api/library/favorites',
          { artist: artistData },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      } else {
        // Toggle follow user endpoint
        await axios.post(
          `http://localhost:5000/api/user/follow/${confirmUser._id}`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }

      // Successfully unfollowed, update state
      setConnections(prev => ({
        ...prev,
        following: prev.following.filter(u => u._id !== confirmUser._id)
      }));

      // Proactively notify parent if callback exists (to update profile headers or state elsewhere)
      if (onUpdateCounts) {
        onUpdateCounts();
      }
      
      // Dispatch the global update event to synchronize library/sidebar and other components
      window.dispatchEvent(new Event('user-connections-updated'));
    } catch (err) {
      console.error("Takipten çıkma hatası:", err);
      alert("Takipten çıkarken bir sorun oluştu.");
    } finally {
      setUnfollowing(false);
      setConfirmUser(null);
    }
  };

  if (!isOpen) return null;

  const currentList = activeTab === 'following' ? connections.following : connections.followers;

  return (
    <div className="connections-modal-overlay" onClick={onClose}>
      <div className="connections-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Unfollow Confirmation Glass Card */}
        {confirmUser && (
          <div className="unfollow-confirm-backdrop">
            <div className="unfollow-confirm-card">
              <h4>Takipten Çık</h4>
              <p>
                <strong>{confirmUser.username}</strong> {confirmUser.isArtist ? "sanatçısını" : "kullanıcısını"} takipten çıkarmak istediğinize emin misiniz?
              </p>
              <div className="unfollow-confirm-actions">
                <button 
                  className="unfollow-cancel-btn" 
                  disabled={unfollowing} 
                  onClick={() => setConfirmUser(null)}
                >
                  İptal
                </button>
                <button 
                  className="unfollow-yes-btn" 
                  disabled={unfollowing} 
                  onClick={handleConfirmUnfollow}
                >
                  {unfollowing ? "Çıkarılıyor..." : "Takipten Çık"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="connections-modal-header">
          <h3>Bağlantılarım</h3>
          <button className="connections-modal-close-btn" onClick={onClose} title="Kapat">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="connections-tabs">
          <button 
            className={`connections-tab-btn ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => setActiveTab('following')}
          >
            Takip Edilen
            <span className="connections-tab-count">
              {loading ? "..." : connections.following.length}
            </span>
          </button>
          
          <button 
            className={`connections-tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            Takipçiler
            <span className="connections-tab-count">
              {loading ? "..." : connections.followers.length}
            </span>
          </button>
        </div>

        {/* List Content */}
        <div className="connections-list-container">
          {loading ? (
            <div className="connections-list-empty">
              <div className="mini-spinner"></div>
              <p>Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="connections-list-empty">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="connections-list-empty">
              <i className={activeTab === 'following' ? "fa-solid fa-user-plus" : "fa-solid fa-users-slash"}></i>
              <p>
                {activeTab === 'following' 
                  ? "Henüz kimseyi takip etmiyorsunuz." 
                  : "Henüz sizi takip eden bir kullanıcı yok."}
              </p>
            </div>
          ) : (
            currentList.map((item) => (
              <div key={item._id} className="connections-user-item">
                <div className="connections-user-info" onClick={() => handleUserClick(item)}>
                  <img 
                    loading="lazy" 
                    decoding="async" 
                    src={item.profilePicture || '/default-profile.svg'} 
                    alt={item.username} 
                    onError={(e) => { e.target.onerror = null; e.target.src = '/default-profile.svg'; }}
                  />
                  <div className="connections-user-details">
                    <h5>{item.username}</h5>
                    <p>{item.isArtist ? 'Sanatçı' : (item.premiumStatus === 'Premium' ? 'Premium Üye' : 'Ücretsiz Üye')}</p>
                  </div>
                </div>
                
                {activeTab === 'following' && (
                  <button 
                    className="connections-unfollow-btn" 
                    onClick={(e) => openUnfollowConfirmation(e, item)}
                  >
                    Takipten Çık
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsModal;
