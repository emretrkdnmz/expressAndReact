import React, { useState } from 'react';
import axios from 'axios';
import './AiModal.css';

const AiModal = ({ isOpen, onClose, user, setCurrentSong, setAlbums }) => {
  const [prompt, setPrompt] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playlistStatus, setPlaylistStatus] = useState('idle'); // 'idle' | 'creating' | 'success' | 'error'

  if (!isOpen) return null;

  // Simple and Smart Keyword Extractor (Turkish & English)
  const extractKeywords = (userInput) => {
    const text = userInput.toLowerCase().trim();
    if (!text) return '';

    // Vibe & Theme Matches
    if (text.includes('spor') || text.includes('koşu') || text.includes('antrenman') || text.includes('workout') || text.includes('enerjik') || text.includes('hareketli') || text.includes('fitness')) {
      return 'workout energetic dance fitness';
    }
    if (text.includes('yağmur') || text.includes('sakin') || text.includes('hüzünlü') || text.includes('dinlendirici') || text.includes('relax') || text.includes('chill') || text.includes('uyku') || text.includes('gece')) {
      return 'chill relaxing lofi acoustic soft';
    }
    if (text.includes('90') || text.includes('90lar') || text.includes('90\'lar') || text.includes('doksanlar')) {
      return '90s pop hits';
    }
    if (text.includes('türkçe') || text.includes('turkce')) {
      if (text.includes('pop')) return 'türkçe pop';
      if (text.includes('rap')) return 'türkçe rap';
      if (text.includes('rock')) return 'türkçe rock';
      return 'türkçe hits';
    }
    if (text.includes('klasik') || text.includes('classical') || text.includes('piyano') || text.includes('piano') || text.includes('keman') || text.includes('enstrümantal')) {
      return 'classical piano instrumental sleep';
    }
    if (text.includes('ders') || text.includes('odak') || text.includes('çalış') || text.includes('study') || text.includes('focus') || text.includes('yazılım')) {
      return 'lofi study beats jazz chillout';
    }
    if (text.includes('aşk') || text.includes('romantik') || text.includes('sevgili') || text.includes('love') || text.includes('duygusal')) {
      return 'love songs acoustic romance';
    }
    if (text.includes('yol') || text.includes('araba') || text.includes('sürüş') || text.includes('road') || text.includes('travel')) {
      return 'road trip driving hits summer';
    }
    if (text.includes('yaz') || text.includes('plaj') || text.includes('tatil') || text.includes('summer') || text.includes('beach')) {
      return 'summer dance pop hits';
    }

    // Default: use the parsed prompt terms
    return text.split(' ').slice(0, 3).join(' ');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !user?.token) return;

    setLoading(true);
    setPlaylistStatus('idle');
    setSongs([]);

    try {
      const keywords = extractKeywords(prompt);
      const res = await axios.get(`http://localhost:5000/api/deezer/search?q=${encodeURIComponent(keywords)}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Filter and limit to 8 beautiful songs
      if (res.data && res.data.tracks) {
        const fetchedTracks = res.data.tracks.slice(0, 8);
        setSongs(fetchedTracks);
      }
    } catch (err) {
      console.error("AI Müzik üretimi başarısız:", err);
      alert("Şarkılar önerilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (songs.length === 0 || !user?.token) return;
    setPlaylistStatus('creating');

    try {
      // 1. Create a new album/playlist
      const playlistName = `AI: ${prompt.trim().substring(0, 25)}`;
      const createRes = await axios.post(
        'http://localhost:5000/api/library/albums',
        { name: playlistName },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const newAlbum = createRes.data;

      // 2. Add all recommended songs in sequence
      for (const song of songs) {
        await axios.post(
          `http://localhost:5000/api/library/albums/${newAlbum._id}/songs`,
          { song },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
      }

      // 3. Refresh sidebar albums list
      const libraryRes = await axios.get('http://localhost:5000/api/library', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (setAlbums) {
        setAlbums(libraryRes.data.albums);
      }

      setPlaylistStatus('success');
      setTimeout(() => {
        setPlaylistStatus('idle');
      }, 3000);
    } catch (err) {
      console.error("AI Playlist oluşturulamadı:", err);
      setPlaylistStatus('error');
    }
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="ai-modal-header">
          <h3>
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Yapay Zeka ile Müzik Asistanı
          </h3>
          <button className="ai-modal-close-btn" onClick={onClose} title="Kapat">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="ai-input-container">
          <textarea
            className="ai-prompt-textarea"
            placeholder="Nasıl bir müzik dinlemek istersin? (Örn: Yağmurlu bir günde dinlenecek sakin şarkılar, Türkçe 90'lar Pop, Enerjik spor müzikleri...)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading || playlistStatus === 'creating'}
          />
          <button 
            type="submit" 
            className="ai-submit-btn" 
            disabled={loading || !prompt.trim() || playlistStatus === 'creating'}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-wand-magic-sparkles sparkle-spin"></i>
                Vibe Analiz Ediliyor...
              </>
            ) : (
              <>
                <i className="fa-solid fa-bolt"></i>
                Havasını Bul!
              </>
            )}
          </button>
        </form>

        {/* Results Container */}
        <div className="ai-results-container">
          {loading ? (
            <div className="ai-results-empty">
              <div className="mini-spinner"></div>
              <p>Yapay Zeka kütüphaneleri tarıyor ve size en uygun şarkıları seçiyor...</p>
            </div>
          ) : songs.length > 0 ? (
            <div className="ai-songs-list">
              {songs.map((song) => (
                <div key={song.id} className="ai-song-item">
                  <div className="ai-song-info" onClick={() => setCurrentSong && setCurrentSong(song)}>
                    <img 
                      loading="lazy" 
                      decoding="async" 
                      src={song.coverUrl} 
                      alt={song.title} 
                      onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg"; }}
                    />
                    <div className="ai-song-details">
                      <h5>{song.title}</h5>
                      <p>{song.artist}</p>
                    </div>
                  </div>
                  <button 
                    className="ai-play-btn" 
                    onClick={() => setCurrentSong && setCurrentSong(song)}
                    title="Çal"
                  >
                    <i className="fa-solid fa-circle-play"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="ai-results-empty">
              <i className="fa-solid fa-compass"></i>
              <p>
                Nasıl hissettiğinizi veya ne tür bir müzik aradığınızı yukarıdaki alana yazın. Yapay Zeka anında uygun şarkıları listeleyecektir!
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {songs.length > 0 && (
          <div className="ai-modal-footer">
            {playlistStatus === 'success' ? (
              <span className="ai-success-msg">
                <i className="fa-solid fa-circle-check"></i>
                Çalma listeniz başarıyla oluşturuldu ve kütüphanenize eklendi!
              </span>
            ) : (
              <button 
                className="ai-create-playlist-btn"
                onClick={handleCreatePlaylist}
                disabled={playlistStatus === 'creating'}
              >
                {playlistStatus === 'creating' ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Liste Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-folder-plus"></i>
                    Bu Listeden Çalma Listesi Oluştur
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AiModal;
