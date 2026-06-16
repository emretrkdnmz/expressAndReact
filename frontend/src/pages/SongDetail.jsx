import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SongDetail.css';

const SongDetail = ({
  currentSong,
  isPlaying,
  togglePlay,
  currentTime,
  duration,
  volume,
  setVolume,
  handleNextSong,
  handlePrevSong,
  isShuffle,
  setIsShuffle,
  isRepeat,
  setIsRepeat,
  formatTime,
  handleProgressChange,
  handleProgressStart,
  handleProgressEnd,
  isDragging,
  dragValue
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('visualizer'); // 'visualizer' or 'lyrics'
  const [musicalNotes, setMusicalNotes] = useState([]);
  
  // Equalizer frequency simulation bars
  const [freqData, setFreqData] = useState(new Array(16).fill(20));
  const freqIntervalRef = useRef(null);

  // Sync back to main songs view if no song is playing
  useEffect(() => {
    if (!currentSong) {
      navigate('/songs');
    }
  }, [currentSong, navigate]);

  // Simulate Equalizer frequencies when playing
  useEffect(() => {
    if (isPlaying) {
      freqIntervalRef.current = setInterval(() => {
        setFreqData(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
      }, 100);
    } else {
      if (freqIntervalRef.current) clearInterval(freqIntervalRef.current);
      setFreqData(new Array(16).fill(10));
    }
    return () => {
      if (freqIntervalRef.current) clearInterval(freqIntervalRef.current);
    };
  }, [isPlaying]);

  // Generate floating musical notes
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const icons = ['fa-music', 'fa-note-sticky', 'fa-volume-high', 'fa-compact-disc'];
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        const note = {
          id: Date.now() + Math.random(),
          left: Math.random() * 80 + 10 + '%',
          size: Math.random() * 16 + 12 + 'px',
          animationDuration: Math.random() * 4 + 3 + 's',
          icon: randomIcon,
          color: `hsl(${Math.random() * 360}, 85%, 70%)`
        };
        setMusicalNotes(prev => [...prev, note].slice(-15)); // Keep max 15 floating notes
      }, 800);

      return () => clearInterval(interval);
    } else {
      setMusicalNotes([]);
    }
  }, [isPlaying]);

  if (!currentSong) return null;

  const currentVolPercentage = Math.round(volume * 100);

  return (
    <div className="song-detail-container">
      <div className="song-detail-blur-bg" style={{ backgroundImage: `url(${currentSong.coverUrl})` }}></div>
      
      {/* HEADER SECTION */}
      <div className="song-detail-header">
        <button className="detail-back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-chevron-left"></i> Geri Dön
        </button>
        <div className="detail-header-center">
          <span className="detail-now-playing-label">ŞU AN ÇALIYOR</span>
          <h2 className="detail-song-title-heading">{currentSong.title}</h2>
        </div>
        <div className="detail-header-right">
          <button className={`detail-tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`} onClick={() => setActiveTab('visualizer')}>
            <i className="fa-solid fa-circle-nodes"></i> Görselleştirici
          </button>
          <button className={`detail-tab-btn ${activeTab === 'lyrics' ? 'active' : ''}`} onClick={() => setActiveTab('lyrics')}>
            <i className="fa-solid fa-microphone-lines"></i> Sözler
          </button>
        </div>
      </div>

      {/* FLOATING MUSICAL NOTES IN BACKGROUND */}
      <div className="floating-notes-container">
        {musicalNotes.map(note => (
          <i
            key={note.id}
            className={`fa-solid ${note.icon} floating-note-particle`}
            style={{
              left: note.left,
              fontSize: note.size,
              animationDuration: note.animationDuration,
              color: note.color,
              textShadow: `0 0 10px ${note.color}`
            }}
          ></i>
        ))}
      </div>

      {/* MAIN BODY LAYOUT */}
      <div className="song-detail-body">
        
        {/* LEFT COLUMN: SPINNING DECK */}
        <div className="detail-deck-column">
          <div className="vinyl-deck-wrapper">
            <div className={`vinyl-disc ${isPlaying ? 'spinning' : 'paused'}`}>
              <div className="vinyl-grooves"></div>
              <img 
                src={currentSong.coverUrl} 
                alt={currentSong.title} 
                className="vinyl-center-art" 
                onError={(e) => { e.target.onerror = null; e.target.src = "/default-cover.svg" }}
              />
              <div className="vinyl-center-spindle"></div>
            </div>
            
            {/* Tone arm stylus */}
            <div className={`vinyl-tone-arm ${isPlaying ? 'active' : 'inactive'}`}>
              <div className="tone-arm-base"></div>
              <div className="tone-arm-shaft"></div>
              <div className="tone-arm-head"></div>
            </div>
            
            {/* Glowing neon pulse matching the beat */}
            <div className={`vinyl-deck-pulse ${isPlaying ? 'active-beat' : ''}`}></div>
          </div>
          
          <div className="detail-song-meta">
            <h1 className="detail-meta-title">{currentSong.title}</h1>
            <p className="detail-meta-artist" onClick={() => navigate(`/artist/${encodeURIComponent(currentSong.artist)}`)}>
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: WORKSPACE (VISUALIZER OR LYRICS) */}
        <div className="detail-workspace-column glass-panel">
          {activeTab === 'visualizer' ? (
            <div className="detail-visualizer-view">
              
              {/* RADIAL VOLUME LEVEL METER */}
              <div className="radial-volume-section">
                <div className="radial-volume-gauge" style={{ '--vol-percentage': currentVolPercentage }}>
                  <div className="radial-inner-circle">
                    <span className="radial-vol-icon"><i className="fa-solid fa-volume-high"></i></span>
                    <span className="radial-vol-number">{currentVolPercentage}%</span>
                    <span className="radial-vol-label">Ses Seviyesi</span>
                  </div>
                  {/* Glowing dynamic background arcs */}
                  <svg className="radial-svg-circle">
                    <circle cx="85" cy="85" r="75" className="radial-bg-track"></circle>
                    <circle cx="85" cy="85" r="75" className="radial-progress-track" style={{ strokeDashoffset: 471 - (471 * volume) }}></circle>
                  </svg>
                </div>
                
                <div className="radial-volume-controls">
                  <button className="vol-step-btn" onClick={() => setVolume(Math.max(0, volume - 0.1))}><i className="fa-solid fa-minus"></i></button>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="detail-vol-slider"
                  />
                  <button className="vol-step-btn" onClick={() => setVolume(Math.min(1, volume + 0.1))}><i className="fa-solid fa-plus"></i></button>
                </div>
              </div>

              {/* FREQUENCY EQUALIZER BARS */}
              <div className="frequency-analyzer-section">
                <div className="freq-bar-header">
                  <span><i className="fa-solid fa-wave-square"></i> FREKANS SPEKTRUMU</span>
                  <span className="audio-note-indicator">
                    <i className="fa-solid fa-music"></i> NOTA: {isPlaying ? 'Sol Majör (G)' : 'PASİF'}
                  </span>
                </div>
                <div className="freq-bars-container">
                  {freqData.map((height, idx) => (
                    <div key={idx} className="freq-bar-wrapper">
                      <div 
                        className="freq-bar-fill" 
                        style={{ 
                          height: height + '%',
                          background: `linear-gradient(to top, #7e22ce 0%, hsl(${270 + idx * 5}, 85%, 60%) 100%)`,
                          boxShadow: `0 0 10px hsl(${270 + idx * 5}, 85%, 60%)`
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="freq-labels">
                  <span>20Hz</span>
                  <span>500Hz</span>
                  <span>2KHz</span>
                  <span>10KHz</span>
                  <span>20KHz</span>
                </div>
              </div>
              
              {/* CURRENT PLAYING DECK STATS */}
              <div className="detail-stat-row">
                <div className="detail-stat-card-micro">
                  <span className="stat-card-micro-label">DOSYA TÜRÜ</span>
                  <span className="stat-card-micro-value"><i className="fa-solid fa-file-audio" style={{color: '#a855f7'}}></i> FLAC (1411kbps)</span>
                </div>
                <div className="detail-stat-card-micro">
                  <span className="stat-card-micro-label">ÖRNEKLEME</span>
                  <span className="stat-card-micro-value"><i className="fa-solid fa-bolt" style={{color: '#ffd700'}}></i> 24-Bit / 96kHz</span>
                </div>
              </div>

            </div>
          ) : (
            /* LYRICS PANEL VIEW */
            <div className="detail-lyrics-view">
              <div className="lyrics-header-row">
                <h3><i className="fa-solid fa-microphone-lines" style={{color: '#a855f7'}}></i> Şarkı Sözleri</h3>
                <span className="lyrics-badge">BETA</span>
              </div>
              <div className="lyrics-scroller">
                <p className="lyrics-line past">Bu bir önizleme sürümüdür.</p>
                <p className="lyrics-line active">Şarkı çalmaya devam ediyor: "{currentSong.title}"</p>
                <p className="lyrics-line future">Ses dalgası spektrumu frekansları analiz ediliyor...</p>
                <p className="lyrics-line future">Sanatçı: {currentSong.artist}</p>
                <p className="lyrics-line future">Deezer entegrasyonu üzerinden yüksek kaliteli ses dosyası çalınmaktadır.</p>
                <p className="lyrics-line future">İyi dinlemeler!</p>
                <p className="lyrics-line future" style={{opacity: 0.15}}>...</p>
                <p className="lyrics-line future" style={{opacity: 0.05}}>...</p>
              </div>
            </div>
          )}

          {/* LOWER CONTROLS & TIMELINE (ACTIVE SYNCED TIMELINE) */}
          <div className="detail-player-controls-container">
            <div className="detail-timeline-block">
              <span className="detail-time-text">{formatTime(isDragging ? dragValue : currentTime)}</span>
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
                className="detail-timeline-slider"
                disabled={!currentSong.audioUrl}
                style={{
                  background: `linear-gradient(to right, #a855f7 ${
                    duration ? ((isDragging ? dragValue : currentTime) / duration) * 100 : 0
                  }%, rgba(255,255,255,0.15) ${duration ? ((isDragging ? dragValue : currentTime) / duration) * 100 : 0}%)`
                }}
              />
              <span className="detail-time-text">{formatTime(duration)}</span>
            </div>

            <div className="detail-media-controls">
              <button 
                className={`detail-control-btn shuffle ${isShuffle ? 'active' : ''}`} 
                onClick={() => setIsShuffle(!isShuffle)} 
                title="Karıştır"
              >
                <i className="fa-solid fa-shuffle"></i>
              </button>
              
              <button 
                className="detail-control-btn prev" 
                onClick={handlePrevSong} 
                title="Önceki"
              >
                <i className="fa-solid fa-backward-step"></i>
              </button>
              
              <button 
                className="detail-big-play-btn" 
                onClick={togglePlay}
                disabled={!currentSong.audioUrl}
                title={isPlaying ? 'Durdur' : 'Oynat'}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
              
              <button 
                className="detail-control-btn next" 
                onClick={handleNextSong} 
                title="Sonraki"
              >
                <i className="fa-solid fa-forward-step"></i>
              </button>
              
              <button 
                className={`detail-control-btn repeat ${isRepeat > 0 ? 'active' : ''} ${isRepeat === 2 ? 'repeat-one' : ''}`} 
                onClick={() => setIsRepeat((isRepeat + 1) % 3)} 
                title={isRepeat === 2 ? "Şarkıyı Tekrarla" : isRepeat === 1 ? "Tümünü Tekrarla" : "Tekrarlama Kapalı"}
                style={{ position: 'relative' }}
              >
                <i className="fa-solid fa-repeat"></i>
                {isRepeat === 2 && <span className="repeat-one-badge">1</span>}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SongDetail;
