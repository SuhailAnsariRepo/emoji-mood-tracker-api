const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  note: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Mood = mongoose.model('Mood', moodSchema);

module.exports = Mood;
