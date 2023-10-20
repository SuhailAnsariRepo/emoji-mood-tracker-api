const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const authenticate = require('../middleware/authenticate');

// Authentication Routes
router.post('/auth/register', moodController.registerUser);
router.post('/auth/login', moodController.loginUser);

// Mood Entries Routes (Protected with Authentication)
router.post('/moods', authenticate, moodController.logMood);
router.get('/moods', authenticate, moodController.getMoodEntries);
router.put('/moods/:id', authenticate, moodController.updateMood);
router.delete('/moods/:id', authenticate, moodController.deleteMood);

// Mood Summaries Routes (Protected with Authentication)
router.get('/moods/summary/:year/:month', authenticate, moodController.getMonthlySummary);

// Emoji Statistics Routes (Protected with Authentication)
router.get('/moods/statistics', authenticate, moodController.getEmojiStatistics);

// Sharing and Collaboration Routes (Protected with Authentication)
router.post('/moods/share', authenticate, moodController.generateShareLink);
router.delete('/moods/share', authenticate, moodController.disableSharing);

// Data Insights Route (Protected with Authentication)
router.get('/moods/insights', authenticate, moodController.getMoodInsights);

// Emoji Suggestions Route (Protected with Authentication)
router.get('/moods/suggestions', authenticate, moodController.getEmojiSuggestions);

// Public Mood Board Route
router.get('/moods/public', moodController.getPublicMoodBoard);

module.exports = router;
