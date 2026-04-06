const express = require('express');
const { sendMessage, getHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/message', protect, sendMessage);
router.get('/history', protect, getHistory);

module.exports = router;
