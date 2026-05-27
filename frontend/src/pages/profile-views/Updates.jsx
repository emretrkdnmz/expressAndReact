import React from 'react';
import { useNavigate } from 'react-router-dom';

const Updates = () => {
  const navigate = useNavigate();

  const updatesList = [
    { id: 1, title: 'Yeni Profil Tasarımı Yayında!', date: 'Bugün', desc: 'Artık hesabını yönetmek çok daha kolay ve şık.' },
    { id: 2, title: 'Arama Geçmişi Özelliği', date: 'Dün', desc: 'Aradığın şarkılar artık doğrudan bulutta saklanıyor.' },
    { id: 3, title: 'Performans İyileştirmeleri', date: '3 gün önce', desc: 'Müzik çalar barı artık sayfa kaydırmalarını engellemiyor.' }
  ];

  return (
    <div className="profile-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2>Güncellemelerin</h2>
      </div>

      <div className="detail-content">
        <div className="timeline">
          {updatesList.map(update => (
            <div className="timeline-item glass-card" key={update.id}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-date">{update.date}</span>
                <h3>{update.title}</h3>
                <p>{update.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Updates;
