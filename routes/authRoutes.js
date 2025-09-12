const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

// Register API (Backend only)
router.post('/register',register);

// Login API
router.post('/login', login);

router.get('/logout', logout);

module.exports = router;
