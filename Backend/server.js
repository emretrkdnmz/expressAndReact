const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); // .env dosyasındaki verileri okuyabilmek için
const connectDB = require('./config/db'); // Az önce yazdığımız fonksiyonu çağırıyoruz
const songRoutes = require('./routes/songRoutes');
const authRoutes = require('./routes/authRoutes');
const deezerRoutes = require('./routes/deezerRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

// Veritabanı Bağlantısını Başlat79
connectDB();

// Middleware (Ara Yazılımlar)
app.use(cors());
app.use(express.json()); // Dışarıdan gelen JSON verilerini okuyabilmek için

// 🚀 YENİ ROTALARI BURAYA BAĞLIYORUZ (Routes)
app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes); // Auth rotası eklendi
app.use('/api/deezer', deezerRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/user', userRoutes);

// Statik Profil Fotoğrafları için (localhost:5000/uploads/...)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send("Sunucu Çalışıyor!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🖥️  Sunucu ${PORT} portunda hazır!`);
});