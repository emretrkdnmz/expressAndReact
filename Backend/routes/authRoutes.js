const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Brute Force protection for authentication routes
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // Max 100 attempts per IP per 10 minutes (raised for stable development/testing)
    message: { message: 'Çok fazla deneme yaptınız. Lütfen 10 dakika sonra tekrar deneyin.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'spotify_gizli_anahtar', {
        expiresIn: '30d'
    });
};

router.post('/register', authLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if email OR username is already in use
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            if (userExists.email === email) {
                return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda!' });
            } else {
                return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanımda!' });
            }
        }

        const user = await User.create({
            username,
            email,
            password
        });

        const UserInteraction = require('../models/UserInteraction');
        await UserInteraction.create({ userId: user._id });

        if (user) {
            const token = generateToken(user._id);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                premiumStatus: user.premiumStatus,
                isAdmin: user.isAdmin,
                token // Geriye dönük uyumluluk için dönmeye devam ediyoruz
            });
        } else {
            res.status(400).json({ message: 'Geçersiz kullanıcı verisi!' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔵 GİRİŞ YAPMA KAPISI (POST -> /api/auth/login)
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // email veya kullanıcı adına göre kullanıcıyı bul ama şifreyi de getir (select: false olduğu için)
        const user = await User.findOne({
            $or: [
                { email: email },
                { username: email }
            ]
        }).select('+password');

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);

            // JWT token HTTP-Only çerez olarak gönderilir
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 Gün
            });

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                premiumStatus: user.premiumStatus,
                isAdmin: user.isAdmin,
                token // Geriye dönük uyumluluk için dönmeye devam ediyoruz
            });
        } else {
            res.status(401).json({ message: 'Geçersiz kullanıcı adı/e-posta veya şifre!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔴 ÇIKIŞ YAPMA KAPISI (POST -> /api/auth/logout)
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true, message: 'Başarıyla çıkış yapıldı.' });
});

module.exports = router;