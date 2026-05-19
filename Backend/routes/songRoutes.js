const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const { protect } = require('../middleware/authMiddleware'); // 🔥 Muhafızı içeri al

// 🔵 TÜM ŞARKILARI GETİRME (Sadece Giriş Yapanlar Görebilir!)
// Araya "protect" ekledik; önce muhafız kontrol edecek, onaylarsa fonksiyon çalışacak.
router.get('/', protect, async (req, res) => {
    try {
        const songs = await Song.find();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;