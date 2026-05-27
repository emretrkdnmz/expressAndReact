import React from 'react';
import { useNavigate } from 'react-router-dom';

const PremiumPlan = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="profile-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2>Premium Üyeliğin</h2>
      </div>

      <div className="detail-content">
        <div className="premium-card glass-card">
          <div className="premium-header">
            <h3>Spotify Premium</h3>
            <span className="premium-badge-large">{user?.premiumStatus || 'Bireysel'}</span>
          </div>
          <p className="premium-desc">Premium ile reklamsız müziğin tadını çıkar, istediğin yerde dinle.</p>
          
          <ul className="premium-features">
            <li><i className="fa-solid fa-check"></i> Reklamsız müzik dinleme</li>
            <li><i className="fa-solid fa-check"></i> Çevrimdışı dinlemek için indir</li>
            <li><i className="fa-solid fa-check"></i> İstediğin şarkıyı çal</li>
            <li><i className="fa-solid fa-check"></i> Sınırsız atlama hakkı</li>
          </ul>

          <div className="premium-actions">
            <button className="plan-change-btn">Planı Değiştir</button>
            <button className="plan-cancel-btn">Premium'u İptal Et</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlan;
