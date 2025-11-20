const express = require('express');
const { getMessages } = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', auth, getMessages);

module.exports = router;
