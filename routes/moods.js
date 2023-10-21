const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const { authenticate } = require('../middleware/authenticate');

// Route to add a new mood entry
router.post('/', authenticate, moodController.add);

// Route to update an existing mood entry by ID
router.put('/:id', authenticate, moodController.update);

// Route to delete a mood entry by ID
router.delete('/:id', authenticate, moodController.deleteMood);

// Route to get the monthly summary of mood entries
router.get('/monthly-summary', authenticate, moodController.getMonthlySummary);

// Route to get mood entries based on specified filters
router.get('/filter', authenticate, moodController.getByFilter);

// Route to retrieve shared mood data
router.get('/share', authenticate, moodController.share);

// Route to retrieve shared mood data based on a specific token
router.get('/share/:token', moodController.shareData);

// Route to suggest emojis for mood entries
router.post('/suggest-emojis', authenticate, moodController.suggestEmojis);

// Route to get emoji statistics
router.get('/emoji-statistics', moodController.getEmojiStatistics);

// Route to see mood trends
router.get('/mood-trends', moodController.getMoodTrends);

// Route to visualize public mood
router.get('/public-mood-board', moodController.getPublicMoodBoardData);

module.exports = router;
