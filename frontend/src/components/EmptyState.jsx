import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Uygulama genelinde tekrar tekrar kullanabileceğiniz esnek Boş Durum (Empty State) Bileşeni.
 * 
 * @param {Object} props
 * @param {string} props.icon - FontAwesome ikon ismi (örn: 'fa-music')
 * @param {string} props.title - Başlık
 * @param {string} props.description - Açıklama metni
 * @param {string} props.actionText - Buton metni
 * @param {string} [props.redirectPath='/songs'] - Butona tıklandığında yönlendirilecek varsayılan adres
 * @param {function} [props.onActionClick] - Özel buton tıklama fonksiyonu
 */
const EmptyState = ({ 
  icon = "fa-compact-disc", 
  title = "Burada henüz bir şey yok", 
  description = "Kitaplığınızı genişletmek veya yeni parçalar keşfetmek için göz atmaya başlayın.", 
  actionText = "Şarkı Keşfet", 
  onActionClick,
  redirectPath = "/songs" 
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onActionClick) {
      onActionClick();
    } else {
      navigate(redirectPath);
    }
  };

  return (
    <div className="empty-state-wrapper">
      <div className="empty-state-glow"></div>
      
      <div className="empty-state-icon-container">
        <i className={`fa-solid ${icon} empty-state-icon`}></i>
      </div>
      
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      
      <button className="empty-state-action-btn" onClick={handleAction}>
        <i className="fa-solid fa-compass"></i> {actionText}
      </button>
    </div>
  );
};

export default EmptyState;
