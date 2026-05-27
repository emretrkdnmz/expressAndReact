import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AccountSettings = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('http://localhost:5000/api/user/profile', 
        { username },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const updatedUser = { ...user, username: res.data.username };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setSuccessMsg('Kullanıcı adı başarıyla güncellendi!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="profile-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2>Hesap Genel Görünümü</h2>
      </div>

      <div className="detail-content">
        <div className="glass-card">
          <h3>Profili Düzenle</h3>
          {successMsg && <div className="success-msg">{successMsg}</div>}
          <form onSubmit={handleSave} className="account-form">
            <div className="input-group">
              <label>E-posta adresi</label>
              <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              <small style={{color: '#a7a7a7', fontSize: '12px'}}>E-posta adresi şu anda değiştirilemez.</small>
            </div>
            <div className="input-group">
              <label>Kullanıcı Adı</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
            <button type="submit" className="save-btn">Profili Kaydet</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
