const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🎟️ TOKEN ÜRETME YARDIMCISI
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'spotify_gizli_anahtar', {
        expiresIn: '30d'
    });
};

// =========================================================================
// 🟢 YENİ EKLEDİĞİMİZ KISIM: KAYIT OLMA KAPISI (POST -> /api/auth/register)
// =========================================================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Kontrol: Bu e-posta adresi veritabanında zaten var mı?
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda!' });
        }

        // 2. Adım: Eğer yoksa, yeni kullanıcıyı oluştur (Şifre şifreleme işini User modelindeki pre('save') kancası hallediyor)
        const user = await User.create({
            username,
            email,
            password
        });

        // 3. Adım: Başarıyla oluşturulduysa, verileri ve token'ı fırlat
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Geçersiz kullanıcı verisi!' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔵 GİRİŞ YAPMA KAPISI (POST -> /api/auth/login)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Geçersiz e-posta veya şifre!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;