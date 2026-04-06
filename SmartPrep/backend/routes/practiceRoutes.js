const express = require('express');
const router = express.Router();
const { generateCodingProblem, analyzeInterview } = require('../controllers/practiceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/coding', protect, generateCodingProblem);
router.post('/interview/analyze', protect, analyzeInterview);

module.exports = router;
