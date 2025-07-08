const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Register API (Backend only)
router.post('/register', register);

// Login API
router.post('/login', login);

module.exports = router;
