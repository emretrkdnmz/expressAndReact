import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmptyState from '../components/EmptyState';

const Albums = ({ setCurrentSong, albums, setAlbums, user }) => {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [creating, setCreating] = useState(false);

  // Gradient presets for custom cover creation
  const gradientsList = [
    { name: 'Sunset Fire', value: 'linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)' },
    { name: 'Emerald Breeze', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { name: 'Twilight Rose', value: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' },
    { name: 'Ocean Depth', value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
    { name: 'Neon Purple', value: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)' },
    { name: 'Cosmic Dust', value: 'linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)' }
  ];

  const [selectedGradient, setSelectedGradient] = useState(gradientsList[0].value);

  // Inline Rename States
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');

  // Quick Song Search States
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [quickSearchResults, setQuickSearchResults] = useState([]);
  const [quickSearchLoading, setQuickSearchLoading] = useState(false);

  const cleanAlbumName = (albumName) => {
    if (!albumName) return '';
    const prefix = user?.username ? `${user.username} - ` : '';
    if (prefix && albumName.toLowerCase().startsWith(prefix.toLowerCase())) {
      return albumName.substring(prefix.length);
    }
    return albumName;
  };

  // Debounced Quick Search
  useEffect(() => {
    if (!quickSearchQuery.trim()) {
      setQuickSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setQuickSearchLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/deezer/search?q=${encodeURIComponent(quickSearchQuery)}`);
        setQuickSearchResults(res.data.tracks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setQuickSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [quickSearchQuery]);

  // Rename Album
  const handleRenameAlbum = async (e) => {
    e.preventDefault();
    if (!editingTitleValue.trim() || !user || !user.token || !selectedAlbum) return;
    const albumId = selectedAlbum._id || selectedAlbum.id;
    try {
      const res = await axios.put(`http://localhost:5000/api/library/albums/${albumId}`, {
        name: `${user.username} - ${editingTitleValue.trim()}`
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const updated = res.data;
      setSelectedAlbum(updated);

      const updatedAlbums = albums.map(a => 
        (a._id === albumId || a.id === albumId) ? updated : a
      );
      setAlbums(updatedAlbums);
      setIsEditingTitle(false);
    } catch (error) {
      console.error(error);
      alert("Albüm ismi güncellenemedi.");
    }
  };

  // Delete Album
  const handleDeleteAlbum = async (e, albumId) => {
    e.stopPropagation();
    if (!window.confirm("Bu albümü silmek istediğinize emin misiniz?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/library/albums/${albumId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const updatedAlbums = albums.filter(a => a._id !== albumId && a.id !== albumId);
      setAlbums(updatedAlbums);
      
      if (selectedAlbum && (selectedAlbum._id === albumId || selectedAlbum.id === albumId)) {
        setSelectedAlbum(null);
      }
      
      alert("Albüm başarıyla silindi!");
    } catch (error) {
      console.error("Albüm silinirken hata:", error);
      alert(error.response?.data?.message || "Albüm silinemedi.");
    }
  };

  // Create Album
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim() || !user || !user.token) return;
    setCreating(true);

    try {
      const res = await axios.post('http://localhost:5000/api/library/albums', {
        name: `${user.username} - ${newAlbumName.trim()}`,
        coverImage: selectedGradient
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const created = res.data;
      setAlbums([...albums, created]);
      setNewAlbumName('');
      alert(`"${newAlbumName.trim()}" albümü başarıyla oluşturuldu!`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Albüm oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  // Remove Song from Album
  const handleRemoveSongFromAlbum = async (songId) => {
    if (!user || !user.token || !selectedAlbum) return;
    const albumId = selectedAlbum._id || selectedAlbum.id;
    try {
      const res = await axios.delete(`http://localhost:5000/api/library/albums/${albumId}/songs/${songId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      const updated = res.data;
      setSelectedAlbum(updated);
      
      const updatedAlbums = albums.map(a => 
        (a._id === albumId || a.id === albumId) ? updated : a
      );
      setAlbums(updatedAlbums);
    } catch (error) {
      console.error(error);
      alert("Şarkı albümden çıkarılamadı.");
    }
  };

  // Add Song to Album from Quick Search
  const handleAddSongToAlbum = async (song) => {
    if (!user || !user.token || !selectedAlbum) return;
    const albumId = selectedAlbum._id || selectedAlbum.id;
    try {
      const res = await axios.post(`http://localhost:5000/api/library/albums/${albumId}/songs`, {
        song
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const updated = res.data;
      setSelectedAlbum(updated);

      const updatedAlbums = albums.map(a => 
        (a._id === albumId || a.id === albumId) ? updated : a
      );
      setAlbums(updatedAlbums);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Şarkı albüme eklenemedi.");
    }
  };

  return (
    <div className="albums-page">
      {selectedAlbum ? (
        <div className="album-detail-view animate-fade-in">
          {/* Header Layout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(15px, 3vw, 25px)', marginBottom: 'clamp(15px, 4vw, 30px)', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                setSelectedAlbum(null);
                setIsEditingTitle(false);
                setQuickSearchQuery('');
              }} 
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              title="Geri Dön"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            
            {/* Album Cover */}
            {selectedAlbum.coverUrl && selectedAlbum.coverUrl.startsWith('linear-gradient') ? (
              <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: selectedAlbum.coverUrl, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', flexShrink: 0 }}>
                <i className="fa-solid fa-compact-disc" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '36px' }}></i>
              </div>
            ) : (
              <img src={selectedAlbum.coverUrl || "/default-cover.svg"} alt={selectedAlbum.name} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', flexShrink: 0 }} onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
            )}

            {/* Title & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 }}>
              {isEditingTitle ? (
                <form onSubmit={handleRenameAlbum} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="text"
                    value={editingTitleValue}
                    onChange={(e) => setEditingTitleValue(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      color: '#fff',
                      fontSize: 'clamp(16px, 4vw, 24px)',
                      fontWeight: 800,
                      fontFamily: "'Outfit', sans-serif",
                      outline: 'none',
                      width: '100%',
                      maxWidth: '300px'
                    }}
                    autoFocus
                    required
                  />
                  <button type="submit" style={{ background: 'var(--accent-color)', border: 'none', color: '#000', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Kaydet</button>
                  <button type="button" onClick={() => setIsEditingTitle(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>İptal</button>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ 
                    margin: 0, 
                    fontFamily: "'Outfit', sans-serif", 
                    fontWeight: 800,
                    fontSize: 'clamp(20px, 4.5vw, 32px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0
                  }}>
                    {cleanAlbumName(selectedAlbum.name)}
                  </h2>
                  <button 
                    onClick={() => {
                      setEditingTitleValue(cleanAlbumName(selectedAlbum.name));
                      setIsEditingTitle(true);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#a7a7a7', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Albümü Yeniden Adlandır"
                  >
                    <i className="fa-solid fa-pen" style={{ fontSize: '14px' }}></i>
                  </button>
                </div>
              )}
              <span style={{ fontSize: '13px', color: '#a7a7a7' }}>{selectedAlbum.songs ? selectedAlbum.songs.length : 0} Şarkı • Albüm Sahibi: {user?.username}</span>
            </div>

            <button 
              onClick={(e) => handleDeleteAlbum(e, selectedAlbum._id || selectedAlbum.id)}
              style={{ background: '#ff4d4d', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', flexShrink: 0, marginLeft: 'auto' }}
            >
              <i className="fa-solid fa-trash"></i> Albümü Sil
            </button>
          </div>

          {selectedAlbum.songs && selectedAlbum.songs.length > 0 ? (
            <div className="track-list-container">
              {selectedAlbum.songs.map((song, index) => (
                <div key={song._id || song.id} className="track-list-item" onClick={() => setCurrentSong(song)}>
                  <span className="track-list-index">{index + 1}</span>
                  <img loading="lazy" decoding="async" src={song.coverUrl} alt={song.title} className="track-list-img" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                  <div className="track-list-info">
                    <span className="track-list-title">{song.title}</span>
                    <span className="track-list-artist">{song.artist}</span>
                  </div>
                  <div className="track-list-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleRemoveSongFromAlbum(song.id || song._id)}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', transition: 'color 0.2s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                      title="Albümden Çıkar"
                    >
                      <i className="fa-solid fa-xmark" style={{ fontSize: '16px' }}></i>
                    </button>
                    <button className="track-list-play-btn" title="Oynat" onClick={() => setCurrentSong(song)}>
                      <i className="fa-solid fa-play"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon="fa-music"
              title="Bu Albümde Şarkı Yok"
              description="Albümün şu an tamamen boş. Şarkıların yanındaki (+) butonuna basarak bu albüme parçalar ekleyebilirsin!"
              actionText="Kitaplığa Dön"
              onActionClick={() => setSelectedAlbum(null)}
            />
          )}

          {/* Quick Add Song Panel */}
          <div style={{ marginTop: '40px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: 'clamp(15px, 4vw, 25px)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--accent-color)' }}></i> Albüme Hızlıca Şarkı Ekle
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#a7a7a7' }}>Albüme anında yeni şarkı eklemek için arama kelimesini yazın.</p>
            
            <div className="admin-input-wrapper" style={{ margin: '0 0 20px 0', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '6px 15px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '350px' }}>
              <i className="fa-solid fa-search" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}></i>
              <input 
                type="text" 
                placeholder="Şarkı veya sanatçı adı..." 
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', padding: '4px 0', width: '100%' }}
              />
            </div>

            {quickSearchLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#a7a7a7' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ color: 'var(--accent-color)' }}></i>
                <span>Aranıyor...</span>
              </div>
            )}

            {!quickSearchLoading && quickSearchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                {quickSearchResults.map(song => {
                  const isAlreadyAdded = selectedAlbum.songs && selectedAlbum.songs.some(s => s.id === song.id || s._id === song.id);
                  
                  return (
                    <div 
                      key={song.id || song._id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '8px 12px', 
                        borderRadius: '10px', 
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      <img src={song.coverUrl} alt={song.title} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</span>
                        <span style={{ fontSize: '11px', color: '#a7a7a7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</span>
                      </div>
                      <button
                        onClick={() => !isAlreadyAdded && handleAddSongToAlbum(song)}
                        disabled={isAlreadyAdded}
                        style={{
                          background: isAlreadyAdded ? 'transparent' : 'var(--accent-color)',
                          border: isAlreadyAdded ? '1px solid rgba(255,255,255,0.1)' : 'none',
                          color: isAlreadyAdded ? '#a7a7a7' : '#000',
                          padding: '6px 12px',
                          borderRadius: '15px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: isAlreadyAdded ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isAlreadyAdded ? (
                          <>
                            <i className="fa-solid fa-check"></i> Eklendi
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-plus"></i> Ekle
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {!quickSearchLoading && quickSearchQuery.trim() && quickSearchResults.length === 0 && (
              <span style={{ fontSize: '13px', color: '#a7a7a7' }}>Eşleşen şarkı bulunamadı.</span>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="albums-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '15px' }}>
            <h2 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>Senin Albümlerin</h2>
            
            {/* Inline Album Creation Form with Gradient Cover Picker */}
            <form onSubmit={handleCreateAlbum} className="create-album-inline-form" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' }}>
              
              {/* Gradient Picker */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '11px', color: '#a0a0b0', marginRight: '3px' }}>Tema:</span>
                {gradientsList.map((grad, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedGradient(grad.value)}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: grad.value,
                      border: selectedGradient === grad.value ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      padding: 0,
                      transform: selectedGradient === grad.value ? 'scale(1.25)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedGradient === grad.value ? '0 0 10px rgba(255,255,255,0.4)' : 'none'
                    }}
                    title={grad.name}
                  />
                ))}
              </div>

              <div className="admin-input-wrapper" style={{ margin: 0, background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '4px 15px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-folder-plus" style={{ color: 'var(--accent-color)', fontSize: '14px' }}></i>
                <input 
                  type="text" 
                  placeholder="Yeni Albüm Adı..." 
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', padding: '4px 0', width: '160px' }}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="empty-state-action-btn" 
                style={{ padding: '8px 18px', fontSize: '12px', margin: 0, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--accent-color)', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                disabled={creating}
              >
                {creating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-plus"></i>}
                Oluştur
              </button>
            </form>
          </div>

          {albums.length > 0 ? (
            <div className="album-list-container animate-fade-in">
              {albums.map(album => (
                <div key={album._id || album.id} className="album-list-item" onClick={() => setSelectedAlbum(album)}>
                  {album.coverUrl && album.coverUrl.startsWith('linear-gradient') ? (
                    <div className="album-list-img" style={{ background: album.coverUrl, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-compact-disc" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '24px' }}></i>
                    </div>
                  ) : (
                    <img loading="lazy" decoding="async" src={album.coverUrl || "/default-cover.svg"} alt={album.name} className="album-list-img" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                  )}
                  
                  <div className="album-list-info">
                    <span className="album-list-name">{cleanAlbumName(album.name)}</span>
                    <span className="album-list-count">{album.songs ? album.songs.length : 0} Şarkı</span>
                  </div>
                  <div className="album-list-actions" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => handleDeleteAlbum(e, album._id || album.id)}
                      className="album-list-delete-btn"
                      title="Albümü Sil"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                    <i className="fa-solid fa-chevron-right album-list-chevron"></i>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon="fa-compact-disc"
              title="Henüz Bir Albüm Oluşturmadın"
              description="Kitaplığında hiç çalma listesi bulunmuyor. Hemen yukarıdaki panelden ilk albümünü şık gradyanlarla oluşturabilir ya da şarkı kartlarının yanındaki (+) butonunu kullanabilirsin!"
              actionText="Yeni Parçalar Keşfet"
              redirectPath="/songs"
            />
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(Albums);
