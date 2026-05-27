const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Hem 'authorization' hem 'Authorization' gelebilme ihtimaline karşı iki kapıyı da kontrol ediyoruz
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            // 'Bearer <token>' metnini ayırıyoruz
            token = authHeader.split(' ')[1];

            // Token'ı gizli anahtarla çözüyoruz
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'spotify_gizli_anahtar');

            // Kullanıcıyı bulup şifresini gizleyerek req.user'a atıyoruz
            req.user = await User.findById(decoded.id).select('-password');

            return next(); // Şarkıları getirmeye izin ver!
        } catch (error) {
            console.error("Token doğrulama hatası:", error.message);
            return res.status(401).json({ message: 'Yetkisiz Erişim! Token geçersiz.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Yetkisiz Erişim! Token bulunamadı.' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    } else {
        return res.status(403).json({ message: 'Yetkisiz Erişim! Sadece yöneticiler bu işlemi yapabilir.' });
    }
};

module.exports = { protect, admin };