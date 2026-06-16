import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import AlbumModal from '../components/AlbumModal';
import './Browse.css';

const BROWSE_CATEGORIES = [
  { id: 'muzik', title: 'Müzik', query: 'Music Hits', color: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&q=80' },
  { id: 'podcast', title: "Podcast'ler", query: 'Podcast Talk', color: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)', image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=150&q=80' },
  { id: 'canli', title: 'Canlı Etkinlikler', query: 'Live Concert', color: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&q=80' },
  { id: 'fitness', title: 'Fitness', query: 'Workout Gym', color: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&q=80' },
  { id: 'senin-icin', title: 'Senin İçin Hazırlandı', query: 'Chill Mix', color: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150&q=80' },
  { id: 'yeni-cikanlar', title: 'Yeni Çıkanlar', query: '2024 Hits', color: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&q=80' },
  { id: 'turkce', title: 'Türkçe', query: 'Türkçe Pop', color: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=150&q=80' },
  { id: 'pop', title: 'Pop', query: 'Pop Songs', color: 'linear-gradient(135deg, #9d174d 0%, #500724 100%)', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&q=80' },
  { id: 'hiphop', title: 'Hip Hop', query: 'Hip Hop Rap', color: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150&q=80' },
  { id: 'listeler', title: 'Listeler', query: 'Top Charts', color: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)', image: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=150&q=80' },
  { id: 'egitim', title: 'Eğitim', query: 'Classical Focus', color: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=150&q=80' },
  { id: 'belgesel', title: 'Belgesel', query: 'Ambient Cinematic', color: 'linear-gradient(135deg, #581c87 0%, #3b0764 100%)', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&q=80' },
  { id: 'komedi', title: 'Komedi', query: 'Fun Upbeat', color: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)', image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=150&q=80' },
  { id: 'populer', title: 'Popüler', query: 'Billboard Hot 100', color: 'linear-gradient(135deg, #c026d3 0%, #701a75 100%)', image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=150&q=80' }
];

const Browse = ({ setCurrentSong, user, albums, setAlbums }) => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreSongs, setGenreSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const handleSelectGenre = async (category) => {
    setSelectedGenre(category);
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/deezer/search?q=${encodeURIComponent(category.query)}`);
      setGenreSongs(res.data.tracks || []);
    } catch (err) {
      console.error("Tür şarkıları çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (e, song) => {
    e.stopPropagation();
    setSelectedSong(song);
    setModalOpen(true);
  };

  return (
    <div className="browse-page-container">
      {!selectedGenre ? (
        <>
          <h2 className="browse-heading">Hepsine göz at</h2>
          <div className="browse-grid">
            {BROWSE_CATEGORIES.map((category) => (
              <div 
                key={category.id} 
                className="genre-card" 
                style={{ background: category.color }}
                onClick={() => handleSelectGenre(category)}
              >
                <h3>{category.title}</h3>
                <img 
                  src={category.image} 
                  alt={category.title} 
                  className="genre-card-img" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="genre-detail-view animate-fade-in">
          <div className="genre-detail-header" style={{ background: selectedGenre.color }}>
            <button className="genre-back-btn" onClick={() => setSelectedGenre(null)}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="genre-header-content">
              <span className="genre-subtitle">Kategori Türü</span>
              <h1 className="genre-large-title">{selectedGenre.title}</h1>
              <p className="genre-desc">En popüler ve en yeni {selectedGenre.title} şarkıları burada keşfet.</p>
            </div>
          </div>

          <div className="genre-body">
            {loading ? (
              <LoadingSpinner fullScreen={false} />
            ) : (
              <>
                <h3 className="popular-songs-heading">Popüler Şarkılar</h3>
                {genreSongs.length === 0 ? (
                  <p className="no-genre-songs">Şarkılar yüklenirken bir hata oluştu veya şarkı bulunamadı.</p>
                ) : (
                  <div className="genre-track-list">
                    {genreSongs.map((song, index) => (
                      <div key={song.id} className="genre-track-item" onClick={() => setCurrentSong(song)}>
                        <span className="track-index">{index + 1}</span>
                        <img 
                          src={song.coverUrl} 
                          alt={song.title} 
                          className="track-cover" 
                          onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }}
                        />
                        <div className="track-info">
                          <span className="track-title">{song.title}</span>
                          <span className="track-artist">{song.artist}</span>
                        </div>
                        <div className="track-actions" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="genre-add-btn" 
                            onClick={(e) => handleAddClick(e, song)} 
                            title="Albüme Ekle"
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                          <button className="genre-play-btn" onClick={() => setCurrentSong(song)} title="Oynat">
                            <i className="fa-solid fa-play"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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

export default React.memo(Browse);
