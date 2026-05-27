import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const ArtistHoverCard = ({ artist, top, left, setCurrentSong }) => {
  const [topSongs, setTopSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchTopSongs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/deezer/artists/${encodeURIComponent(artist.name)}`);
        if (isMounted) {
           setTopSongs(res.data.songs ? res.data.songs.slice(0, 3) : []);
        }
      } catch (err) {
        console.error("Hover card fetch error", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (artist) fetchTopSongs();

    return () => { isMounted = false; };
  }, [artist]);

  return (
    <div className="artist-hover-card" style={{ top, left }}>
      <div className="hover-card-arrow"></div>
      
      <div className="hover-card-header">
        <img loading="lazy" decoding="async" src={artist.imageUrl} alt={artist.name} className="hover-card-img" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
        <div className="hover-card-title-group">
          <span className="hover-verified">
            <i className="fa-solid fa-circle-check" style={{ color: '#1db954', marginRight: '4px' }}></i>
            Sanatçı
          </span>
          <h4>{artist.name}</h4>
        </div>
      </div>

      <div className="hover-card-songs">
        {loading ? (
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner fullScreen={false} />
          </div>
        ) : topSongs.length > 0 ? (
          topSongs.map((song, index) => (
            <div key={song.id} className="hover-mini-song" onClick={() => setCurrentSong && setCurrentSong(song)}>
              <span className="hover-song-index">{index + 1}</span>
              <img loading="lazy" decoding="async" src={song.coverUrl} alt={song.title} onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
              <div className="hover-song-info">
                <span className="hover-song-title">{song.title}</span>
                <span className="hover-song-artist">{song.artist}</span>
              </div>
              <i className="fa-solid fa-play hover-play-icon"></i>
            </div>
          ))
        ) : (
          <p className="hover-no-songs">Şarkı bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default ArtistHoverCard;
