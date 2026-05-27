import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ListeningStats = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMinutes: 0,
    genresList: [],
    hasHistory: false
  });

  // Artist to Genre Mapping Database (Turkish & Global)
  const artistGenreMap = {
    // Pop
    'michael jackson': 'Pop',
    'taylor swift': 'Pop',
    'billie eilish': 'Pop',
    'dua lipa': 'Pop',
    'rihanna': 'Pop',
    'justin bieber': 'Pop',
    'ed sheeran': 'Pop',
    'coldplay': 'Pop',
    'bruno mars': 'Pop',
    'tarkan': 'Pop',
    'sezen aksu': 'Pop',
    'hadise': 'Pop',
    'sertab erener': 'Pop',
    'kenan doğulu': 'Pop',
    'edis': 'Pop',
    'mabel matiz': 'Pop',
    'hande yener': 'Pop',
    'serdar ortaç': 'Pop',
    'mustafa sandal': 'Pop',
    'demet akalın': 'Pop',
    'sıla': 'Pop',
    'göksel': 'Pop',
    'buray': 'Pop',
    'yalın': 'Pop',
    'murat boz': 'Pop',
    'ajda pekkan': 'Pop',

    // Hip Hop / Rap
    'sagopa kajmer': 'Hip Hop',
    'sagopa': 'Hip Hop',
    'sago': 'Hip Hop',
    'ceza': 'Hip Hop',
    'ezhel': 'Hip Hop',
    'murda': 'Hip Hop',
    'uzi': 'Hip Hop',
    'motive': 'Hip Hop',
    'eminem': 'Hip Hop',
    'travis scott': 'Hip Hop',
    'drake': 'Hip Hop',
    'kendrick lamar': 'Hip Hop',
    'kanye west': 'Hip Hop',
    'post malone': 'Hip Hop',
    'jay-z': 'Hip Hop',
    'gazapizm': 'Hip Hop',
    'şanışer': 'Hip Hop',
    'ceg': 'Hip Hop',
    'khontkar': 'Hip Hop',
    'ben fero': 'Hip Hop',
    'şehinşah': 'Hip Hop',
    'anil piyanci': 'Hip Hop',

    // Rock
    'linkin park': 'Rock',
    'metallica': 'Rock',
    'queen': 'Rock',
    'ac/dc': 'Rock',
    'nirvana': 'Rock',
    'mor ve ötesi': 'Rock',
    'manga': 'Rock',
    'duman': 'Rock',
    'teoman': 'Rock',
    'şebnem ferah': 'Rock',
    'pentagram': 'Rock',
    'haluk levent': 'Rock',
    'barış manço': 'Rock',
    'cem karaca': 'Rock',
    'erkin koray': 'Rock',
    'yavuz çetin': 'Rock',
    'adamlar': 'Rock',
    'yüzyüzeyken konuşuruz': 'Rock',
    'dolu kadehi ters tut': 'Rock',
    'pinhani': 'Rock',
    'gripin': 'Rock',
    'yüksek sadakat': 'Rock',

    // Electronic / EDM
    'daft punk': 'Elektronik',
    'avicii': 'Elektronik',
    'calvin harris': 'Elektronik',
    'david guetta': 'Elektronik',
    'marshmello': 'Elektronik',
    'alan walker': 'Elektronik',
    'armin van buuren': 'Elektronik',
    'tiesto': 'Elektronik',
    'swedish house mafia': 'Elektronik',
    'kygo': 'Elektronik',
    'zedd': 'Elektronik',
    'deadmau5': 'Elektronik',
    'alesso': 'Elektronik',
    'martin garrix': 'Elektronik',
    'skrillex': 'Elektronik',
    'peggy gou': 'Elektronik',
    'mahnut orhan': 'Elektronik'
  };

  const genreColors = {
    'Pop': '#e2e2e8', // Premium Monochrome Gray/White
    'Hip Hop': '#ff4b4b', // Coral Red
    'Rock': '#3d91f4', // Classic Blue
    'Elektronik': '#f4b400', // Yellow
    'Diğer': '#8e44ad' // Purple
  };

  useEffect(() => {
    if (!user) return;
    const userId = user._id || user.id;
    const savedPlays = localStorage.getItem(`recentPlays_${userId}`);
    if (!savedPlays) {
      setStats({ totalMinutes: 0, genresList: [], hasHistory: false });
      return;
    }

    const recentTracks = JSON.parse(savedPlays);
    if (recentTracks.length === 0) {
      setStats({ totalMinutes: 0, genresList: [], hasHistory: false });
      return;
    }

    // 1. Calculate Listened Minutes in the Last 7 Days (Weekly Summary)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTracks = recentTracks.filter(track => {
      if (!track.playedAt) return true; // Default keep if no date
      return new Date(track.playedAt) >= sevenDaysAgo;
    });

    const totalMs = weeklyTracks.reduce((sum, track) => {
      // Use duration_ms, fallback to average 210,000ms (3.5 minutes)
      const duration = track.duration_ms || 210000;
      return sum + duration;
    }, 0);

    const totalMinutes = Math.round(totalMs / 60000);

    // 2. Classify Genres
    const genreCounts = {};
    weeklyTracks.forEach(track => {
      if (!track.artist) return;
      const cleanArtist = track.artist.trim().toLowerCase();
      
      // Look up artist in mapping database
      let matchedGenre = 'Diğer';
      for (const [artistKey, genre] of Object.entries(artistGenreMap)) {
        if (cleanArtist.includes(artistKey)) {
          matchedGenre = genre;
          break;
        }
      }

      genreCounts[matchedGenre] = (genreCounts[matchedGenre] || 0) + 1;
    });

    const totalWeeklySongs = weeklyTracks.length;
    const genresList = Object.entries(genreCounts).map(([name, count]) => {
      const percentage = Math.round((count / totalWeeklySongs) * 100);
      return {
        name,
        percentage,
        color: genreColors[name] || genreColors['Diğer']
      };
    }).sort((a, b) => b.percentage - a.percentage); // Sort descending

    setStats({
      totalMinutes,
      genresList,
      hasHistory: recentTracks.length > 0
    });
  }, [user]);

  return (
    <div className="profile-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h2>Dinleme İstatistikleri</h2>
      </div>

      <div className="detail-content">
        <div className="glass-card">
          <h3>Haftalık Özeti</h3>
          <div className="stat-hero">
            <div className="stat-number">
              {stats.hasHistory ? stats.totalMinutes.toLocaleString('tr-TR') : "0"}
            </div>
            <div className="stat-label">Bu hafta dinlenen dakika</div>
          </div>

          <h3 style={{ marginTop: '30px' }}>En Çok Dinlenen Türler</h3>
          
          {stats.hasHistory && stats.genresList.length > 0 ? (
            <div className="stats-bars">
              {stats.genresList.map((genre, index) => (
                <div className="stat-bar-container" key={index}>
                  <div className="stat-bar-header">
                    <span>{genre.name}</span>
                    <span>%{genre.percentage}</span>
                  </div>
                  <div className="progress-bg">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${genre.percentage}%`, backgroundColor: genre.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#a7a7a7' }}>
              <i className="fa-solid fa-music" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}></i>
              <p style={{ fontSize: '13.5px', lineHeight: '1.5', margin: '0' }}>
                Henüz dinleme istatistiğiniz oluşmadı.<br />
                Şarkı dinlemeye başladıkça istatistikleriniz burada dinamik olarak şekillenecektir!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListeningStats;
