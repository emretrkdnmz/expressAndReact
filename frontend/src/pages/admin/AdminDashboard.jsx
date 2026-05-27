import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = ({ user, handleLogout }) => {
  const navigate = useNavigate();

  // Tab State ('users' or 'announcements')
  const [activeTab, setActiveTab] = useState('users');

  // Stats States
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    adminUsers: 0,
    totalAnnouncements: 0,
    totalSongs: 0,
    serverUptime: 0,
    memoryUsage: 0
  });

  // Users States
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [premiumFilter, setPremiumFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Announcements States
  const [announcements, setAnnouncements] = useState([]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeMessage, setNewNoticeMessage] = useState('');
  const [newNoticeType, setNewNoticeType] = useState('info');

  // Modals States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form Fields for Add User
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addPremiumStatus, setAddPremiumStatus] = useState('Free');
  const [addIsAdmin, setAddIsAdmin] = useState(false);

  // Form Fields for Edit User
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPremiumStatus, setEditPremiumStatus] = useState('Free');
  const [editIsAdmin, setEditIsAdmin] = useState(false);

  // Auth Header Helper
  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${user?.token}` }
  });

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', getHeaders());
      setStats(res.data);
    } catch (err) {
      console.error('Stats fetch failed:', err);
    }
  };

  // Fetch Registered Users
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (premiumFilter !== 'All') params.append('premium', premiumFilter);
      if (roleFilter !== 'All') params.append('role', roleFilter.toLowerCase());

      const res = await axios.get(`http://localhost:5000/api/admin/users?${params.toString()}`, getHeaders());
      setUsers(res.data);
    } catch (err) {
      console.error('Users fetch failed:', err);
    }
  };

  // Fetch Announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/announcements', getHeaders());
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Announcements fetch failed:', err);
    }
  };

  // Initial Load
  useEffect(() => {
    if (user?.isAdmin) {
      fetchStats();
      fetchUsers();
      fetchAnnouncements();
    } else {
      navigate('/songs'); // Redirect unauthorized users
    }
  }, [user, searchQuery, premiumFilter, roleFilter]);

  // Create User Handler
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/admin/users',
        {
          username: addUsername,
          email: addEmail,
          password: addPassword,
          premiumStatus: addPremiumStatus,
          isAdmin: addIsAdmin
        },
        getHeaders()
      );

      // Reset fields
      setAddUsername('');
      setAddEmail('');
      setAddPassword('');
      setAddPremiumStatus('Free');
      setAddIsAdmin(false);

      setIsAddUserModalOpen(false);
      alert('Kullanıcı başarıyla oluşturuldu.');
      
      // Refresh
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Kullanıcı eklenirken bir hata oluştu.');
    }
  };

  // Edit Trigger
  const openEditModal = (targetUser) => {
    setSelectedUser(targetUser);
    setEditUsername(targetUser.username);
    setEditEmail(targetUser.email);
    setEditPassword('');
    setEditPremiumStatus(targetUser.premiumStatus);
    setEditIsAdmin(targetUser.isAdmin);
    setIsEditUserModalOpen(true);
  };

  // Edit User Handler
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: editUsername,
        email: editEmail,
        premiumStatus: editPremiumStatus,
        isAdmin: editIsAdmin
      };
      if (editPassword) payload.password = editPassword;

      await axios.put(`http://localhost:5000/api/admin/users/${selectedUser._id}`, payload, getHeaders());

      setIsEditUserModalOpen(false);
      alert('Kullanıcı başarıyla güncellendi.');
      
      // Refresh
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Kullanıcı güncellenirken hata oluştu.');
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('Bu kullanıcıyı tamamen silmek istediğinize emin misiniz?\nTüm çalma geçmişi ve kütüphane verileri kalıcı olarak yok edilecektir!');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, getHeaders());
      alert('Kullanıcı başarıyla silindi.');
      
      // Refresh
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Kullanıcı silinemedi.');
    }
  };

  // Compose Announcement Handler
  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/admin/announcements',
        {
          title: newNoticeTitle,
          message: newNoticeMessage,
          type: newNoticeType
        },
        getHeaders()
      );

      setNewNoticeTitle('');
      setNewNoticeMessage('');
      setNewNoticeType('info');

      alert('Duyuru başarıyla yayınlandı!');
      
      // Refresh
      fetchAnnouncements();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Duyuru yayınlanırken hata oluştu.');
    }
  };

  // Delete Announcement Handler
  const handleDeleteAnnouncement = async (noticeId) => {
    const confirmDelete = window.confirm('Bu duyuruyu kaldırmak istediğinize emin misiniz?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/announcements/${noticeId}`, getHeaders());
      
      // Refresh
      fetchAnnouncements();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Duyuru kaldırılamadı.');
    }
  };

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const parts = [];
    if (d > 0) parts.push(`${d} gün`);
    if (h > 0) parts.push(`${h} saat`);
    if (m > 0) parts.push(`${m} dk`);
    if (s > 0) parts.push(`${s} sn`);
    
    return parts.join(' ') || '0 sn';
  };

  return (
    <div className="admin-dashboard-container">
      
      {/* 1. HEADER ROW */}
      <div className="admin-header-row">
        <div className="admin-header-title-group">
          <h1><i className="fa-solid fa-gauge-high"></i> Yönetim Kontrol Merkezi</h1>
          <p>
            Hoş geldiniz, **{user?.username}** 
            <span className="server-status-pill">
              <span className="server-status-dot"></span> Sunucu Çevrimiçi
            </span>
          </p>
        </div>
        <div className="admin-header-actions">
          <button className="admin-exit-btn" onClick={() => navigate('/songs')}>
            <i className="fa-solid fa-house"></i> Uygulamaya Dön
          </button>
          <button className="premium-cancel-btn" onClick={handleLogout}>
            <i className="fa-solid fa-power-off"></i> Çıkış Yap
          </button>
        </div>
      </div>

      {/* 2. STATS ANALYTICS TILES */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-card-icon"><i className="fa-solid fa-users"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-number">{stats.totalUsers}</span>
            <span className="stat-card-label">Toplam Kayıtlı Üye</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-card-icon" style={{color: '#ffd700', borderColor: 'rgba(255,215,0,0.25)', background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(200,160,0,0.15) 100%)'}}><i className="fa-solid fa-crown"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-number">{stats.premiumUsers}</span>
            <span className="stat-card-label">Premium Üye</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-card-icon" style={{color: '#1db954', borderColor: 'rgba(29,185,84,0.25)', background: 'linear-gradient(135deg, rgba(29,185,84,0.15) 0%, rgba(20,120,60,0.15) 100%)'}}><i className="fa-solid fa-music"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-number">{stats.totalSongs}</span>
            <span className="stat-card-label">Parça Sayısı</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-card-icon" style={{color: '#3b82f6', borderColor: 'rgba(59,130,246,0.25)', background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(30,80,180,0.15) 100%)'}}><i className="fa-solid fa-bullhorn"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-number">{stats.totalAnnouncements}</span>
            <span className="stat-card-label">Yayınlanan Bildirim</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-card-icon" style={{color: '#a7a7a7', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)'}}><i className="fa-solid fa-server"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-number" style={{fontSize: '14.5px', fontWeight: 'bold'}}>{formatUptime(stats.serverUptime)}</span>
            <span className="stat-card-label">Sunucu Çalışma Süresi</span>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="admin-tab-nav">
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fa-solid fa-users-gear"></i> Kullanıcı Yönetimi
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'announcements' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          <i className="fa-solid fa-bullhorn"></i> Genel Bildirim/Duyuru Paneli
        </button>
      </div>

      {/* 4. ACTIVE SUB-VIEW CONTENT */}
      {activeTab === 'users' ? (
        /* ========================================================
           USERS MANAGEMENT SCREEN
           ======================================================== */
        <div className="admin-users-section">
          {/* Filters controls */}
          <div className="users-control-row">
            <div className="users-filters">
              <div className="search-input-wrapper">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  placeholder="Kullanıcı adı veya e-posta ara..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Premium Plan filter */}
              <select 
                className="filter-select"
                value={premiumFilter}
                onChange={(e) => setPremiumFilter(e.target.value)}
              >
                <option value="All">Tüm Üyelik Plânları</option>
                <option value="Free">Bireysel Ücretsiz</option>
                <option value="Premium">Spotify Premium</option>
              </select>

              {/* Roles filter */}
              <select 
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="All">Tüm Roller</option>
                <option value="User">Standart Üyeler</option>
                <option value="Admin">Yöneticiler (Admin)</option>
              </select>
            </div>

            <button className="add-user-trigger-btn" onClick={() => setIsAddUserModalOpen(true)}>
              <i className="fa-solid fa-user-plus"></i> Yeni Kullanıcı Ekle
            </button>
          </div>

          {/* Data table displaying users */}
          <div className="admin-table-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Kullanıcı / Bilgiler</th>
                  <th>E-Posta Adresi</th>
                  <th>Plân Durumu</th>
                  <th>Kayıt Tarihi</th>
                  <th style={{textAlign: 'center'}}>Eylemler</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-row-meta">
                          <img loading="lazy" decoding="async" src={u.profilePicture || '/default-profile.svg'} alt={u.username} className="user-row-avatar" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                          <div className="user-row-name-group">
                            <span className="user-row-username">{u.username}</span>
                            {u.isAdmin && <span className="user-row-role-tag">Sistem Yöneticisi</span>}
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        {u.premiumStatus === 'Premium' ? (
                          <span className="badge-premium-pill">Premium</span>
                        ) : (
                          <span className="badge-free-pill">Ücretsiz</span>
                        )}
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'})}</td>
                      <td>
                        <div className="admin-action-btn-group" style={{justifyContent: 'center'}}>
                          <button className="table-edit-btn" onClick={() => openEditModal(u)} title="Düzenle">
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button className="table-delete-btn" onClick={() => handleDeleteUser(u._id)} title="Sil">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#a7a7a7'}}>Filtrelere uygun kullanıcı bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================
           ANNOUNCEMENTS COMPOSER AND LIST SCREEN
           ======================================================== */
        <div className="announcements-workspace">
          {/* Announcement composer */}
          <div className="composer-box">
            <h3><i className="fa-solid fa-feather-pointed"></i> Yeni Bildirim Yayınla</h3>
            <form onSubmit={handlePublishAnnouncement} className="composer-form">
              <div className="composer-group">
                <label htmlFor="announcementTitleInput">Duyuru Başlığı</label>
                <input 
                  id="announcementTitleInput"
                  type="text" 
                  placeholder="Örn: Hafta Sonu Sistem Bakımı Hakkında" 
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  required
                />
              </div>

              <div className="composer-group">
                <label htmlFor="announcementTypeInput">Duyuru Türü / Derecesi</label>
                <select 
                  id="announcementTypeInput"
                  value={newNoticeType} 
                  onChange={(e) => setNewNoticeType(e.target.value)}
                >
                  <option value="info">Bilgi (Info - Mor)</option>
                  <option value="warning">Uyarı (Warning - Sarı)</option>
                  <option value="success">Güncelleme / Başarı (Success - Yeşil)</option>
                </select>
              </div>

              <div className="composer-group">
                <label htmlFor="announcementMessageInput">Duyuru İçeriği</label>
                <textarea 
                  id="announcementMessageInput"
                  placeholder="Tüm kullanıcılara göndermek istediğiniz bildirim mesajını buraya yazın..."
                  value={newNoticeMessage}
                  onChange={(e) => setNewNoticeMessage(e.target.value)}
                  required
                />
              </div>

              <button className="publish-submit-btn" type="submit">
                <i className="fa-solid fa-paper-plane"></i> Bildirimi Herkese Yayınla
              </button>
            </form>
          </div>

          {/* List of active announcements */}
          <div className="notices-history-box">
            <h3>Yayınlanmış Aktif Duyurular ({announcements.length})</h3>
            <div className="notices-list">
              {announcements.length > 0 ? (
                announcements.map(n => (
                  <div key={n._id} className={`notice-card-item type-${n.type}`}>
                    <div className="notice-icon-indicator">
                      {n.type === 'warning' && <i className="fa-solid fa-circle-exclamation"></i>}
                      {n.type === 'success' && <i className="fa-solid fa-circle-check"></i>}
                      {n.type === 'info' && <i className="fa-solid fa-circle-info"></i>}
                    </div>
                    
                    <div className="notice-body">
                      <h4>{n.title}</h4>
                      <p>{n.message}</p>
                      <div className="notice-meta-details">
                        <span><i className="fa-solid fa-user-pen"></i> {n.publishedBy?.username || 'Yönetici'}</span>
                        <span><i className="fa-solid fa-clock"></i> {new Date(n.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>

                    <button 
                      className="notice-delete-action-btn" 
                      onClick={() => handleDeleteAnnouncement(n._id)}
                      title="Kaldır"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ))
              ) : (
                <div style={{textAlign: 'center', padding: '30px', color: '#a7a7a7'}}>
                  <i className="fa-solid fa-bullhorn" style={{fontSize: '32px', opacity: 0.3, marginBottom: '12px'}}></i>
                  <p style={{margin: 0, fontSize: '13px'}}>Henüz sistem duyurusu yayınlanmadı.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
         MODAL: ADD NEW USER
         ======================================================== */}
      {isAddUserModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddUserModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <h3><i className="fa-solid fa-user-plus" style={{color: '#a855f7'}}></i> Yeni Kullanıcı Ekle</h3>
            
            <form onSubmit={handleAddUserSubmit} className="admin-modal-form">
              <div className="composer-group">
                <label htmlFor="addUsernameInput">Kullanıcı Adı</label>
                <input 
                  id="addUsernameInput"
                  type="text" 
                  placeholder="Örn: ahmet_spotify"
                  value={addUsername}
                  onChange={(e) => setAddUsername(e.target.value)}
                  required
                />
              </div>

              <div className="composer-group">
                <label htmlFor="addEmailInput">E-Posta Adresi</label>
                <input 
                  id="addEmailInput"
                  type="email" 
                  placeholder="ornek@spotify.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  required
                />
              </div>

              <div className="composer-group">
                <label htmlFor="addPasswordInput">Şifre</label>
                <input 
                  id="addPasswordInput"
                  type="password" 
                  placeholder="••••••••"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  required
                />
              </div>

              <div className="admin-modal-row">
                <div className="composer-group">
                  <label htmlFor="addPlanSelect">Plân Durumu</label>
                  <select 
                    id="addPlanSelect"
                    value={addPremiumStatus}
                    onChange={(e) => setAddPremiumStatus(e.target.value)}
                  >
                    <option value="Free">Bireysel Ücretsiz</option>
                    <option value="Premium">Spotify Premium</option>
                  </select>
                </div>

                <div className="composer-group">
                  <label htmlFor="addAdminSelect">Yönetici Yetkisi</label>
                  <select 
                    id="addAdminSelect"
                    value={addIsAdmin ? "true" : "false"}
                    onChange={(e) => setAddIsAdmin(e.target.value === "true")}
                  >
                    <option value="false">Standart Üye</option>
                    <option value="true">Yönetici (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsAddUserModalOpen(false)}>Vazgeç</button>
                <button type="submit" className="modal-save-btn">Kullanıcı Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
         MODAL: EDIT USER
         ======================================================== */}
      {isEditUserModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsEditUserModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <h3><i className="fa-solid fa-user-pen" style={{color: '#3b82f6'}}></i> Kullanıcı Bilgilerini Düzenle</h3>
            
            <form onSubmit={handleEditUserSubmit} className="admin-modal-form">
              <div className="composer-group">
                <label htmlFor="editUsernameInput">Kullanıcı Adı</label>
                <input 
                  id="editUsernameInput"
                  type="text" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                />
              </div>

              <div className="composer-group">
                <label htmlFor="editEmailInput">E-Posta Adresi</label>
                <input 
                  id="editEmailInput"
                  type="email" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>

              <div className="composer-group">
                <label htmlFor="editPasswordInput">Şifre (Değiştirmek İstemiyorsanız Boş Bırakın)</label>
                <input 
                  id="editPasswordInput"
                  type="password" 
                  placeholder="Mevcut şifreyi koru"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>

              <div className="admin-modal-row">
                <div className="composer-group">
                  <label htmlFor="editPlanSelect">Plân Durumu</label>
                  <select 
                    id="editPlanSelect"
                    value={editPremiumStatus}
                    onChange={(e) => setEditPremiumStatus(e.target.value)}
                  >
                    <option value="Free">Bireysel Ücretsiz</option>
                    <option value="Premium">Spotify Premium</option>
                  </select>
                </div>

                <div className="composer-group">
                  <label htmlFor="editAdminSelect">Yönetici Yetkisi</label>
                  <select 
                    id="editAdminSelect"
                    value={editIsAdmin ? "true" : "false"}
                    onChange={(e) => setEditIsAdmin(e.target.value === "true")}
                  >
                    <option value="false">Standart Üye</option>
                    <option value="true">Yönetici (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setIsEditUserModalOpen(false)}>Vazgeç</button>
                <button type="submit" className="modal-save-btn">Değişiklikleri Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
