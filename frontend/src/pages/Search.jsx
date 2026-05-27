import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AlbumModal from '../components/AlbumModal';

import LoadingSpinner from '../components/LoadingSpinner';

const Search = ({ setCurrentSong, setSongs, user, favoriteArtists, setFavoriteArtists, albums, setAlbums }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tracks: [], artists: [], users: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const [searchHistory, setSearchHistory] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(user?.followedUsers || []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/search-history', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setSearchHistory(res.data);
      } catch (error) {
        console.error('Arama geçmişi alınamadı:', error);
      }
    };
    // Profil bilgisini de güncel olarak çekip takip edilenleri ayarlayabiliriz
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setFollowedUsers(res.data.followedUsers || []);
      } catch (error) {
        console.error('Profil alınamadı', error);
      }
    };
    fetchHistory();
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const handleUpdate = () => {
      const fetchProfile = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setFollowedUsers(res.data.followedUsers || []);
        } catch (error) {
          console.error('Profil alınamadı', error);
        }
      };
      fetchProfile();
    };
    window.addEventListener('user-connections-updated', handleUpdate);
    return () => {
      window.removeEventListener('user-connections-updated', handleUpdate);
    };
  }, [user]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlQuery = searchParams.get('q');
    
    if (urlQuery) {
      if (urlQuery !== query) {
        setQuery(urlQuery);
        const timeoutId = setTimeout(() => {
          handleSearch(null, urlQuery);
        }, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
      }
    } else {
      setQuery('');
      setResults({ tracks: [], artists: [], users: [] });
    }
  }, [location.search, query]);

  const saveToHistory = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    try {
      const res = await axios.post(
        'http://localhost:5000/api/user/search-history',
        { term: searchTerm },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSearchHistory(res.data);
    } catch (error) {
      console.error('Arama kaydedilemedi:', error);
    }
  };

  const handleSearch = async (e, searchTerm = query) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setQuery(searchTerm);
    saveToHistory(searchTerm);

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/deezer/search?q=${searchTerm}`);
      setResults(response.data);
      if (setSongs) {
        setSongs(response.data.tracks);
      }
    } catch (error) {
      console.error("Arama hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete('http://localhost:5000/api/user/search-history', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSearchHistory([]);
    } catch (error) {
      console.error('Arama geçmişi temizlenemedi:', error);
    }
  };

  const handleAddClick = (e, song) => {
    e.stopPropagation();
    setSelectedSong(song);
    setModalOpen(true);
  };

  const toggleFavoriteArtist = async (e, artist) => {
    e.stopPropagation();
    try {
      const res = await axios.post(
        'http://localhost:5000/api/library/favorites',
        { artist },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setFavoriteArtists(res.data);
    } catch (error) {
      console.error("Favori işlemi başarısız", error);
    }
  };

  const isFavorited = (artistId) => {
    return favoriteArtists.some(a => a.id === artistId);
  };

  const handleFollowUser = async (e, targetUserId) => {
    e.stopPropagation();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/user/follow/${targetUserId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setFollowedUsers(res.data.followedUsers);
      window.dispatchEvent(new Event('user-connections-updated'));
    } catch (error) {
      console.error("Kullanıcı takip edilemedi", error);
    }
  };


  const isUserFollowed = (userId) => {
    return followedUsers.some(id => id === userId);
  };

  return (
    <div className="search-page-modern">
      <div className="search-header-modern" style={{ marginTop: '0', paddingTop: '0' }}>
        {!loading && results.tracks.length === 0 && results.artists.length === 0 && searchHistory.length > 0 && (
          <div className="search-history-container">
            <div className="history-header">
              <h3>Son Aramalar</h3>
              <button className="clear-history-btn" onClick={clearHistory}>Temizle</button>
            </div>
            <div className="history-chips">
              {searchHistory.map((item, index) => (
                <button key={index} className="history-chip" onClick={() => handleSearch(null, item)}>
                  <i className="fa-solid fa-clock-rotate-left"></i> {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner fullScreen={false} />
      ) : (
        <div className="search-results">
          {results.tracks.length > 0 && (
            <div className="results-section">
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: '15px' }}>Şarkılar</h3>
              <div className="track-list-container">
                {results.tracks.map((song, index) => (
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
            </div>
          )}

          {results.artists.length > 0 && (
            <div className="results-section" style={{marginTop: '40px'}}>
              <h3>Sanatçılar</h3>
              <div className="artist-grid">
                {results.artists.map((artist) => (
                  <div key={artist.id} className="artist-card" onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}>
                    <div className="card-actions">
                      <button 
                        className={`icon-btn ${isFavorited(artist.id) ? 'active-heart' : ''}`} 
                        onClick={(e) => toggleFavoriteArtist(e, artist)}
                        title="Favorilere Ekle"
                      >
                        <i className={`fa-${isFavorited(artist.id) ? 'solid' : 'regular'} fa-heart`}></i>
                      </button>
                    </div>
                    <div className="artist-image-wrapper">
                      <img loading="lazy" decoding="async" src={artist.imageUrl} alt={artist.name} className="artist-image circle"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                    </div>
                    <div className="artist-info">
                      <h4>{artist.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.users && results.users.length > 0 && (
            <div className="results-section" style={{marginTop: '40px'}}>
              <h3>Kullanıcılar</h3>
              <div className="artist-grid">
                {results.users.map((u) => (
                  <div key={u._id} className="artist-card" style={{ cursor: 'default' }}>
                    <div className="card-actions">
                      <button 
                        className={`icon-btn ${isUserFollowed(u._id) ? 'active-heart' : ''}`} 
                        onClick={(e) => handleFollowUser(e, u._id)}
                        title={isUserFollowed(u._id) ? "Takipten Çık" : "Takip Et"}
                        style={{ width: 'auto', padding: '0 10px', borderRadius: '20px', fontSize: '12px' }}
                      >
                        {isUserFollowed(u._id) ? "Takip Ediliyor" : "Takip Et"}
                      </button>
                    </div>
                    <div className="artist-image-wrapper">
                      <img loading="lazy" decoding="async" src={u.profilePicture || '/default-profile.svg'} alt={u.username} className="artist-image circle"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                    </div>
                    <div className="artist-info">
                      <h4>{u.username}</h4>
                      <p style={{ fontSize: '12px', color: '#a0a0b0' }}>{u.followers} takipçi</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

export default Search;
