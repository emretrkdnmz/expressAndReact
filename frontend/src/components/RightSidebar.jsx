import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RightSidebar = ({ currentSong, onClose, user, favoriteArtists, setFavoriteArtists, setCurrentSong, isOpen }) => {
  if (!currentSong) return null;

  const [artistDetails, setArtistDetails] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Takip ediliyor mu kontrolü
  const isFollowing = favoriteArtists?.some(artist => 
    artist.name === currentSong.artist
  );

  useEffect(() => {
    const fetchArtistDetails = async () => {
      if (!currentSong?.artist) return;
      setLoadingDetails(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/deezer/artists/${encodeURIComponent(currentSong.artist)}`);
        if (res.data) {
          setArtistDetails(res.data.artist);
          setArtistTracks(res.data.songs ? res.data.songs.slice(0, 4) : []);
        }
      } catch (err) {
        console.error("Sanatçı detayları çekilemedi:", err);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchArtistDetails();
  }, [currentSong?.artist]);

  const handleFollow = async () => {
    if (!user) return;
    try {
      // Şarkının sanatçı bilgisiyle favorilere ekle/çıkar
      const artistData = {
        id: artistDetails?.id || currentSong.artist, // Gerçek ID'yi Deezer'dan alıyoruz
        name: currentSong.artist,
        imageUrl: artistDetails?.imageUrl || currentSong.coverUrl
      };

      const res = await axios.post(
        'http://localhost:5000/api/library/favorites',
        { artist: artistData },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (setFavoriteArtists) {
        setFavoriteArtists(res.data);
      }
    } catch (error) {
      console.error("Favori işlemi başarısız:", error);
    }
  };

  const getArtistBio = (artistName) => {
    const cleanName = artistName.trim().toLowerCase();
    if (cleanName.includes('michael jackson')) {
      return "Popun Kralı olarak bilinen Michael Jackson; vokal tarzı, ikonik sahne dansları (Moonwalk) ve tüm zamanların en çok satan albümü olan 'Thriller' ile müzik tarihinin en büyük efsanesidir.";
    }
    if (cleanName.includes('tarkan')) {
      return "Türk pop müziğinin Megastarı Tarkan; 90'lardan bu yana hem Türkiye'de hem de küresel çapta albüm satışları ve ses getiren eşsiz sahne performanslarıyla kültleşmiş bir dünya yıldızıdır.";
    }
    if (cleanName.includes('sezen aksu')) {
      return "Minik Serçe lakaplı Sezen Aksu; Türk pop müziğine yön veren yüzlerce ölümsüz esere imza atan, ülkenin en büyük söz yazarı, besteci ve yorumcularından biridir.";
    }
    if (cleanName.includes('taylor swift')) {
      return "Grammy rekortmeni küresel pop ikonu Taylor Swift; olağanüstü söz yazarlığı yeteneği, hikaye anlatımı ve müzik türlerini başarıyla harmanlayan rekor kırıcı albümleriyle yüzyılımızın en etkili figürlerindendir.";
    }
    if (cleanName.includes('billie eilish')) {
      return "Oscar ve Grammy ödüllü Billie Eilish; melankolik tarzı, fısıltılı vokalleri ve avangart pop ritimleriyle yeni nesil alternatif müziğin öncüsü ve küresel temsilcisidir.";
    }
    if (cleanName.includes('weeknd')) {
      return "Kanadalı R&B ve pop ikonu The Weeknd; karanlık atmosferi, synth-pop tınıları ve akıllara kazınan eşsiz vokal yeteneğiyle dünya müzik listelerinin zirvesini parselleyen en büyük hitlerin mimarıdır.";
    }
    if (cleanName.includes('eminem')) {
      return "Rap müziğin efsanevi ismi Eminem (Slim Shady); akıl almaz lirik hızı, etkileyici hikaye anlatımı ve agresif ritimleriyle hip-hop kültürünü tüm dünyaya yayan gelmiş geçmiş en büyük rap sanatçısıdır.";
    }
    if (cleanName.includes('dua lipa')) {
      return "Arnavut asıllı İngiliz süperstar Dua Lipa; güçlü retro-disko vokal tarzı, modern synth altyapıları ve listelerin zirvesinden düşmeyen enerjik hitleriyle dünya pop müziğinin kraliçesidir.";
    }
    return `${artistName}, özgün vokal tarzı, etkileyici şarkı sözleri ve yüksek sahne enerjisiyle geniş kitleleri peşinden sürükleyen, modern müzik listelerinde adından sıkça söz ettiren başarılı bir sanatçıdır.`;
  };

  const followersText = artistDetails 
    ? `${artistDetails.followers.toLocaleString('tr-TR')} Takipçi` 
    : '1,234,567 Aylık dinleyici';

  const artistImageUrl = artistDetails?.imageUrl || currentSong.coverUrl;

  return (
    <aside className={`right-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="right-sidebar-header">
        <h4>Şu An Çalıyor</h4>
        <div className="header-actions">
          <i className="fa-solid fa-ellipsis"></i>
          <i className="fa-solid fa-xmark" onClick={onClose} title="Kapat"></i>
        </div>
      </div>
      
      <div className="right-sidebar-cover-container">
        <img loading="lazy" decoding="async" src={currentSong.coverUrl} alt={currentSong.title} className="right-sidebar-cover"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
      </div>
      
      <div className="right-sidebar-info">
        <div className="info-text">
          <h2 className="right-song-title">{currentSong.title}</h2>
          <p className="right-song-artist">{currentSong.artist}</p>
        </div>
        <i className="fa-solid fa-circle-check text-green" title="Kitaplıkta var"></i>
      </div>

      <div className="right-sidebar-scrollable">
        <div className="right-sidebar-about">
          <div className="about-header">
            <h4>Sanatçı Hakkında</h4>
          </div>
          <div className="about-content glass-card-mini">
            <img loading="lazy" decoding="async" src={artistImageUrl} alt={currentSong.artist} className="about-artist-img"  onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
            <div className="about-artist-info">
              <h5>{currentSong.artist}</h5>
              <p>{followersText}</p>
            </div>
            <button 
              className="follow-btn" 
              onClick={handleFollow}
              style={isFollowing ? { background: 'rgba(255,255,255,0.2)' } : {}}
            >
              {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
            </button>
          </div>

          {/* Biyografi Kartı */}
          <div className="right-sidebar-bio glass-card-mini" style={{ padding: '15px' }}>
            <h5 style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginBottom: '8px', opacity: '0.9', display: 'flex', alignItems: 'center' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}></i>
              Biyografi
            </h5>
            <p style={{ fontSize: '12px', color: '#a0a0b0', lineHeight: '1.6', margin: '0' }}>
              {getArtistBio(currentSong.artist)}
            </p>
          </div>

          {/* Popüler Şarkılar Listesi */}
          {artistTracks.length > 0 && (
            <div className="right-sidebar-tracks" style={{ marginTop: '5px' }}>
              <h5 style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginBottom: '10px', opacity: '0.9', display: 'flex', alignItems: 'center' }}>
                <i className="fa-solid fa-fire" style={{ marginRight: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}></i>
                Popüler Şarkıları
              </h5>
              <div className="sidebar-track-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {artistTracks.map((track) => (
                  <div 
                    key={track.id} 
                    className="sidebar-track-item glass-card-mini" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      padding: '8px 10px', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderRadius: '8px'
                    }}
                    onClick={() => {
                      if (setCurrentSong) {
                        setCurrentSong(track);
                      }
                    }}
                  >
                    <img loading="lazy" decoding="async" src={track.coverUrl} alt={track.title} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }} />
                    <div style={{ flex: '1', minWidth: '0' }}>
                      <h6 style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</h6>
                    </div>
                    <i className="fa-solid fa-circle-play" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}></i>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
