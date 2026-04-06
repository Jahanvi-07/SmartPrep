const express = require('express');
const { executeCode } = require('../controllers/compilerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/execute', protect, executeCode);

module.exports = router;
