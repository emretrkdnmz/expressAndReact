const express = require('express');
const router = express.Router();
const UserInteraction = require('../models/UserInteraction');
const Playlist = require('../models/Playlist');
const { protect } = require('../middleware/authMiddleware');

// GET /api/library - Kullanıcının favori sanatçılarını ve albümlerini getir
router.get('/', protect, async (req, res) => {
  try {
    let interaction = await UserInteraction.findOne({ userId: req.user._id });
    if (!interaction) {
      interaction = await UserInteraction.create({ userId: req.user._id });
    }

    const playlists = await Playlist.find({ creatorId: req.user._id });

    const mappedAlbums = playlists.map(p => {
      const obj = p.toObject();
      obj.songs = obj.tracks || [];
      obj.coverUrl = obj.coverImage || '/default-cover.svgörsel+Yok';
      return obj;
    });

    res.json({
      favoriteArtists: interaction.followedArtists || [],
      albums: mappedAlbums
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kütüphane bilgileri getirilemedi' });
  }
});

// POST /api/library/favorites - Favori sanatçı ekle veya çıkar
router.post('/favorites', protect, async (req, res) => {
  try {
    const { artist } = req.body;
    let interaction = await UserInteraction.findOne({ userId: req.user._id });
    if (!interaction) interaction = await UserInteraction.create({ userId: req.user._id });

    const isFavorited = interaction.followedArtists.find(a => a.id === artist.id);

    if (isFavorited) {
      // Çıkar
      interaction.followedArtists = interaction.followedArtists.filter(a => a.id !== artist.id);
    } else {
      // Ekle
      interaction.followedArtists.push(artist);
    }

    await interaction.save();
    res.json(interaction.followedArtists);
  } catch (error) {
    res.status(500).json({ message: 'Favori işlemi başarısız' });
  }
});

// POST /api/library/albums - Yeni albüm (playlist) oluştur
router.post('/albums', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Albüm ismi gerekli' });

    const newPlaylist = await Playlist.create({
      name,
      creatorId: req.user._id,
      tracks: []
    });

    // Frontend, "songs" array bekliyor olabilir (albums objesinde). Playlist şemasındaki tracks'ı songs gibi dönelim
    const createdAlbum = newPlaylist.toObject();
    createdAlbum.songs = createdAlbum.tracks;
    
    res.status(201).json(createdAlbum);
  } catch (error) {
    res.status(500).json({ message: 'Albüm oluşturulamadı' });
  }
});

// POST /api/library/albums/:albumId/songs - Albüme şarkı ekle
router.post('/albums/:albumId/songs', protect, async (req, res) => {
  try {
    const { albumId } = req.params;
    const { song } = req.body;

    const playlist = await Playlist.findOne({ _id: albumId, creatorId: req.user._id });
    if (!playlist) return res.status(404).json({ message: 'Albüm bulunamadı veya yetkisiz' });

    // Şarkı zaten var mı?
    const isSongExists = playlist.tracks.find(s => s.id === song.id || s._id === song.id);
    if (isSongExists) {
      return res.status(400).json({ message: 'Bu şarkı zaten albümde var' });
    }

    playlist.tracks.push(song);
    
    if (playlist.tracks.length === 1 && song.coverUrl) {
      playlist.coverImage = song.coverUrl; // Schema names it coverImage
    }

    await playlist.save();
    
    // Return frontend compatible format
    const updatedAlbum = playlist.toObject();
    updatedAlbum.songs = updatedAlbum.tracks;
    updatedAlbum.coverUrl = updatedAlbum.coverImage;

    res.json(updatedAlbum);
  } catch (error) {
    res.status(500).json({ message: 'Şarkı albüme eklenemedi' });
  }
});

// DELETE /api/library/albums/:albumId - Albüm sil
router.delete('/albums/:albumId', protect, async (req, res) => {
  try {
    const { albumId } = req.params;
    const deletedAlbum = await Playlist.findOneAndDelete({ _id: albumId, creatorId: req.user._id });
    
    if (!deletedAlbum) {
      return res.status(404).json({ message: 'Albüm bulunamadı veya yetkiniz yok' });
    }
    
    res.json({ message: 'Albüm başarıyla silindi', deletedId: albumId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Albüm silinirken bir hata oluştu' });
  }
});

module.exports = router;
