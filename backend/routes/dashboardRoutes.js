const express = require('express');
const { stats, overview } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');
const router = express.Router(); router.get('/stats', requireAuth, stats); router.get('/overview', requireAuth, overview); module.exports = router;
