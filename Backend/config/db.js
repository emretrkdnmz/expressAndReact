const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // .env dosyasındaki bağlantı linkini kullanarak MongoDB'ye bağlanıyoruz
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🚀 MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Veritabanı Bağlantı Hatası: ${error.message}`);
        process.exit(1); // Bağlantı başarısız olursa sunucuyu güvenli bir şekilde durdur
    }
};

module.exports = connectDB;