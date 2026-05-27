import React, { useState } from 'react';
import axios from 'axios';

const Albums = ({ setCurrentSong, albums, setAlbums, user }) => {
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const cleanAlbumName = (albumName) => {
    if (!albumName) return '';
    const prefix = user?.username ? `${user.username} - ` : '';
    if (prefix && albumName.toLowerCase().startsWith(prefix.toLowerCase())) {
      return albumName.substring(prefix.length);
    }
    return albumName;
  };

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

  return (
    <div className="albums-page">
      {selectedAlbum ? (
        <div className="album-detail-view">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3vw, 20px)', marginBottom: 'clamp(15px, 4vw, 30px)' }}>
            <button 
              onClick={() => setSelectedAlbum(null)} 
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h2 style={{ 
              margin: 0, 
              flex: 1, 
              fontFamily: "'Outfit', sans-serif", 
              fontWeight: 800,
              fontSize: 'clamp(18px, 4.5vw, 28px)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0
            }}>
              {cleanAlbumName(selectedAlbum.name)}
            </h2>
            <button 
              onClick={(e) => handleDeleteAlbum(e, selectedAlbum._id || selectedAlbum.id)}
              style={{ background: '#ff4d4d', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', flexShrink: 0 }}
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
                  <div className="track-list-actions">
                    <button className="track-list-play-btn" title="Oynat">
                      <i className="fa-solid fa-play"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-song" style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Bu albümde henüz hiç şarkı yok.</p>
          )}
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: '25px', fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>Senin Albümlerin</h2>
          {albums.length > 0 ? (
            <div className="album-list-container">
              {albums.map(album => (
                <div key={album._id || album.id} className="album-list-item" onClick={() => setSelectedAlbum(album)}>
                  <img loading="lazy" decoding="async" src={album.coverUrl || "/default-cover.svg"} alt={album.name} className="album-list-img" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                  <div className="album-list-info">
                    <span className="album-list-name">{cleanAlbumName(album.name)}</span>
                    <span className="album-list-count">{album.songs ? album.songs.length : 0} şarkı</span>
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
            <p className="no-song" style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px', lineHeight: '1.6' }}>Henüz bir albüm oluşturmadın. Şarkıların yanındaki (+) butonuna basarak albüm oluşturabilirsin.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Albums;
