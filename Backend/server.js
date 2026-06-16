const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();
const connectDB = require('./config/db');
const songRoutes = require('./routes/songRoutes');
const authRoutes = require('./routes/authRoutes');
const deezerRoutes = require('./routes/deezerRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');

connectDB();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5173', 'http://127.0.0.1:5173',
        'http://localhost:5174', 'http://127.0.0.1:5174',
        'http://localhost:5175', 'http://127.0.0.1:5175'
    ],
    credentials: true
}));
app.use(express.json());

app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/deezer', deezerRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send("Sunucu Çalışıyor!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🖥️  Sunucu ${PORT} portunda hazır!`);
});