import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = ({ user, setUser, handleLogout }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchProfile();
    };
    window.addEventListener('user-connections-updated', handleUpdate);
    return () => {
      window.removeEventListener('user-connections-updated', handleUpdate);
    };
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProfileData(res.data);
      // Update local storage user data to keep profile pic in sync
      const updatedUser = { ...user, profilePicture: res.data.profilePicture };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setLoading(false);
    } catch (err) {
      console.error('Profil yüklenirken hata', err);
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setIsUploading(true);
      const res = await axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });
      setProfileData(res.data);
      const updatedUser = { ...user, profilePicture: res.data.profilePicture };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setIsUploading(false);
    } catch (err) {
      console.error('Fotoğraf yüklenirken hata', err);
      setIsUploading(false);
      alert('Fotoğraf yüklenemedi.');
    }
  };

  if (loading || !profileData) {
    return <div className="loading-text">Profil yükleniyor...</div>;
  }

  return (
    <div className="profile-page">
      {/* Üst Kısım: Profil Özeti */}
      <div className="profile-header">
        <div className="profile-image-container" onClick={handlePhotoClick}>
          <img loading="lazy" decoding="async" 
            src={profileData.profilePicture || '/default-profile.svg'} 
            alt="Profil" 
            className="profile-avatar"
            style={{ opacity: isUploading ? 0.5 : 1 }}
           onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
          <div className="profile-image-overlay">
            <i className="fa-solid fa-pen"></i> Düzenle
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="profile-info">
          <h1>{profileData.username}</h1>
          <p className="profile-stats">
            {profileData.followers} takipçi • {profileData.following} takip ediliyor
          </p>
        </div>
      </div>

      {/* Profil Alt Menüleri */}
      <div className="profile-settings-list">
        <div className="settings-item" onClick={() => navigate('/profile/account')}>
          <div className="settings-item-left">
            <i className="fa-regular fa-user"></i>
            <div className="settings-text">
              <h4>Hesap</h4>
              <p>{profileData.email} • Arkadaşların için ücretsiz Premium</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right chevron-icon"></i>
        </div>

        <div className="settings-item" onClick={() => navigate('/profile/premium')}>
          <div className="settings-item-left">
            <i className="fa-brands fa-spotify"></i>
            <div className="settings-text">
              <h4>Premium üyeliğin</h4>
            </div>
          </div>
          <span className="premium-badge">{profileData.premiumStatus || 'Bireysel'}</span>
        </div>

        <div className="settings-item" onClick={() => navigate('/profile/stats')}>
          <div className="settings-item-left">
            <i className="fa-solid fa-chart-line"></i>
            <div className="settings-text">
              <h4>Dinleme istatistikleri</h4>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right chevron-icon"></i>
        </div>

        <div className="settings-item" onClick={() => navigate('/profile/recent')}>
          <div className="settings-item-left">
            <i className="fa-solid fa-clock-rotate-left"></i>
            <div className="settings-text">
              <h4>Son çalınanlar</h4>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right chevron-icon"></i>
        </div>

        <div className="settings-item" onClick={() => navigate('/profile/updates')}>
          <div className="settings-item-left">
            <i className="fa-solid fa-bullhorn"></i>
            <div className="settings-text">
              <h4>Güncellemelerin</h4>
            </div>
          </div>
          <div className="notification-dot"></div>
        </div>

        <div className="settings-item" onClick={() => navigate('/profile/settings')}>
          <div className="settings-item-left">
            <i className="fa-solid fa-gear"></i>
            <div className="settings-text">
              <h4>Ayarlar ve gizlilik</h4>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right chevron-icon"></i>
        </div>
      </div>
    </div>
  );
};

export default Profile;
