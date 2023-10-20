const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sharingEnabled: { type: Boolean, default: true } // Default to true if sharing is enabled by default
});

const User = mongoose.model('User', userSchema);

module.exports = User;
