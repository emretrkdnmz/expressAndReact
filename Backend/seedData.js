require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const UserInteraction = require('./models/UserInteraction');
const Playlist = require('./models/Playlist');

const seedData = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/spotifyClone');
    console.log('MongoDB bağlandı. Veritabanı sıfırlanıyor...');

    // Koleksiyonları temizle
    await User.deleteMany({});
    await UserInteraction.deleteMany({});
    await Playlist.deleteMany({});
    console.log('Koleksiyonlar temizlendi.');

    // Örnek şifre oluştur
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // 3 Yeni Kullanıcı Oluştur
    const users = await User.insertMany([
      { username: 'ahmet', email: 'ahmet@example.com', password: hashedPassword, premiumStatus: 'Premium' },
      { username: 'ayse', email: 'ayse@example.com', password: hashedPassword, premiumStatus: 'Free' },
      { username: 'mehmet', email: 'mehmet@example.com', password: hashedPassword, premiumStatus: 'Premium' }
    ]);

    // Her kullanıcı için Interaction ve Playlist oluştur
    for (const user of users) {
      await UserInteraction.create({
        userId: user._id,
        followedArtists: [
          { id: '1', name: 'Tarkan', imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb1d2e8eb6326e1db053074d6d' },
          { id: '2', name: 'Sezen Aksu', imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4cb6e86ef56a1b808940e4ab' }
        ]
      });

      await Playlist.create({
        name: `${user.username} - Yol Şarkıları`,
        creatorId: user._id,
        coverImage: 'https://i.scdn.co/image/ab67706c0000da849880170a44279fc9edc113cd',
        tracks: []
      });
      
      await Playlist.create({
        name: `${user.username} - Spor Mix`,
        creatorId: user._id,
        coverImage: 'https://i.scdn.co/image/ab67706c0000da8402c34d38392576b5ab4e4026',
        tracks: []
      });
    }

    console.log('3 Kullanıcı, Etkileşimler ve Albümler başarıyla eklendi! Şifreleri: 123456');
    process.exit();
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
};

seedData();
