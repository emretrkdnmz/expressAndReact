const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

// GET /api/deezer/artists - Popüler Sanatçıları Getir
router.get('/artists', async (req, res) => {
  try {
    const response = await axios.get(`https://api.deezer.com/chart/0/artists?limit=20`);
    
    const artists = response.data.data.map(artist => ({
      id: artist.id.toString(),
      name: artist.name,
      imageUrl: artist.picture_xl || artist.picture_medium || '/default-cover.svg',
      followers: 0 // Deezer chart endpoint doesn't return followers directly
    }));

    res.json(artists);
  } catch (error) {
    console.error('Sanatçılar çekilirken hata:', error.message);
    res.status(500).json({ error: 'Sanatçılar getirilemedi' });
  }
});

// GET /api/deezer/artists/:name - Belirli Bir Sanatçının Bilgileri ve Şarkıları
router.get('/artists/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Önce sanatçıyı bulup bilgilerini alalım
    const artistSearch = await axios.get(`https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=1`);
    
    let artistInfo = null;
    let songs = [];

    if (artistSearch.data.data.length > 0) {
      const foundArtist = artistSearch.data.data[0];
      artistInfo = {
        id: foundArtist.id.toString(),
        name: foundArtist.name,
        imageUrl: foundArtist.picture_xl || foundArtist.picture_medium || '/default-cover.svg',
        followers: foundArtist.nb_fan || 0
      };

      // Sanatçının en popüler şarkılarını çekelim
      const topTracks = await axios.get(`https://api.deezer.com/artist/${foundArtist.id}/top?limit=50`);
      
      songs = topTracks.data.data.map(track => ({
        _id: track.id.toString(),
        id: track.id.toString(),
        title: track.title,
        artist: artistInfo.name, // The top tracks belong to this artist
        coverUrl: track.album && track.album.cover_xl ? track.album.cover_xl : '/default-cover.svg',
        audioUrl: track.preview,
        duration_ms: track.duration * 1000 // Deezer returns seconds
      }));
    }

    res.json({ artist: artistInfo, songs });
  } catch (error) {
    console.error('Sanatçı bilgileri çekilirken hata:', error.message);
    res.status(500).json({ error: 'Sanatçı bilgileri getirilemedi' });
  }
});

// GET /api/deezer/songs - Popüler Şarkıları Getir
router.get('/songs', async (req, res) => {
  try {
    const response = await axios.get(`https://api.deezer.com/chart/0/tracks?limit=50`);

    const songs = response.data.data.map(track => ({
      _id: track.id.toString(),
      id: track.id.toString(),
      title: track.title,
      artist: track.artist ? track.artist.name : 'Bilinmeyen Sanatçı',
      coverUrl: track.album && track.album.cover_xl ? track.album.cover_xl : '/default-cover.svg',
      audioUrl: track.preview,
      duration_ms: track.duration * 1000
    }));

    res.json(songs);
  } catch (error) {
    console.error('Şarkılar çekilirken hata:', error.message);
    res.status(500).json({ error: 'Şarkılar getirilemedi' });
  }
});

// GET /api/deezer/genre/:genreName - Belirli türe göre şarkı getir
router.get('/genre/:genreName', async (req, res) => {
  try {
    const { genreName } = req.params;
    // We use search endpoint with genre filter
    const response = await axios.get(`https://api.deezer.com/search/track?q=genre:"${encodeURIComponent(genreName)}"&limit=20`);

    const songs = response.data.data.map(track => ({
      _id: track.id.toString(),
      id: track.id.toString(),
      title: track.title,
      artist: track.artist ? track.artist.name : 'Bilinmeyen Sanatçı',
      coverUrl: track.album && track.album.cover_xl ? track.album.cover_xl : '/default-cover.svg',
      audioUrl: track.preview,
      duration_ms: track.duration * 1000
    }));

    res.json(songs);
  } catch (error) {
    console.error('Tür şarkıları çekilirken hata:', error.message);
    res.status(500).json({ error: 'Tür şarkıları getirilemedi' });
  }
});

// GET /api/deezer/search - Arama Yap (Şarkı, Sanatçı ve Kullanıcılar)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ tracks: [], artists: [], users: [] });

    // Local Users Search
    const localUsers = await User.find({ username: { $regex: q, $options: 'i' } })
      .select('_id username profilePicture followers following');

    // Deezer API calls for tracks and artists in parallel
    const [tracksResponse, artistsResponse] = await Promise.all([
      axios.get(`https://api.deezer.com/search/track?q=${encodeURIComponent(q)}&limit=10`),
      axios.get(`https://api.deezer.com/search/artist?q=${encodeURIComponent(q)}&limit=10`)
    ]);

    const tracks = tracksResponse.data.data.map(track => ({
      _id: track.id.toString(),
      id: track.id.toString(),
      title: track.title,
      artist: track.artist ? track.artist.name : 'Bilinmeyen Sanatçı',
      coverUrl: track.album && track.album.cover_xl ? track.album.cover_xl : '/default-cover.svg',
      audioUrl: track.preview,
      duration_ms: track.duration * 1000
    }));

    const artists = artistsResponse.data.data.map(artist => ({
      id: artist.id.toString(),
      name: artist.name,
      imageUrl: artist.picture_xl || artist.picture_medium || '/default-cover.svg'
    }));

    res.json({ tracks, artists, users: localUsers });
  } catch (error) {
    console.error('Arama yapılırken hata:', error.message);
    res.status(500).json({ error: 'Arama başarısız' });
  }
});

module.exports = router;
