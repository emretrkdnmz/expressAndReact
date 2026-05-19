const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, default: "Single" },
    coverUrl: { type: String, default: "https://via.placeholder.com/150" },
    audioUrl: { type: String, required: true }
});

module.exports = mongoose.model('Song', SongSchema);