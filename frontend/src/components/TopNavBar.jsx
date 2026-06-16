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
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Kullanıcı değiştiğinde veya giriş yapıldığında kullanıcının arama geçmişini yükle
  useEffect(() => {
    if (user) {
      const userId = user._id || user.id;
      const saved = localStorage.getItem(`recentSearches_${userId}`);
      setRecentSearches(saved ? JSON.parse(saved) : []);
    } else {
      setRecentSearches([]);
    }
  }, [user]);

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const inputRef = useRef(null);

  const [announcements, setAnnouncements] = useState([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifRef = useRef(null);

  // Fetch Announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        if (!user || !user.token) return;
        const res = await axios.get('http://localhost:5000/api/user/announcements', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        // Filter out dismissed announcements
        const userId = user._id || user.id;
        const dismissed = JSON.parse(localStorage.getItem(`dismissedAnnouncements_${userId}`) || '[]');
        const activeAnnouncements = res.data.filter(ann => !dismissed.includes(ann._id));
        
        setAnnouncements(activeAnnouncements);
      } catch (err) {
        console.error("Duyurular yüklenemedi", err);
      }
    };
    fetchAnnouncements();
  }, [user]);

  const handleDeleteAnnouncement = (id) => {
    if (!user) return;
    const userId = user._id || user.id;
    const dismissed = JSON.parse(localStorage.getItem(`dismissedAnnouncements_${userId}`) || '[]');
    if (!dismissed.includes(id)) {
      dismissed.push(id);
    }
    localStorage.setItem(`dismissedAnnouncements_${userId}`, JSON.stringify(dismissed));
    setAnnouncements(announcements.filter(ann => ann._id !== id));
  };

  // Click outside notification dropdown
  useEffect(() => {
    const handleClickOutsideNotif = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideNotif);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideNotif);
    };
  }, [notifRef]);

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
    }, 300); // 300ms Debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, popularSuggestions]);

  // Debounced URL Navigation
  useEffect(() => {
    if (searchQuery === '') {
      if (location.pathname === '/search') {
        navigate('/search');
      }
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const currentQ = searchParams.get('q') || '';
      if (searchQuery.trim() && searchQuery !== currentQ) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }, 300); // 300ms Debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, navigate, location.pathname]);

  // Sync search input state with URL query param on browser back/forward navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [location.search]);

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
    if (!user) return;
    const userId = user._id || user.id;
    const newItem = { ...item, searchType: type };
    const idKey = item.id ? item.id : item._id;
    let updated = [newItem, ...recentSearches.filter(i => (i.id || i._id) !== idKey)];
    updated = updated.slice(0, 5); // Keep top 5
    setRecentSearches(updated);
    localStorage.setItem(`recentSearches_${userId}`, JSON.stringify(updated));
  };

  const removeFromRecentSearches = (e, id) => {
    e.stopPropagation();
    if (!user) return;
    const userId = user._id || user.id;
    const updated = recentSearches.filter(i => (i.id || i._id) !== id);
    setRecentSearches(updated);
    localStorage.setItem(`recentSearches_${userId}`, JSON.stringify(updated));
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

        <button className="nav-home-btn nav-browse-btn" onClick={() => navigate('/browse')} title="Gözat" style={{ marginLeft: '8px' }}>
          <i className="fa-solid fa-compass"></i>
        </button>

        <div className="global-search-container" ref={dropdownRef} style={{ marginLeft: '8px' }}>
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
                  setSearchQuery(e.target.value);
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
        {/* Duyurular */}
        <div className="notif-bell-container" ref={notifRef}>
          <button className={`nav-icon-btn ${isNotifDropdownOpen ? 'active' : ''}`} onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)} title="Duyurular">
            <i className="fa-regular fa-bell"></i>
            {announcements.length > 0 && <span className="notif-count-badge">{announcements.length}</span>}
          </button>
          
          {isNotifDropdownOpen && (
            <div className="notif-dropdown-menu glass-card">
              <div className="notif-dropdown-header">
                <h3>Sistem Duyuruları</h3>
              </div>
              <div className="notif-dropdown-content">
                {announcements.length > 0 ? (
                  announcements.map(announcement => (
                    <div key={announcement._id} className={`notif-dropdown-item type-${announcement.type}`}>
                      <div className="notif-item-icon">
                        {announcement.type === 'warning' && <i className="fa-solid fa-circle-exclamation" style={{color: '#f59e0b'}}></i>}
                        {announcement.type === 'success' && <i className="fa-solid fa-circle-check" style={{color: '#1db954'}}></i>}
                        {announcement.type === 'info' && <i className="fa-solid fa-circle-info" style={{color: '#a855f7'}}></i>}
                      </div>
                      <div className="notif-item-body">
                        <h4>{announcement.title}</h4>
                        <p>{announcement.message}</p>
                        <span className="notif-item-date">{new Date(announcement.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <button 
                        className="notif-delete-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAnnouncement(announcement._id);
                        }}
                        title="Duyuruyu Kapat"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="notif-dropdown-empty">
                    <i className="fa-regular fa-bell-slash"></i>
                    <p>Henüz yeni bir duyuru bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bağlantılarım */}
        <button className="nav-icon-btn" onClick={() => setIsConnectionsModalOpen(true)} title="Bağlantılarım">
          <i className="fa-solid fa-user-group"></i>
        </button>
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
