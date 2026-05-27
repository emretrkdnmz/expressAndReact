const mongoose = require('mongoose');

const UserInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  likedTracks: [{
    id: { type: String, required: true },
    title: String,
    artist: String,
    coverUrl: String,
    audioUrl: String,
    duration_ms: Number,
    addedAt: { type: Date, default: Date.now }
  }],
  followedArtists: [{
    id: { type: String, required: true }, // Deezer Artist ID
    name: { type: String, required: true },
    imageUrl: { type: String }
  }],
  savedAlbums: [{
    type: String // Deezer Album ID or Playlist ObjectID
  }],
  recentlyPlayed: [{
    trackId: { type: String, required: true },
    playedAt: { type: Date, default: Date.now }
  }],
  searchHistory: [{ type: String }],
  followedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followersList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

UserInteractionSchema.pre('save', function() {
  if (this.recentlyPlayed && this.recentlyPlayed.length > 50) {
    this.recentlyPlayed = this.recentlyPlayed.slice(-50); // Keep last 50
  }
});

module.exports = mongoose.model('UserInteraction', UserInteractionSchema);
