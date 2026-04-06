const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../controllers/generatorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, generateQuestions);

module.exports = router;
