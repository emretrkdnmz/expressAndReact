const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Şifre şifreleme kütüphanesi

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // unique: Aynı isimden iki tane olamaz
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false } // İleride admin paneli yaparsak diye kapı bırakıyoruz
}, { timestamps: true }); // Kayıt olma tarihini otomatik tutar

// 🔥 SİHİRLİ MUKAVELE: Veritabanına kaydedilmeden hemen ÖNCE çalışır
UserSchema.pre('save', async function() {
    // Eğer şifre değiştirilmediyse veya yeni eklenmediyse hiçbir şey yapmadan çık
    if (!this.isModified('password')) return;
    
    // Şifreyi 10 turlu bir tuzlama (salt) işleminden geçirerek kırılmaz yapıyoruz
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 🔍 ŞİFRE KARŞILAŞTIRMA FONKSİYONU (Login için)
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Dışarıdan gelen düz şifre ile içerideki kriptolu şifreyi güvenle kıyaslar
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);