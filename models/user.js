const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sharingEnabled: { type: Boolean, default: true }, // Default to true if sharing is enabled by default
  shareId: { type: String } // New field for storing the unique share ID
});

const User = mongoose.model('User', userSchema);

module.exports = User;
