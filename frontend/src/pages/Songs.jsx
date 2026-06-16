import React, { useState, useCallback } from 'react';
import axios from 'axios';
import AlbumModal from '../components/AlbumModal';
import LoadingSpinner from '../components/LoadingSpinner';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import EmptyState from '../components/EmptyState';

const SongCard = React.memo(({ song, onPlay, onAdd }) => {
  return (
    <div className="song-card horizontal-card" onClick={() => onPlay(song)}>
      <div className="card-actions">
        <button className="icon-btn" onClick={(e) => onAdd(e, song)} title="Albüme Ekle">
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>
      <div className="card-image-wrapper">
        <img loading="lazy" decoding="async" src={song.coverUrl} alt={song.title} className="card-image square" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
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
  );
});

const LazyHorizontalRow = ({ title, fetchUrl, onSongsLoaded, setCurrentSong, handleAddClick }) => {
  const [ref, isIntersecting] = useIntersectionObserver();
  const [songs, setSongsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  React.useEffect(() => {
    if (isIntersecting && !fetched) {
      setLoading(true);
      axios.get(fetchUrl, { timeout: 5000 })
        .then(res => {
          setSongsData(res.data);
          if (onSongsLoaded) onSongsLoaded(res.data);
        })
        .catch(err => console.error("API Error or Timeout:", err))
        .finally(() => {
           setLoading(false);
           setFetched(true);
        });
    }
  }, [isIntersecting, fetchUrl, fetched, onSongsLoaded]);

  const handlePlay = useCallback((song) => setCurrentSong(song), [setCurrentSong]);
  const handleAdd = useCallback((e, song) => handleAddClick(e, song), [handleAddClick]);

  return (
    <div ref={ref} className="song-row-container" style={{ minHeight: '260px' }}>
      <h2 className="row-title">{title}</h2>
      {loading ? (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner fullScreen={false} />
        </div>
      ) : fetched && songs.length === 0 ? (
        <p style={{color: '#a7a7a7'}}>Şarkı bulunamadı.</p>
      ) : (
        <div className="song-horizontal-scroll">
          {songs.slice(0, 20).map((song) => (
            <SongCard key={`${title}-${song.id}`} song={song} onPlay={handlePlay} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
};

const LazyArtistRow = ({ artist, onSongsLoaded, setCurrentSong, handleAddClick }) => {
  const [ref, isIntersecting] = useIntersectionObserver();
  const [songs, setSongsData] = useState([]);
  const [fetched, setFetched] = useState(false);

  React.useEffect(() => {
    if (isIntersecting && !fetched) {
      axios.get(`http://localhost:5000/api/deezer/artists/${encodeURIComponent(artist.name)}`, { timeout: 5000 })
        .then(res => {
          const fetchedSongs = res.data.songs || [];
          setSongsData(fetchedSongs);
          if (onSongsLoaded) onSongsLoaded(fetchedSongs);
        })
        .catch(err => console.error("API Error or Timeout:", err))
        .finally(() => setFetched(true));
    }
  }, [isIntersecting, artist.name, fetched, onSongsLoaded]);

  const handlePlay = useCallback((song) => setCurrentSong(song), [setCurrentSong]);
  const handleAdd = useCallback((e, song) => handleAddClick(e, song), [handleAddClick]);

  return (
    <div ref={ref} style={{ minHeight: '300px' }}>
      {!fetched ? (
         <div style={{ height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingSpinner fullScreen={false} />
         </div>
      ) : songs.length > 0 ? (
        <div className="artist-bg-row" style={{ backgroundImage: `url(${artist.imageUrl})` }}>
          <div className="artist-bg-overlay">
            <h2 className="artist-huge-title">{artist.name.toUpperCase()}</h2>
            <p className="artist-subtitle">Sevdiğin sanatçıdan en hit parçalar</p>
            <div className="song-horizontal-scroll">
              {songs.slice(0, 15).map((song) => (
                <SongCard key={`artist-${song.id}`} song={song} onPlay={handlePlay} onAdd={handleAdd} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const InfiniteScrollSongs = ({ setCurrentSong, handleAddClick, onSongsLoaded }) => {
  const [songs, setSongsData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = React.useRef(null);

  const fetchMoreSongs = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/deezer/songs?page=${page}&limit=10`, { timeout: 5000 })
      .then(res => {
        const newSongs = res.data.songs || [];
        if (newSongs.length === 0) {
          setHasMore(false);
        } else {
          setSongsData(prev => [...prev, ...newSongs]);
          if (onSongsLoaded) onSongsLoaded(newSongs);
          setHasMore(res.data.hasMore);
          setPage(prev => prev + 1);
        }
      })
      .catch(err => console.error("Error fetching infinite songs:", err))
      .finally(() => setLoading(false));
  }, [page, loading, hasMore, onSongsLoaded]);

  React.useEffect(() => {
    const rootElement = document.querySelector('.content-rounded');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        fetchMoreSongs();
      }
    }, { threshold: 0.1, root: rootElement, rootMargin: '0px 0px 300px 0px' });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [fetchMoreSongs, hasMore, loading]);

  const handlePlay = useCallback((song) => setCurrentSong(song), [setCurrentSong]);
  const handleAdd = useCallback((e, song) => handleAddClick(e, song), [handleAddClick]);

  return (
    <div className="song-row-container infinite-scroll-section" style={{ marginTop: '40px' }}>
      <h2 className="row-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <i className="fa-solid fa-bolt" style={{ color: '#1db954' }}></i>
        Sonsuz Parça Akışı: Daha Fazla Keşfet
      </h2>
      <div className="songs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', padding: '15px 0' }}>
        {songs.map((song, index) => (
          <SongCard key={`inf-song-${song.id}-${index}`} song={song} onPlay={handlePlay} onAdd={handleAdd} />
        ))}
      </div>
      
      <div ref={loaderRef} style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && <LoadingSpinner fullScreen={false} />}
        {!hasMore && songs.length > 0 && <p style={{ color: '#a7a7a7', fontSize: '14px', fontWeight: 'bold' }}>Bütün hit şarkıları keşfettiniz! 🎉</p>}
      </div>
    </div>
  );
};

const InfiniteScrollAlbums = ({ user, setAlbums, albums }) => {
  const [fetchedAlbums, setFetchedAlbums] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = React.useRef(null);

  const fetchMoreAlbums = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/deezer/albums?page=${page}&limit=8`, { timeout: 5000 })
      .then(res => {
        const newAlbums = res.data.albums || [];
        if (newAlbums.length === 0) {
          setHasMore(false);
        } else {
          setFetchedAlbums(prev => [...prev, ...newAlbums]);
          setHasMore(res.data.hasMore);
          setPage(prev => prev + 1);
        }
      })
      .catch(err => console.error("Error fetching infinite albums:", err))
      .finally(() => setLoading(false));
  }, [page, loading, hasMore]);

  React.useEffect(() => {
    const rootElement = document.querySelector('.content-rounded');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        fetchMoreAlbums();
      }
    }, { threshold: 0.1, root: rootElement, rootMargin: '0px 0px 300px 0px' });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [fetchMoreAlbums, hasMore, loading]);

  const handleAddAlbum = async (album) => {
    try {
      const res = await axios.post('http://localhost:5000/api/library/albums', {
        name: `${user.username} - ${album.name}`
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert(`"${album.name}" listenize eklendi!`);
      if (setAlbums) {
        setAlbums([...albums, res.data]);
      }
    } catch (err) {
      console.error(err);
      alert("Albüm listenize eklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="song-row-container infinite-scroll-section" style={{ marginTop: '40px', paddingBottom: '30px' }}>
      <h2 className="row-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <i className="fa-solid fa-compact-disc" style={{ color: '#a855f7' }}></i>
        Trend Albümleri Keşfet
      </h2>
      <div className="album-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', padding: '15px 0' }}>
        {fetchedAlbums.map((album, index) => (
          <div key={`inf-album-${album.id}-${index}`} className="song-card vertical-card" style={{ cursor: 'default' }}>
            <div className="card-actions">
              <button 
                className="icon-btn" 
                onClick={() => handleAddAlbum(album)} 
                title="Kendi Kitaplığıma Ekle"
                style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className="fa-solid fa-bookmark" style={{ color: '#1db954' }}></i>
              </button>
            </div>
            <div className="card-image-wrapper">
              <img loading="lazy" decoding="async" src={album.coverUrl} alt={album.name} className="card-image square" onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
            </div>
            <div className="card-info" style={{ marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.name}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#a7a7a7' }}>{album.artist} • {album.tracksCount} şarkı</p>
            </div>
          </div>
        ))}
      </div>
      
      <div ref={loaderRef} style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading && <LoadingSpinner fullScreen={false} />}
        {!hasMore && fetchedAlbums.length > 0 && <p style={{ color: '#a7a7a7', fontSize: '14px', fontWeight: 'bold' }}>Bütün popüler albümleri keşfettiniz! 💿</p>}
      </div>
    </div>
  );
};

const Songs = ({ setCurrentSong, setSongs, user, albums, setAlbums, favoriteArtists = [] }) => {
  const [globalSongs, setGlobalSongs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const handleSongsLoaded = useCallback((newSongs) => {
    if (!newSongs || newSongs.length === 0) return;
    setGlobalSongs(prev => {
      const merged = [...prev, ...newSongs];
      const seen = new Set();
      const unique = merged.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      if (setSongs) setSongs(unique);
      return unique;
    });
  }, [setSongs]);

  const handleAddClick = useCallback((e, song) => {
    e.stopPropagation();
    setSelectedSong(song);
    setModalOpen(true);
  }, []);

  const blogPosts = [
    { id: 1, title: "Haftanın Keşfi", desc: "Bağımsız rock sahnesinden yükselen yeni sesler ve dikkat çeken albümler.", imageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80" },
    { id: 2, title: "Editörün Günlüğü", desc: "90'lar Pop müziğinin günümüze yansımaları ve efsanevi dönüşler.", imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80" },
    { id: 3, title: "Konser Rehberi", desc: "Bu yaz kaçırmamanız gereken en büyük festivaller ve canlı performanslar.", imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80" },
    { id: 4, title: "Haftanın Podcasti", desc: "Müzik prodüksiyonunun sırları ve stüdyo arkası hikayeleri.", imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80" }
  ];

  const BlogRow = () => (
    <div className="song-row-container" style={{ minHeight: '260px' }}>
      <h2 className="row-title">Kullanıcı Blogları & Editörün Seçimi</h2>
      <div className="song-horizontal-scroll">
        {blogPosts.map((post) => (
          <div key={post.id} className="blog-card">
             <img loading="lazy" decoding="async" src={post.imageUrl} alt={post.title} className="blog-image" />
             <div className="blog-content">
               <h4>{post.title}</h4>
               <p>{post.desc}</p>
               <button className="read-more-btn">Devamını Oku</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="songs-page">
      <div className="home-sections">
        
        {favoriteArtists.length === 0 && (
          <EmptyState 
            icon="fa-heart"
            title="Henüz Takip Ettiğin Sanatçı Yok"
            description="En sevdiğiniz sanatçıları takip ederek bu alanı tamamen size özel hale getirebilir, en popüler şarkılarını anında dinleyebilirsiniz!"
            actionText="Sanatçıları Keşfet"
            redirectPath="/search"
          />
        )}

        {favoriteArtists[0] && <LazyArtistRow artist={favoriteArtists[0]} onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />}
        
        <LazyHorizontalRow title="En Çok Dinlenen Popüler Şarkılar" fetchUrl="http://localhost:5000/api/deezer/songs" onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />
        
        {favoriteArtists[1] && <LazyArtistRow artist={favoriteArtists[1]} onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />}

        <LazyHorizontalRow title="Hip-Hop / Rap Gecesi" fetchUrl="http://localhost:5000/api/deezer/genre/hip hop" onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />
        
        <BlogRow />
        
        {favoriteArtists[2] && <LazyArtistRow artist={favoriteArtists[2]} onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />}
        
        <LazyHorizontalRow title="Sizin İçin Önerilenler: Rock Rüzgarı" fetchUrl="http://localhost:5000/api/deezer/genre/rock" onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />
        
        <LazyHorizontalRow title="Elektronik Müzik ve Dans" fetchUrl="http://localhost:5000/api/deezer/genre/electronic" onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />
        
        {favoriteArtists[3] && <LazyArtistRow artist={favoriteArtists[3]} onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />}

        <LazyHorizontalRow title="Sizin İçin Önerilenler: Pop Klasikleri" fetchUrl="http://localhost:5000/api/deezer/genre/pop" onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />
        
        <LazyHorizontalRow title="Günün Yorgunluğunu Atmak İçin: Caz & Blues" fetchUrl="http://localhost:5000/api/deezer/genre/jazz" onSongsLoaded={handleSongsLoaded} setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} />

        <InfiniteScrollSongs setCurrentSong={setCurrentSong} handleAddClick={handleAddClick} onSongsLoaded={handleSongsLoaded} />

        <InfiniteScrollAlbums user={user} setAlbums={setAlbums} albums={albums} />
      </div>

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

export default React.memo(Songs);
