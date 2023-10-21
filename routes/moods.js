const express = require('express');
const router = express.Router();
const mood = require('../controllers/mood.controller');
const { authenticateToken } = require('../controllers/helper.util');

// Route to add a new mood entry
router.post('/', authenticateToken, mood.add);

// Route to update an existing mood entry by ID
router.put('/:id', authenticateToken, mood.update);

// Route to delete a mood entry by ID
router.delete('/:id', authenticateToken, mood.deleteMood);

// Route to get the monthly summary of mood entries
router.get('/monthly-summary', authenticateToken, mood.getMonthlySummary);

// Route to get mood entries based on specified filters
router.get('/filter', authenticateToken, mood.getByFilter);

// Route to retrieve shared mood data
router.get('/share', authenticateToken, mood.share);

// Route to retrieve shared mood data based on a specific token
router.get('/share/:token', mood.shareData);

// Route to suggest emojis for mood entries
router.post('/suggest-emojis', authenticateToken, mood.suggestEmojis);

module.exports = router;
