const express = require('express');
const router = express.Router();
const { getDashboardData, recordPractice } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboardData);
router.post('/practice', protect, recordPractice);

module.exports = router;
