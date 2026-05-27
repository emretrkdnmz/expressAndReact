import React, { useState } from 'react';
import axios from 'axios';

const AlbumModal = ({ isOpen, onClose, song, user, albums, setAlbums }) => {
  const [newAlbumName, setNewAlbumName] = useState('');

  const cleanAlbumName = (albumName) => {
    if (!albumName) return '';
    const prefix = user?.username ? `${user.username} - ` : '';
    if (prefix && albumName.toLowerCase().startsWith(prefix.toLowerCase())) {
      return albumName.substring(prefix.length);
    }
    return albumName;
  };

  if (!isOpen || !song) return null;

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumName.trim()) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/api/library/albums',
        { name: newAlbumName },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAlbums([...albums, res.data]);
      setNewAlbumName('');
      
      // Albüm oluşturur oluşturmaz o albüme şarkıyı ekle
      await handleAddToAlbum(res.data._id || res.data.id);
    } catch (error) {
      console.error("Albüm oluşturulamadı:", error);
      alert("Albüm oluşturulurken bir hata oluştu.");
    }
  };

  const handleAddToAlbum = async (albumId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/library/albums/${albumId}/songs`,
        { song },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Albüm listesini güncelle
      const updatedAlbums = albums.map(a => 
        (a._id === albumId || a.id === albumId) ? res.data : a
      );
      setAlbums(updatedAlbums);
      alert('Şarkı albüme eklendi!');
      onClose();
    } catch (error) {
      console.error("Şarkı albüme eklenemedi:", error);
      alert(error.response?.data?.message || "Şarkı albüme eklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Albüme Ekle</h3>
        
        <form onSubmit={handleCreateAlbum} className="create-album-form">
          <input 
            type="text" 
            placeholder="Yeni albüm adı..." 
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
          />
          <button type="submit">Oluştur & Ekle</button>
        </form>

        {albums.length > 0 && (
          <div className="album-list">
            <p style={{marginBottom: '10px', fontSize: '14px', color: '#a7a7a7'}}>Mevcut Albümler:</p>
            {albums.map(album => (
              <div key={album._id || album.id} className="album-list-item" onClick={() => handleAddToAlbum(album._id || album.id)}>
                <img loading="lazy" decoding="async" src={album.coverUrl} alt="Album Cover"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <span style={{fontWeight: 'bold', fontSize: '15px'}}>{cleanAlbumName(album.name)}</span>
                  <span style={{fontSize: '12px', color: '#a7a7a7'}}>{album.songs ? album.songs.length : 0} şarkı</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="modal-close-btn" onClick={onClose}>Kapat</button>
      </div>
    </div>
  );
};

export default AlbumModal;
