const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Mood = require('../models/mood');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET;

exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.logMood = async (req, res) => {
  try {
    const { emoji, note } = req.body;
    const moodEntry = await Mood.create({ emoji, note, userId: req.user.userId });
    res.json(moodEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log mood entry' });
  }
};

exports.getMoodEntries = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user.userId });
    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get mood entries' });
  }
};

exports.updateMood = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji, note } = req.body;
    const updatedMood = await Mood.findOneAndUpdate({ _id: id, userId: req.user.userId }, { emoji, note }, { new: true });
    if (!updatedMood) {
      res.status(404).json({ error: 'Mood entry not found' });
      return;
    }
    res.json(updatedMood);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mood entry' });
  }
};

exports.deleteMood = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMood = await Mood.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!deletedMood) {
      res.status(404).json({ error: 'Mood entry not found' });
      return;
    }
    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mood entry' });
  }
};

exports.getMonthlySummary = async (req, res) => {
  try {
    // Implement logic to retrieve monthly summary
    // ...
    res.json({}); // Placeholder response
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve monthly summary' });
  }
};

exports.getEmojiStatistics = async (req, res) => {
  try {
    // Implement logic to retrieve emoji statistics
    // ...
    res.json({}); // Placeholder response
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve emoji statistics' });
  }
};

exports.generateShareLink = async (req, res) => {
  try {
    // Implement logic to generate share link
    // ...
    res.json({ shareLink: 'unique_link_here' }); // Placeholder response
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

exports.disableSharing = async (req, res) => {
    try {
      const userId = req.user.userId; // Get the user ID from the authenticated user's token
      
      // Find the user in the database and update the 'sharingEnabled' flag to false
      const user = await User.findOneAndUpdate({ _id: userId }, { sharingEnabled: false }, { new: true });
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      res.json({ message: 'Mood history sharing disabled successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to disable mood history sharing' });
    }
  };
 
exports.getMoodInsights = async (req, res) => {
  try {
    // Implement logic to retrieve mood insights
    // ...
    res.json({}); // Placeholder response
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve mood insights' });
  }
};

exports.getEmojiSuggestions = async (req, res) => {
  try {
    // Implement logic to retrieve emoji suggestions
    // ...
    res.json({ suggestions: ['😊', '😄', '😢'] }); // Placeholder response
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve emoji suggestions' });
  }
};

exports.getPublicMoodBoard = async (req, res) => {
  try {
    // Implement logic to retrieve public mood board data
    // ...
    res.json([]); // Placeholder response
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve public mood board data' });
  }
};
