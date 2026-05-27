const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserInteraction = require('../models/UserInteraction');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET /api/user/profile - Kullanıcı Profili Getir
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    const interaction = await UserInteraction.findOne({ userId: req.user._id });
    
    // Dinamik olarak follower/following hesapla
    const followersCount = interaction ? interaction.followersList.length : 0;
    const followingCount = interaction ? (interaction.followedUsers.length + interaction.followedArtists.length) : 0;

    const userProfile = {
      ...user.toObject(),
      followers: followersCount,
      following: followingCount,
      followedUsers: interaction ? interaction.followedUsers : []
    };

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/user/connections - Takipçiler ve Takip Edilenler Detayları
router.get('/connections', protect, async (req, res) => {
  try {
    const interaction = await UserInteraction.findOne({ userId: req.user._id })
      .populate({
        path: 'followedUsers',
        select: 'username profilePicture email premiumStatus'
      })
      .populate({
        path: 'followersList',
        select: 'username profilePicture email premiumStatus'
      });

    if (!interaction) {
      return res.json({ followers: [], following: [] });
    }

    const followingUsers = interaction.followedUsers || [];
    const followingArtists = (interaction.followedArtists || []).map(artist => ({
      _id: artist.id,
      username: artist.name,
      profilePicture: artist.imageUrl || '/default-cover.svg',
      isArtist: true,
      premiumStatus: 'Sanatçı'
    }));

    res.json({
      followers: interaction.followersList || [],
      following: [...followingUsers, ...followingArtists]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/user/profile - Profili Güncelle (Fotoğraf dahil)
router.put('/profile', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (req.body.username) {
      user.username = req.body.username;
    }

    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      user.profilePicture = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();
    
    const interaction = await UserInteraction.findOne({ userId: req.user._id });
    const followersCount = interaction ? interaction.followersList.length : 0;
    const followingCount = interaction ? (interaction.followedUsers.length + interaction.followedArtists.length) : 0;

    res.json({
      ...updatedUser.toObject(),
      followers: followersCount,
      following: followingCount,
      followedUsers: interaction ? interaction.followedUsers : []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/user/premium - Premium Durumuna Yükselt (Ödeme Sonrası)
router.post('/premium', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.premiumStatus = 'Premium';
    const updatedUser = await user.save();

    const interaction = await UserInteraction.findOne({ userId: req.user._id });
    const followersCount = interaction ? interaction.followersList.length : 0;
    const followingCount = interaction ? (interaction.followedUsers.length + interaction.followedArtists.length) : 0;

    res.json({
      ...updatedUser.toObject(),
      followers: followersCount,
      following: followingCount,
      followedUsers: interaction ? interaction.followedUsers : []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/user/premium/cancel - Premium Durumunu İptal Et (Free Yap)
router.post('/premium/cancel', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.premiumStatus = 'Free';
    const updatedUser = await user.save();

    const interaction = await UserInteraction.findOne({ userId: req.user._id });
    const followersCount = interaction ? interaction.followersList.length : 0;
    const followingCount = interaction ? (interaction.followedUsers.length + interaction.followedArtists.length) : 0;

    res.json({
      ...updatedUser.toObject(),
      followers: followersCount,
      following: followingCount,
      followedUsers: interaction ? interaction.followedUsers : []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/user/search-history
router.get('/search-history', protect, async (req, res) => {
  try {
    let interaction = await UserInteraction.findOne({ userId: req.user._id });
    if (!interaction) {
      interaction = await UserInteraction.create({ userId: req.user._id });
    }
    res.json(interaction.searchHistory || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/user/search-history
router.post('/search-history', protect, async (req, res) => {
  try {
    const { term } = req.body;
    if (!term) return res.status(400).json({ message: 'Arama terimi gereklidir' });

    let interaction = await UserInteraction.findOne({ userId: req.user._id });
    if (!interaction) {
      interaction = await UserInteraction.create({ userId: req.user._id });
    }

    let history = interaction.searchHistory || [];
    history = history.filter(item => item !== term);
    history.unshift(term);
    if (history.length > 15) history.pop();

    interaction.searchHistory = history;
    await interaction.save();

    res.json(interaction.searchHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/user/search-history
router.delete('/search-history', protect, async (req, res) => {
  try {
    const interaction = await UserInteraction.findOne({ userId: req.user._id });
    if (interaction) {
      interaction.searchHistory = [];
      await interaction.save();
    }
    res.json({ message: 'Arama geçmişi temizlendi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/user/follow/:id
router.post('/follow/:id', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Kendinizi takip edemezsiniz' });
    }

    let currentInteraction = await UserInteraction.findOne({ userId: currentUserId });
    let targetInteraction = await UserInteraction.findOne({ userId: targetUserId });

    if (!currentInteraction) currentInteraction = await UserInteraction.create({ userId: currentUserId });
    if (!targetInteraction) targetInteraction = await UserInteraction.create({ userId: targetUserId });

    const isFollowing = currentInteraction.followedUsers.includes(targetUserId);

    if (isFollowing) {
      currentInteraction.followedUsers = currentInteraction.followedUsers.filter(id => id.toString() !== targetUserId);
      targetInteraction.followersList = targetInteraction.followersList.filter(id => id.toString() !== currentUserId.toString());
    } else {
      currentInteraction.followedUsers.push(targetUserId);
      targetInteraction.followersList.push(currentUserId);
    }

    await currentInteraction.save();
    await targetInteraction.save();

    res.json({ followedUsers: currentInteraction.followedUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/user/announcements - Genel Duyuruları Getir (Kullanıcılar İçin)
router.get('/announcements', protect, async (req, res) => {
  try {
    const Announcement = require('../models/Announcement');
    const announcements = await Announcement.find()
      .populate('publishedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
