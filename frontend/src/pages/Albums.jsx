import React, { useState } from 'react';
import axios from 'axios';

const Albums = ({ setCurrentSong, albums, setAlbums, user }) => {
  const [selectedAlbum, setSelectedAlbum] = useState(null);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
            <button 
              onClick={() => setSelectedAlbum(null)} 
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h2 style={{ margin: 0, flex: 1 }}>{selectedAlbum.name}</h2>
            <button 
              onClick={(e) => handleDeleteAlbum(e, selectedAlbum._id || selectedAlbum.id)}
              style={{ background: '#ff4d4d', border: 'none', color: '#fff', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <i className="fa-solid fa-trash" style={{marginRight: '5px'}}></i> Sil
            </button>
          </div>

          {selectedAlbum.songs && selectedAlbum.songs.length > 0 ? (
            <div className="song-grid">
              {selectedAlbum.songs.map((song) => (
                <div key={song._id || song.id} className="song-card" onClick={() => setCurrentSong(song)}>
                  <div className="card-image-wrapper">
                    <img loading="lazy" decoding="async" src={song.coverUrl} alt={song.title} className="card-image square"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                    <div className="card-play-overlay">
                      <div className="play-bg-circle">
                        <i className="fa-solid fa-play"></i>
                      </div>
                    </div>
                  </div>
                  <div className="card-info">
                    <h4>{song.title}</h4>
                    <p>{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-song">Bu albümde henüz hiç şarkı yok.</p>
          )}
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: '20px' }}>Senin Albümlerin</h2>
          {albums.length > 0 ? (
            <div className="song-grid">
              {albums.map(album => (
                <div key={album._id || album.id} className="song-card" onClick={() => setSelectedAlbum(album)} style={{textAlign: 'center', position: 'relative'}}>
                  
                  <button 
                    onClick={(e) => handleDeleteAlbum(e, album._id || album.id)}
                    className="delete-album-btn"
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,0,0,0.8)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'none' }}
                    title="Albümü Sil"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>

                  <div className="card-image-wrapper">
                    <img loading="lazy" decoding="async" src={album.coverUrl} alt={album.name} className="card-image square"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                  </div>
                  <div className="card-info" style={{marginTop: '10px'}}>
                    <h4 style={{fontSize: '16px', fontWeight: 'bold'}}>{album.name}</h4>
                    <p style={{fontSize: '12px', color: '#a7a7a7', marginTop: '5px'}}>{album.songs ? album.songs.length : 0} şarkı</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-song">Henüz bir albüm oluşturmadın. Şarkıların yanındaki (+) butonuna basarak albüm oluşturabilirsin.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Albums;
