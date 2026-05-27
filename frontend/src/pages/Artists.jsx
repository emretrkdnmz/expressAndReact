import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const Artists = ({ user, favoriteArtists, setFavoriteArtists }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        // Backend proxy endpoint
        const response = await axios.get('http://localhost:5000/api/deezer/artists');
        setArtists(response.data);
      } catch (error) {
        console.error("Sanatçılar yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const toggleFavoriteArtist = useCallback(async (e, artist) => {
    e.stopPropagation();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/library/favorites',
        { artist },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      if (setFavoriteArtists) {
        setFavoriteArtists(res.data);
      }
    } catch (error) {
      console.error("Favori işlemi başarısız", error);
    }
  }, [user, setFavoriteArtists]);

const ArtistCard = React.memo(({ artist, isFavorited, onToggleFavorite, onClick }) => {
  return (
    <div className="artist-card" onClick={() => onClick(artist.name)}>
      <div className="card-actions">
        <button 
          className={`icon-btn ${isFavorited ? 'active-heart' : ''}`} 
          onClick={(e) => onToggleFavorite(e, artist)}
          title="Favorilere Ekle"
        >
          <i className={`fa-${isFavorited ? 'solid' : 'regular'} fa-heart`}></i>
        </button>
      </div>
      <div className="artist-image-wrapper">
        <img loading="lazy" decoding="async" src={artist.imageUrl} alt={artist.name} className="artist-image circle"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
      </div>
      <div className="artist-info">
        <h4>{artist.name}</h4>
      </div>
    </div>
  );
});

  const isFavorited = useCallback((artistId) => {
    return favoriteArtists && favoriteArtists.some(a => a.id === artistId);
  }, [favoriteArtists]);

  const handleNavigate = useCallback((name) => {
    navigate(`/artist/${encodeURIComponent(name)}`);
  }, [navigate]);

  return (
    <div className="artists-page">
      <h2>Sanatçılar</h2>
      
      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : (
        <div className="artist-grid">
          {artists.map((artist) => (
            <ArtistCard 
              key={artist.id} 
              artist={artist} 
              isFavorited={isFavorited(artist.id)} 
              onToggleFavorite={toggleFavoriteArtist} 
              onClick={handleNavigate} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Artists;
