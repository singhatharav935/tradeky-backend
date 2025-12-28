const express = require('express');
const router = express.Router();

const { getTrending } = require('../controllers/trendingController');

/* ===== PUBLIC ===== */
router.get('/', getTrending);

module.exports = router;
