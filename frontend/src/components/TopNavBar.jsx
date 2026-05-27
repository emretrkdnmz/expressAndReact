import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './TopNavBarDropdown.css';
import AlbumModal from './AlbumModal';
import ConnectionsModal from './ConnectionsModal';
import AiModal from './AiModal';


const TopNavBar = ({ user, setCurrentSong, albums, setAlbums, onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState({ tracks: [], artists: [], users: [] });
  const [popularSuggestions, setPopularSuggestions] = useState({ tracks: [], artists: [], users: [] });
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const inputRef = useRef(null);

  // Fetch Popular data once for empty search state
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const [songsRes, artistsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/deezer/songs'),
          axios.get('http://localhost:5000/api/deezer/artists')
        ]);
        setPopularSuggestions({
          tracks: songsRes.data.slice(0, 5),
          artists: artistsRes.data.slice(0, 3),
          users: []
        });
      } catch (err) {
        console.error("Popüler içerik alınamadı", err);
      }
    };
    fetchPopular();
  }, []);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setLoading(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/deezer/search?q=${encodeURIComponent(searchQuery)}`);
          setSuggestions(res.data);
          setIsDropdownOpen(true);
        } catch (error) {
          console.error("Arama hatası", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions(popularSuggestions);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, popularSuggestions]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        if (!searchQuery.trim()) {
           setIsSearchExpanded(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsDropdownOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const playSong = (song) => {
    if (setCurrentSong) {
      setCurrentSong(song);
    }
    setIsDropdownOpen(false);
  };

  const goToArtist = (artistName) => {
    navigate(`/artist/${encodeURIComponent(artistName)}`);
    setIsDropdownOpen(false);
  };

  const addToRecentSearches = (item, type) => {
    const newItem = { ...item, searchType: type };
    const idKey = item.id ? item.id : item._id;
    let updated = [newItem, ...recentSearches.filter(i => (i.id || i._id) !== idKey)];
    updated = updated.slice(0, 5); // Keep top 5
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const removeFromRecentSearches = (e, id) => {
    e.stopPropagation();
    const updated = recentSearches.filter(i => (i.id || i._id) !== id);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);


  const openAlbumModal = (e, song) => {
    e.stopPropagation();
    if (!user || !user.token) {
        alert("Çalma listesine eklemek için giriş yapmalısınız.");
        return;
    }
    setSelectedSong(song);
    setModalOpen(true);
    setIsDropdownOpen(false); // Close dropdown when opening modal
  };

  const isSearchEmpty = searchQuery.trim().length <= 1;

  const renderItem = (item, type, isRecent = false) => {
    if (!item) return null;
    const idKey = item.id ? item.id : item._id;

    if (type === 'track') {
      return (
        <div key={`track-${idKey}`} className="dropdown-item" onClick={() => { playSong(item); addToRecentSearches(item, 'track'); }}>
          <img loading="lazy" decoding="async" src={item.coverUrl} alt={item.title} onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
          <div className="dropdown-item-info">
            <h5>{item.title}</h5>
            <p>{item.artist}</p>
          </div>
          <div className="dropdown-item-actions">
            <i className="fa-solid fa-play play-hover-icon"></i>
            {!isRecent && (
                <button className="add-to-playlist-btn" onClick={(e) => openAlbumModal(e, item)} title="Çalma listesine ekle">
                    <i className="fa-solid fa-plus"></i>
                </button>
            )}
            {isRecent && (
                <button className="remove-recent-btn" onClick={(e) => removeFromRecentSearches(e, idKey)} title="Geçmişten Sil">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            )}
          </div>
        </div>
      );
    } else if (type === 'artist') {
      return (
        <div key={`artist-${idKey}`} className="dropdown-item" onClick={() => { goToArtist(item.name); addToRecentSearches(item, 'artist'); }}>
          <img loading="lazy" decoding="async" src={item.imageUrl} alt={item.name} className="circle-img" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
          <div className="dropdown-item-info">
            <h5>{item.name}</h5>
            <p>Sanatçı</p>
          </div>
          <div className="dropdown-item-actions">
            {isRecent && (
                <button className="remove-recent-btn" onClick={(e) => removeFromRecentSearches(e, idKey)} title="Geçmişten Sil">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            )}
          </div>
        </div>
      );
    } else if (type === 'user') {
      return (
        <div key={`user-${idKey}`} className="dropdown-item" onClick={() => { navigate(`/user/${idKey}`); setIsDropdownOpen(false); addToRecentSearches(item, 'user'); }}>
          <img loading="lazy" decoding="async" src={item.profilePicture || '/default-profile.svg'} alt={item.username} className="circle-img" onError={(e) => { e.target.onerror = null; e.target.src = "/default-profile.svg" }} />
          <div className="dropdown-item-info">
            <h5>{item.username}</h5>
            <p>Kullanıcı</p>
          </div>
          <div className="dropdown-item-actions">
             {isRecent && (
                <button className="remove-recent-btn" onClick={(e) => removeFromRecentSearches(e, idKey)} title="Geçmişten Sil">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleExpandSearch = () => {
    setIsSearchExpanded(true);
    setTimeout(() => {
       if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  return (
    <header className="top-nav-bar">
      <button className="mobile-menu-toggle-btn" onClick={onToggleMobileMenu} title="Menü">
        <i className="fa-solid fa-bars"></i>
      </button>

      <div className="nav-arrows">
        <button className="nav-arrow-btn" onClick={() => navigate(-1)}><i className="fa-solid fa-chevron-left"></i></button>
        <button className="nav-arrow-btn" onClick={() => navigate(1)}><i className="fa-solid fa-chevron-right"></i></button>
      </div>

      <div className="nav-center">
        <button className="nav-home-btn" onClick={() => navigate('/songs')} title="Ana Sayfa">
          <i className="fa-solid fa-house"></i>
        </button>

        <div className="global-search-container" ref={dropdownRef}>
          <form 
            className={`global-search-form ${isSearchExpanded ? 'expanded' : 'collapsed'}`} 
            onSubmit={handleSearchSubmit}
            onClick={handleExpandSearch}
          >
            <i className="fa-solid fa-magnifying-glass search-icon-global" onClick={(e) => {
               if (isSearchExpanded && searchQuery.trim()) {
                  handleSearchSubmit(e);
               }
            }}></i>
            
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder="Ne çalmak istiyorsun?" 
                value={searchQuery}
                ref={inputRef}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim()) {
                    navigate(`/search?q=${encodeURIComponent(val)}`);
                  } else {
                    navigate(`/search`);
                  }
                }}
              />
              <div className="search-divider"></div>
              <i className="fa-solid fa-wand-magic-sparkles browse-icon-global" style={{color: '#b28dff'}} onClick={(e) => { e.stopPropagation(); setIsAiModalOpen(true); }} title="AI ile Keşfet"></i>
            </div>
          </form>

          {isDropdownOpen && (
            <div className="search-dropdown-menu">
              {loading ? (
                <div className="dropdown-loading">
                  <div className="mini-spinner"></div>
                  <span>Aranıyor...</span>
                </div>
              ) : (
                <div className="dropdown-sections">
                  {isSearchEmpty && recentSearches.length > 0 && (
                    <div className="dropdown-section">
                      <h4>Son Aramalar</h4>
                      {recentSearches.map(item => renderItem(item, item.searchType, true))}
                    </div>
                  )}

                  {!isSearchEmpty && suggestions.tracks.length === 0 && suggestions.artists.length === 0 && suggestions.users.length === 0 && (
                    <div className="dropdown-no-results">Sonuç bulunamadı</div>
                  )}

                  {suggestions.tracks.length > 0 && (
                    <div className="dropdown-section">
                      <h4>{isSearchEmpty ? 'Popüler Şarkılar' : 'Şarkılar'}</h4>
                      {suggestions.tracks.slice(0, 4).map(track => renderItem(track, 'track'))}
                    </div>
                  )}

                  {suggestions.artists.length > 0 && (
                    <div className="dropdown-section">
                      <h4>{isSearchEmpty ? 'Popüler Sanatçılar' : 'Sanatçılar'}</h4>
                      {suggestions.artists.slice(0, 3).map(artist => renderItem(artist, 'artist'))}
                    </div>
                  )}

                  {!isSearchEmpty && suggestions.users.length > 0 && (
                    <div className="dropdown-section">
                      <h4>Kullanıcılar</h4>
                      {suggestions.users.slice(0, 2).map(u => renderItem(u, 'user'))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="nav-right">
        <button className="nav-icon-btn"><i className="fa-regular fa-bell"></i></button>
        <button className="nav-icon-btn" onClick={() => setIsConnectionsModalOpen(true)} title="Bağlantılarım">
          <i className="fa-solid fa-user-group"></i>
        </button>
        <div className="nav-profile-circle" onClick={() => navigate('/profile')}>
          <img loading="lazy" decoding="async" src={user?.profilePicture || '/default-profile.svg'} alt="Profil" onError={(e) => { e.target.onerror = null; e.target.src = "/default-profile.svg" }} />
        </div>
      </div>

      <AlbumModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        song={selectedSong} 
        user={user} 
        albums={albums} 
        setAlbums={setAlbums} 
      />

      <ConnectionsModal 
        isOpen={isConnectionsModalOpen} 
        onClose={() => setIsConnectionsModalOpen(false)} 
        user={user} 
        onUpdateCounts={() => window.dispatchEvent(new Event('user-connections-updated'))}
      />

      <AiModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        user={user} 
        setCurrentSong={setCurrentSong} 
        setAlbums={setAlbums} 
      />
    </header>
  );
};

export default TopNavBar;
