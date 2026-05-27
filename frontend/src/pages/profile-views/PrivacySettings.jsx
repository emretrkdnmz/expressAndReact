import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacySettings = ({ handleLogout }) => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    privateSession: false,
    publicPlaylists: true,
    explicitContent: true,
    dataSaver: false
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="profile-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2>Ayarlar ve Gizlilik</h2>
      </div>

      <div className="detail-content">
        <div className="glass-card">
          <div className="setting-toggle-item">
            <div className="setting-toggle-info">
              <h4>Gizli Oturum</h4>
              <p>Dinlediklerin takipçilerinle paylaşılmaz.</p>
            </div>
            <div 
              className={`toggle-switch ${settings.privateSession ? 'on' : 'off'}`}
              onClick={() => toggleSetting('privateSession')}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>

          <div className="setting-toggle-item">
            <div className="setting-toggle-info">
              <h4>Herkese Açık Çalma Listeleri</h4>
              <p>Yeni oluşturduğun çalma listeleri profilinde görünür.</p>
            </div>
            <div 
              className={`toggle-switch ${settings.publicPlaylists ? 'on' : 'off'}`}
              onClick={() => toggleSetting('publicPlaylists')}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>

          <div className="setting-toggle-item">
            <div className="setting-toggle-info">
              <h4>Sansürsüz İçerik</h4>
              <p>Sansürsüz (Explicit) şarkıların çalınmasına izin ver.</p>
            </div>
            <div 
              className={`toggle-switch ${settings.explicitContent ? 'on' : 'off'}`}
              onClick={() => toggleSetting('explicitContent')}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>
          
          <div className="setting-toggle-item" style={{ borderBottom: 'none' }}>
            <div className="setting-toggle-info">
              <h4>Veri Tasarrufu</h4>
              <p>Düşük ses kalitesi kullanarak internetten tasarruf et.</p>
            </div>
            <div 
              className={`toggle-switch ${settings.dataSaver ? 'on' : 'off'}`}
              onClick={() => toggleSetting('dataSaver')}
            >
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
          <button 
            className="logout-btn" 
            style={{ 
              backgroundColor: '#e91429', 
              color: 'white', 
              border: 'none', 
              padding: '12px 30px', 
              borderRadius: '25px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              transition: '0.2s',
              boxShadow: '0 4px 15px rgba(233, 20, 41, 0.4)'
            }}
            onClick={handleLogout}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '8px' }}></i>
            Oturumu Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
