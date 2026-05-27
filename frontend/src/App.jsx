import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArtistHoverCard from './components/ArtistHoverCard';
import Login from './Login';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Songs from './pages/Songs';
import Artists from './pages/Artists';
import Search from './pages/Search';
import ArtistDetail from './pages/ArtistDetail';
import Albums from './pages/Albums';
import Profile from './pages/Profile';
import Browse from './pages/Browse';
import AccountSettings from './pages/profile-views/AccountSettings';
import PremiumPlan from './pages/profile-views/PremiumPlan';
import ListeningStats from './pages/profile-views/ListeningStats';
import RecentPlays from './pages/profile-views/RecentPlays';
import Updates from './pages/profile-views/Updates';
import PrivacySettings from './pages/profile-views/PrivacySettings';
import TopNavBar from './components/TopNavBar';
import SongDetail from './pages/SongDetail';
import RightSidebar from './components/RightSidebar';
import AnimatedBackground from './components/AnimatedBackground';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import './index.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isProfilePage = location.pathname.startsWith('/profile');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isDetailPage = location.pathname.startsWith('/songs/detail');

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    if (!savedUser) return null;
    try {
      const parsed = JSON.parse(savedUser);
      if (!parsed.token) {
        parsed.token = localStorage.getItem('userToken');
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });
  
  const [songs, setSongs] = useState([]); // Player için tüm şarkıları tutar
  const [currentSong, setCurrentSong] = useState(null);
  
  // Kütüphane Verileri (Favoriler ve Albümler)
  const [favoriteArtists, setFavoriteArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [hoveredArtist, setHoveredArtist] = useState(null);
  
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [device, setDevice] = useState('AirPods');
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlayerMaximized, setIsPlayerMaximized] = useState(false);
  const isFirstLoad = useRef(false);

  const [freqData, setFreqData] = useState(new Array(16).fill(10));
  const freqIntervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      freqIntervalRef.current = setInterval(() => {
        setFreqData(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
      }, 100);
    } else {
      if (freqIntervalRef.current) clearInterval(freqIntervalRef.current);
      setFreqData(new Array(16).fill(5));
    }
    return () => {
      if (freqIntervalRef.current) clearInterval(freqIntervalRef.current);
    };
  }, [isPlaying]);

  // Kullanıcı değiştiğinde/giriş yaptığında kullanıcının en son çaldığı şarkı ve süreyi yükle
  useEffect(() => {
    if (user) {
      const userId = user._id || user.id;
      const savedSong = localStorage.getItem(`lastPlayedSong_${userId}`);
      const savedTime = localStorage.getItem(`lastPlayedSongTime_${userId}`);
      
      if (savedSong) {
        isFirstLoad.current = true;
        setCurrentSong(JSON.parse(savedSong));
      } else {
        setCurrentSong(null);
      }
      
      if (savedTime) {
        setCurrentTime(parseFloat(savedTime));
      } else {
        setCurrentTime(0);
      }
    } else {
      setCurrentSong(null);
      setCurrentTime(0);
      setIsPlaying(false);
      isFirstLoad.current = false;
    }
  }, [user]);
  
  const timeoutRef = useRef(null);

  const handleLogout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    setSongs([]);
    setCurrentSong(null);
    setFavoriteArtists([]);
    setAlbums([]);
    window.location.href = '/';
  };

  const resetInactivityTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      alert("Hareketsiz kaldığınız için oturumunuz güvenli bir şekilde kapatıldı.");
      handleLogout();
    }, 120000);
  };

  useEffect(() => {
    if (user) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      resetInactivityTimer();
      events.forEach(event => window.addEventListener(event, resetInactivityTimer));
      
      return () => {
        events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [user]);

  // Kullanıcı giriş yaptıktan sonra kütüphanesini (favoriler ve albümler) çekiyoruz
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        if (!user || !user.token) return;
        const res = await axios.get('http://localhost:5000/api/library', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setFavoriteArtists(res.data.favoriteArtists || []);
        setAlbums(res.data.albums || []);
      } catch (error) {
        console.error('Kütüphane bilgileri alınamadı', error);
      }
    };
    fetchLibrary();
  }, [user]);

  // Oynatma Durumu Efekti
  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Oynatma hatası:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Yeni şarkı seçildiğinde veya değiştiğinde localStorage'a kaydet ve oynatma mantığı
  useEffect(() => {
    if (currentSong && user) {
      const userId = user._id || user.id;
      localStorage.setItem(`lastPlayedSong_${userId}`, JSON.stringify(currentSong));
      
      // Eğer ilk açılış (restore) değilse şarkıyı oynat ve sağ barı aç
      if (!isFirstLoad.current) {
        setIsPlaying(true);
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
        setIsRightSidebarOpen(true);
      } else {
        // İlk açılış (restore) aşaması bitti
        isFirstLoad.current = false;
      }

      // Geçmişe ekle
      const saved = JSON.parse(localStorage.getItem(`recentPlays_${userId}`) || '[]');
      const newPlay = {
         id: currentSong.id || currentSong._id,
         title: currentSong.title,
         artist: currentSong.artist,
         coverUrl: currentSong.coverUrl,
         duration_ms: currentSong.duration_ms || 210000,
         playedAt: new Date().toISOString()
      };
      
      const updated = [newPlay, ...saved.filter(s => s.id !== newPlay.id)].slice(0, 50);
      localStorage.setItem(`recentPlays_${userId}`, JSON.stringify(updated));
    }
  }, [currentSong, user]);

  if (!user) {
    return (
      <ErrorBoundary>
        <AnimatedBackground />
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={(userData) => setUser(userData)} />} />
          <Route path="/admin/login" element={<AdminLogin setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressStart = () => {
    setIsDragging(true);
    setDragValue(currentTime);
  };

  const handleProgressChange = (e) => {
    setDragValue(parseFloat(e.target.value));
  };

  const handleProgressEnd = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    setIsDragging(false);
  };

  const handleNextSong = () => {
    if (!songs || songs.length === 0) return;
    const currentIndex = songs.findIndex(
      (s) => (s.id || s._id) === (currentSong?.id || currentSong?._id)
    );
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % songs.length;
    }
    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (!songs || songs.length === 0) return;
    const currentIndex = songs.findIndex(
      (s) => (s.id || s._id) === (currentSong?.id || currentSong?._id)
    );
    const prevIndex = currentIndex === -1 ? songs.length - 1 : (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  };

  const toggleCurrentArtistFavorite = async () => {
    if (!currentSong || !user || !user.token) return;
    try {
      const artistRes = await axios.get(`http://localhost:5000/api/deezer/artists/${encodeURIComponent(currentSong.artist)}`);
      if (artistRes.data && artistRes.data.artist) {
        const artistInfo = artistRes.data.artist;
        const favRes = await axios.post(
          'http://localhost:5000/api/library/favorites',
          { artist: artistInfo },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setFavoriteArtists(favRes.data);
      }
    } catch (error) {
      console.error('Favori sanatçı güncellenemedi', error);
    }
  };

  const toggleDevice = () => {
    const devices = ["AirPods", "Telefon Hoparlörü", "Bluetooth Hoparlör"];
    const currentIndex = devices.indexOf(device);
    setDevice(devices[(currentIndex + 1) % devices.length]);
  };

  const handleShareSong = () => {
    if (!currentSong) return;
    const songLink = `${window.location.origin}/artist/${encodeURIComponent(currentSong.artist)}`;
    navigator.clipboard.writeText(songLink).then(() => {
      alert(`"${currentSong.title}" paylaşım bağlantısı panoya kopyalandı!`);
    }).catch(err => {
      console.error("Paylaşım bağlantısı kopyalanamadı:", err);
    });
  };

  return (
    <ErrorBoundary>
      <AnimatedBackground />
        <div className="spotify-layout-modern">
          {!isAdminPage && (
            <TopNavBar 
              user={user} 
              setCurrentSong={setCurrentSong} 
              albums={albums} 
              setAlbums={setAlbums} 
              onToggleMobileMenu={() => setIsMobileMenuOpen(true)} 
            />
          )}
          
          {/* Mobil Yan Menü (Hamburger Çekmecesi) */}
          {!isAdminPage && (
            <div className={`mobile-sidebar-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
              <div className="mobile-sidebar-header">
                <div className="mobile-logo">
                  <i className="fa-brands fa-spotify"></i>
                  <span>Menü</span>
                </div>
                <button className="close-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(false)} title="Kapat">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <nav className="mobile-sidebar-nav" onClick={() => setIsMobileMenuOpen(false)}>
                <ul>
                  <li>
                    <NavLink to="/songs" className={({ isActive }) => (isActive ? "active mobile-nav-item" : "mobile-nav-item")}>
                      <i className="fa-solid fa-house"></i>
                      <span>Ana Sayfa</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/artists" className={({ isActive }) => (isActive ? "active mobile-nav-item" : "mobile-nav-item")}>
                      <i className="fa-solid fa-users"></i>
                      <span>Sanatçılar</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/albums" className={({ isActive }) => (isActive ? "active mobile-nav-item" : "mobile-nav-item")}>
                      <i className="fa-solid fa-book"></i>
                      <span>Listelerim</span>
                    </NavLink>
                  </li>
                </ul>
                
                <div className="mobile-library-section">
                  <div className="mobile-library-header">
                    <i className="fa-solid fa-heart"></i>
                    <span>Favoriler</span>
                  </div>
                  <ul className="mobile-artist-list">
                    {favoriteArtists.map(artist => (
                      <li key={artist.id} className="mobile-artist-item">
                        <NavLink to={`/artist/${encodeURIComponent(artist.name)}`} className="mobile-artist-link">
                          <img 
                            src={artist.imageUrl} 
                            className="mobile-artist-img" 
                            alt={artist.name} 
                            onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }}
                          />
                          <span className="mobile-artist-name">{artist.name}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            </div>
          )}
          {!isAdminPage && isMobileMenuOpen && <div className="mobile-sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
        
        <div className={isAdminPage ? "layout-body admin-layout-body" : "layout-body"}>
          
          {/* SOL MENÜ (NARROW SIDEBAR) */}
          {!isAdminPage && (
            <aside className="sidebar-narrow">
              <div className="logo-icon">
                <i className="fa-brands fa-spotify"></i>
              </div>
              
              <nav>
                <ul>
                  <li>
                    <NavLink to="/songs" className={({ isActive }) => (isActive ? "active expandable-nav-item" : "expandable-nav-item")}>
                      <i className="fa-solid fa-house"></i>
                      <span className="nav-text">Ana Sayfa</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/artists" className={({ isActive }) => (isActive ? "active expandable-nav-item" : "expandable-nav-item")}>
                      <i className="fa-solid fa-users"></i>
                      <span className="nav-text">Sanatçılar</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/albums" className={({ isActive }) => (isActive ? "active expandable-nav-item" : "expandable-nav-item")}>
                      <i className="fa-solid fa-book"></i>
                      <span className="nav-text">Listelerim</span>
                    </NavLink>
                  </li>
                  <li className="library-menu-item">
                    <div className="library-header expandable-nav-item">
                      <i className="fa-solid fa-heart"></i>
                      <span className="nav-text">Favoriler</span>
                    </div>
                    <ul className="sidebar-artist-list">
                      {favoriteArtists.slice(0, 4).map(artist => (
                        <li key={artist.id} className="sidebar-artist-item">
                          <NavLink to={`/artist/${encodeURIComponent(artist.name)}`} className="sidebar-artist-link">
                            <img 
                              loading="lazy" 
                              decoding="async" 
                              src={artist.imageUrl} 
                              className="nav-artist-img" 
                              alt={artist.name} 
                              onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }}
                              onMouseEnter={(e) => {
                                 const rect = e.target.getBoundingClientRect();
                                 setHoveredArtist({ artist, top: rect.top + rect.height / 2, left: rect.right + 10 });
                              }}
                              onMouseLeave={() => setHoveredArtist(null)}
                            />
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                  {user?.isAdmin && (
                    <li style={{ marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                      <NavLink to="/admin" className={({ isActive }) => (isActive ? "active expandable-nav-item" : "expandable-nav-item")} style={{ borderLeft: '3px solid #a855f7' }}>
                        <i className="fa-solid fa-user-shield" style={{ color: '#a855f7' }}></i>
                        <span className="nav-text" style={{ color: '#c084fc', fontWeight: '700' }}>Admin Paneli</span>
                      </NavLink>
                    </li>
                  )}
                </ul>
              </nav>
            </aside>
          )}

          <div className="layout-left-wrapper">
              {/* ORTA ALAN (MÜZİK KÜTÜPHANESİ - DİNAMİK) */}
              <main className={isAdminPage ? "content-rounded admin-content-layout" : isDetailPage ? "content-rounded detail-page-active" : "content-rounded"}>
                <Routes>
                  <Route path="/" element={<Navigate to="/songs" replace />} />
                  <Route path="/login" element={<Navigate to="/songs" replace />} />
                  <Route 
                    path="/songs" 
                    element={<Songs setCurrentSong={setCurrentSong} setSongs={setSongs} user={user} albums={albums} setAlbums={setAlbums} favoriteArtists={favoriteArtists} />} 
                  />
                  <Route 
                    path="/artists" 
                    element={<Artists user={user} favoriteArtists={favoriteArtists} setFavoriteArtists={setFavoriteArtists} />} 
                  />
                  <Route 
                    path="/search" 
                    element={<Search setCurrentSong={setCurrentSong} setSongs={setSongs} user={user} favoriteArtists={favoriteArtists} setFavoriteArtists={setFavoriteArtists} albums={albums} setAlbums={setAlbums} />} 
                  />
                  <Route 
                    path="/artist/:name" 
                    element={<ArtistDetail setCurrentSong={setCurrentSong} setSongs={setSongs} user={user} albums={albums} setAlbums={setAlbums} favoriteArtists={favoriteArtists} setFavoriteArtists={setFavoriteArtists} />} 
                  />
                  <Route 
                    path="/albums" 
                    element={<Albums setCurrentSong={setCurrentSong} albums={albums} setAlbums={setAlbums} user={user} />} 
                  />
                  <Route 
                    path="/browse" 
                    element={<Browse setCurrentSong={setCurrentSong} user={user} albums={albums} setAlbums={setAlbums} />} 
                  />
                  <Route 
                    path="/profile" 
                    element={<Profile user={user} setUser={setUser} handleLogout={handleLogout} />} 
                  />
                  <Route path="/profile/account" element={<AccountSettings user={user} setUser={setUser} />} />
                  <Route path="/profile/premium" element={<PremiumPlan user={user} setUser={setUser} />} />
                  <Route path="/profile/stats" element={<ListeningStats user={user} />} />
                  <Route path="/profile/recent" element={<RecentPlays setCurrentSong={setCurrentSong} user={user} />} />
                  <Route path="/profile/updates" element={<Updates />} />
                  <Route path="/profile/settings" element={<PrivacySettings handleLogout={handleLogout} />} />
                  {user?.isAdmin && (
                    <Route path="/admin" element={<AdminDashboard user={user} handleLogout={handleLogout} />} />
                  )}
                  <Route 
                    path="/admin/login" 
                    element={user?.isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/songs" replace />} 
                  />
                  <Route 
                    path="/songs/detail" 
                    element={
                      <SongDetail 
                        currentSong={currentSong} 
                        isPlaying={isPlaying} 
                        togglePlay={togglePlay} 
                        currentTime={currentTime} 
                        duration={duration} 
                        volume={volume} 
                        setVolume={setVolume} 
                        handleNextSong={handleNextSong} 
                        handlePrevSong={handlePrevSong} 
                        isShuffle={isShuffle} 
                        setIsShuffle={setIsShuffle} 
                        isRepeat={isRepeat} 
                        setIsRepeat={setIsRepeat}
                        formatTime={formatTime}
                        handleProgressChange={handleProgressChange}
                        handleProgressStart={handleProgressStart}
                        handleProgressEnd={handleProgressEnd}
                        isDragging={isDragging}
                        dragValue={dragValue}
                      />
                    } 
                  />
                  <Route path="*" element={<Songs setCurrentSong={setCurrentSong} setSongs={setSongs} user={user} albums={albums} setAlbums={setAlbums} />} />
                </Routes>
              </main>

        {/* ALT MÜZİK ÇALMA ÇUBUĞU (MUSIC PLAYER BAR) */}
        {/* ALT MÜZİK ÇALMA ÇUBUĞU (MUSIC PLAYER BAR) */}
        {currentSong && !isProfilePage && !isDetailPage && (
          <footer className={`music-player-bar ${isPlayerMaximized ? 'maximized' : 'minimized'}`}>
            
            {/* FULLSCREEN MAXIMIZED MOBİL PLAYER */}
            <div className="maximized-player-overlay" style={{ backgroundImage: `url(${currentSong.coverUrl})` }}>
              <div className="maximized-player-blur-bg"></div>
              
              <div className="maximized-player-header">
                <button className="maximized-close-btn" onClick={(e) => { e.stopPropagation(); setIsPlayerMaximized(false); }}>
                  <i className="fa-solid fa-chevron-down"></i>
                </button>
                <span className="maximized-header-title">Yakındaki Aramalar</span>
                <button className="maximized-more-btn">
                  <i className="fa-solid fa-ellipsis"></i>
                </button>
              </div>

              <div className="maximized-player-body">
                <div className="maximized-cover-wrapper">
                  <img src={currentSong.coverUrl} alt={currentSong.title} className="maximized-cover-img" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                </div>

                {/* Maximized visualizer frequency spectrum */}
                <div className="maximized-freq-analyzer">
                  {freqData.map((height, idx) => (
                    <div 
                      key={idx} 
                      className="maximized-freq-bar" 
                      style={{ 
                        height: height + '%',
                        background: `linear-gradient(to top, #1db954 0%, #1ed760 100%)`,
                      }}
                    ></div>
                  ))}
                </div>

                <div className="maximized-song-info-row">
                  <div className="maximized-song-details" onClick={() => { setIsPlayerMaximized(false); navigate(`/artist/${encodeURIComponent(currentSong.artist)}`); }}>
                    <h2>{currentSong.title}</h2>
                    <p>{currentSong.artist}</p>
                  </div>
                  <button className="maximized-add-btn" onClick={toggleCurrentArtistFavorite} title="Sanatçıyı Takip Et">
                    <i className={`${favoriteArtists.some(a => a.name.toLowerCase() === currentSong?.artist?.toLowerCase()) ? 'fa-solid' : 'fa-regular'} fa-heart`} style={favoriteArtists.some(a => a.name.toLowerCase() === currentSong?.artist?.toLowerCase()) ? { color: '#1db954' } : {}}></i>
                  </button>
                </div>

                <div className="maximized-progress-block">
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={isDragging ? dragValue : currentTime} 
                    onChange={handleProgressChange} 
                    onMouseDown={handleProgressStart}
                    onTouchStart={handleProgressStart}
                    onMouseUp={handleProgressEnd}
                    onTouchEnd={handleProgressEnd}
                    className="maximized-progress-slider"
                    disabled={!currentSong.audioUrl}
                    style={{
                      background: `linear-gradient(to right, #1db954 ${
                        duration ? ((isDragging ? dragValue : currentTime) / duration) * 100 : 0
                      }%, rgba(255,255,255,0.2) ${duration ? ((isDragging ? dragValue : currentTime) / duration) * 100 : 0}%)`
                    }}
                  />
                  <div className="maximized-timestamps">
                    <span>{formatTime(isDragging ? dragValue : currentTime)}</span>
                    <span>-{formatTime(Math.max(0, duration - (isDragging ? dragValue : currentTime)))}</span>
                  </div>
                </div>

                <div className="maximized-controls-row">
                  <button className={`maximized-control-btn shuffle ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)} title="Karıştır">
                    <i className="fa-solid fa-shuffle"></i>
                  </button>
                  <button className="maximized-control-btn prev" onClick={handlePrevSong} title="Önceki Şarkı">
                    <i className="fa-solid fa-backward-step"></i>
                  </button>
                  <button className="maximized-play-btn" onClick={togglePlay} disabled={!currentSong.audioUrl}>
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                  </button>
                  <button className="maximized-control-btn next" onClick={handleNextSong} title="Sonraki Şarkı">
                    <i className="fa-solid fa-forward-step"></i>
                  </button>
                  <button className={`maximized-control-btn repeat ${isRepeat ? 'active' : ''}`} onClick={() => setIsRepeat(!isRepeat)} title="Tekrarla">
                    <i className="fa-solid fa-repeat"></i>
                  </button>
                </div>

                <div className="maximized-footer-row">
                  <span className="maximized-device-info" onClick={toggleDevice} style={{ cursor: 'pointer' }} title="Cihaz Değiştir">
                    <i className="fa-solid fa-headphones"></i> {device}
                  </span>
                  <div className="maximized-footer-actions">
                    <button className="maximized-footer-btn" onClick={handleShareSong} title="Şarkıyı Paylaş">
                      <i className="fa-solid fa-share-nodes"></i>
                    </button>
                    <button className="maximized-footer-btn" onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} title="Listeleri Göster">
                      <i className="fa-solid fa-bars"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STANDART MİNİMİZE PLAYER CONTAINER */}
            <div className="player-container" onClick={() => {
              if (window.innerWidth < 768) {
                setIsPlayerMaximized(true);
              } else {
                navigate('/songs/detail');
              }
            }}>
              
              <div 
                className="player-song-info" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.innerWidth < 768) {
                    setIsPlayerMaximized(true);
                  } else {
                    navigate('/songs/detail');
                  }
                }}
                style={{ cursor: 'pointer' }}
                title="Şarkı detaylarını gör"
              >
                <img loading="lazy" decoding="async" src={currentSong.coverUrl} alt={currentSong.title} className="player-cover"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                <div className="song-details">
                  <h5>{currentSong.title}</h5>
                  <p>{currentSong.artist}</p>
                </div>

                {/* Mini Player Frequency EQ visualizer when playing */}
                {isPlaying && (
                  <div className="mini-player-eq">
                    {freqData.slice(0, 6).map((height, idx) => (
                      <div 
                        key={idx} 
                        className="mini-eq-bar" 
                        style={{ 
                          height: height + '%',
                          background: '#1db954',
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>

              <div className="player-center-controls" onClick={(e) => e.stopPropagation()}>
                <div className="control-buttons">
                  <button className="nav-btn" onClick={handlePrevSong} title="Önceki Şarkı"><i className="fa-solid fa-backward-step"></i></button>
                  <button className="play-circle-btn" onClick={togglePlay} disabled={!currentSong.audioUrl} style={!currentSong.audioUrl ? {opacity: 0.5, cursor: 'not-allowed'} : {}}>
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                  </button>
                  <button className="nav-btn" onClick={handleNextSong} title="Sonraki Şarkı"><i className="fa-solid fa-forward-step"></i></button>
                </div>
                
                <div className="progress-container">
                  <span className="time-stamp">{formatTime(isDragging ? dragValue : currentTime)}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={isDragging ? dragValue : currentTime} 
                    onChange={handleProgressChange} 
                    onMouseDown={handleProgressStart}
                    onTouchStart={handleProgressStart}
                    onMouseUp={handleProgressEnd}
                    onTouchEnd={handleProgressEnd}
                    className="custom-progress-bar"
                    disabled={!currentSong.audioUrl}
                    style={{
                      background: `linear-gradient(to right, #1db954 ${
                        duration ? ((isDragging ? dragValue : currentTime) / duration) * 100 : 0
                      }%, #4f4f4f ${duration ? ((isDragging ? dragValue : currentTime) / duration) * 100 : 0}%)`
                    }}
                  />
                  <span className="time-stamp">{formatTime(duration)}</span>
                </div>
                {!currentSong.audioUrl && (
                  <p style={{fontSize: '11px', color: '#e91429', margin: '5px 0 0 0', position: 'absolute', bottom: '5px'}}>Önizleme bulunmuyor</p>
                )}
              </div>

              <div className="player-center-controls" onClick={(e) => e.stopPropagation()}>
                {/* redundant volume? Let's check original. Ah! player-right-controls is there. */}
              </div>

              <div className="player-right-controls" onClick={(e) => e.stopPropagation()}>
                <span className="volume-icon"><i className="fa-solid fa-volume-high"></i></span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume} 
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    if (audioRef.current) audioRef.current.volume = newVolume;
                  }}
                  className="volume-slider" 
                  style={{
                    background: `linear-gradient(to right, #1db954 ${volume * 100}%, #4f4f4f ${volume * 100}%)`
                  }}
                />
              </div>
              
              <audio 
                ref={audioRef} 
                src={currentSong.audioUrl || ''} 
                volume={volume} 
                onPlay={() => setIsPlaying(true)} 
                onPause={() => setIsPlaying(false)} 
                onLoadedMetadata={(e) => {
                  setDuration(e.target.duration);
                  
                  // Eğer ilk açılışta kaydedilmiş bir süre varsa oraya seek et
                  if (user) {
                    const userId = user._id || user.id;
                    const savedTime = localStorage.getItem(`lastPlayedSongTime_${userId}`);
                    if (savedTime && isFirstLoad.current) {
                      const parsedTime = parseFloat(savedTime);
                      e.target.currentTime = parsedTime;
                      setCurrentTime(parsedTime);
                      isFirstLoad.current = false;
                    }
                  }
                  
                  if (isPlaying && currentSong.audioUrl) {
                    e.target.play().catch(err => {
                      console.log('Otomatik oynatma engellendi:', err);
                      setIsPlaying(false);
                    });
                  }
                }} 
                onTimeUpdate={(e) => {
                  const time = e.target.currentTime;
                  if (!isDragging) {
                    setCurrentTime(time);
                    if (user) {
                      const userId = user._id || user.id;
                      localStorage.setItem(`lastPlayedSongTime_${userId}`, time.toString());
                    }
                  }
                }} 
                onEnded={() => {
                  if (isRepeat) {
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                      audioRef.current.play().catch(e => console.error(e));
                    }
                    setCurrentTime(0);
                    setIsPlaying(true);
                  } else {
                    handleNextSong();
                  }
                }} 
                style={{ display: 'none' }} 
              />
            </div>
          </footer>
        )}

          </div>
          
          {isRightSidebarOpen && (
            <RightSidebar 
              currentSong={currentSong} 
              onClose={() => setIsRightSidebarOpen(false)} 
              user={user}
              favoriteArtists={favoriteArtists}
              setFavoriteArtists={setFavoriteArtists}
              setCurrentSong={setCurrentSong}
            />
          )}
        </div>

        {hoveredArtist && (
          <ArtistHoverCard 
            artist={hoveredArtist.artist} 
            top={hoveredArtist.top} 
            left={hoveredArtist.left} 
            setCurrentSong={setCurrentSong} 
          />
        )}

      </div>
    </ErrorBoundary>
  );
}

export default App;