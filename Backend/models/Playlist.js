const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverImage: {
    type: String,
    default: '/default-cover.svg'
  },
  tracks: [{
    _id: String,
    id: String,
    title: String,
    artist: String,
    coverUrl: String,
    audioUrl: String,
    duration_ms: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);
