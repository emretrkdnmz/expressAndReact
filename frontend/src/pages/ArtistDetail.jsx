import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlbumModal from '../components/AlbumModal';
import LoadingSpinner from '../components/LoadingSpinner';
import './ArtistDetail.css';

const ArtistDetail = ({ setCurrentSong, setSongs, user, albums, setAlbums, favoriteArtists, setFavoriteArtists }) => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [localSongs, setLocalSongs] = useState([]);
  const [artistInfo, setArtistInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/deezer/artists/${encodeURIComponent(name)}`);
        setArtistInfo(response.data.artist);
        setLocalSongs(response.data.songs);
        if (setSongs) {
          setSongs(response.data.songs);
        }
      } catch (error) {
        console.error("Sanatçı verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchArtistData();
    }
  }, [name, setSongs]);

  const handleAddClick = (e, song) => {
    e.stopPropagation();
    setSelectedSong(song);
    setModalOpen(true);
  };

  const toggleFavoriteArtist = async () => {
    if (!artistInfo) return;
    try {
      const res = await axios.post(
        'http://localhost:5000/api/library/favorites',
        { artist: artistInfo },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (setFavoriteArtists) {
        setFavoriteArtists(res.data);
      }
    } catch (error) {
      console.error("Favori işlemi başarısız", error);
    }
  };

  const isFavorited = () => {
    if (!artistInfo || !favoriteArtists) return false;
    return favoriteArtists.some(a => a.id === artistInfo.id);
  };

  return (
    <div className="artist-detail-page-modern">
      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : (
        <>
          {artistInfo && (
            <div className="artist-header-modern" style={{ backgroundImage: `url(${artistInfo.imageUrl})` }}>
              <div className="artist-header-overlay"></div>
              <div className="artist-header-content">
                <div className="verified-badge">
                  <i className="fa-solid fa-circle-check" style={{ color: '#1db954', marginRight: '5px' }}></i>
                  <span>Spotify tarafından doğrulandı</span>
                </div>
                <h1 className="artist-large-name">{artistInfo.name}</h1>
                <p className="artist-monthly-listeners">Aylık {artistInfo.followers.toLocaleString('tr-TR')} dinleyici</p>
              </div>
            </div>
          )}

          <div className="artist-body-modern">
            <div className="artist-controls">
              <button className="artist-play-btn" onClick={() => { if(localSongs.length > 0) setCurrentSong(localSongs[0]); }}>
                <i className="fa-solid fa-play"></i>
              </button>
              
              <button 
                className={`artist-follow-btn ${isFavorited() ? 'following' : ''}`}
                onClick={toggleFavoriteArtist}
              >
                {isFavorited() ? 'Takip Ediliyor' : 'Takip Et'}
              </button>
              
              <button className="artist-more-btn">
                <i className="fa-solid fa-ellipsis"></i>
              </button>
            </div>

            <h3 className="popular-heading" style={{ marginTop: '20px' }}>Popüler Şarkılar</h3>
            {localSongs.length === 0 ? (
              <p className="no-song">Bu sanatçıya ait şarkı bulunamadı.</p>
            ) : (
              <div className="track-list-container">
                {localSongs.map((song, index) => (
                  <div key={song.id} className="track-list-item" onClick={() => setCurrentSong(song)}>
                    <span className="track-list-index">{index + 1}</span>
                    <img loading="lazy" decoding="async" src={song.coverUrl} alt={song.title} className="track-list-img" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                    <div className="track-list-info">
                      <span className="track-list-title">{song.title}</span>
                      <span className="track-list-artist">{song.artist}</span>
                    </div>
                    <div className="track-list-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="icon-btn" 
                        onClick={(e) => handleAddClick(e, song)} 
                        title="Albüme Ekle"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <i className="fa-solid fa-plus" style={{ fontSize: '16px' }}></i>
                      </button>
                      <button className="track-list-play-btn" onClick={() => setCurrentSong(song)} title="Oynat">
                        <i className="fa-solid fa-play"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <AlbumModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        song={selectedSong} 
        user={user} 
        albums={albums} 
        setAlbums={setAlbums} 
      />
    </div>
  );
};

export default ArtistDetail;
