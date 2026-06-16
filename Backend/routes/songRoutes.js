const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const { protect } = require('../middleware/authMiddleware'); // 🔥 Muhafızı içeri al

// 🔵 TÜM ŞARKILARI GETİRME (Sadece Giriş Yapanlar Görebilir!)
// Araya "protect" ekledik; önce muhafız kontrol edecek, onaylarsa fonksiyon çalışacak.
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Song.countDocuments();
        const songs = await Song.find().skip(skip).limit(limit);

        res.status(200).json({
            songs,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalSongs: total,
            hasMore: page * limit < total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;