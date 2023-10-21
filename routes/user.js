const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');

// Route to handle user registration
router.post('/register', userController.register);

// Route to handle user login
router.post('/login', userController.login);

// Route to allow authenticated users to toggle their sharing settings
router.get('/toggle-sharing', authenticate, userController.toggleSharing);

module.exports = router;
