const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); // .env dosyasındaki verileri okuyabilmek için
const connectDB = require('./config/db'); // Az önce yazdığımız fonksiyonu çağırıyoruz
const songRoutes = require('./routes/songRoutes');
const authRoutes = require('./routes/authRoutes');

// Veritabanı Bağlantısını Başlat
connectDB();

// Middleware (Ara Yazılımlar)
app.use(cors());
app.use(express.json()); // Dışarıdan gelen JSON verilerini sunucunun anlayabilmesi için
app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send("Sunucu Çalışıyor!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🖥️  Sunucu ${PORT} portunda hazır!`);
});