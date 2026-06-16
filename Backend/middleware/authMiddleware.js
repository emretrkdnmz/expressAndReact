const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token = req.cookies?.token;

    // Eğer çerezde token yoksa, Authorization header'ını kontrol et (geriye dönük uyumluluk için)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        const headerToken = authHeader.split(' ')[1];
        if (headerToken && headerToken !== 'undefined' && headerToken !== 'null') {
            token = headerToken;
        }
    }

    if (token) {
        try {
            // Token'ı gizli anahtarla çözüyoruz
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'spotify_gizli_anahtar');

            // Kullanıcıyı bulup şifresini gizleyerek req.user'a atıyoruz
            req.user = await User.findById(decoded.id).select('-password');

            return next(); // Yetkili erişim, devam et!
        } catch (error) {
            console.error("Token doğrulama hatası:", error.message);
            return res.status(401).json({ message: 'Yetkisiz Erişim! Token geçersiz.' });
        }
    }

    return res.status(401).json({ message: 'Yetkisiz Erişim! Token bulunamadı.' });
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    } else {
        return res.status(403).json({ message: 'Yetkisiz Erişim! Sadece yöneticiler bu işlemi yapabilir.' });
    }
};

module.exports = { protect, admin };