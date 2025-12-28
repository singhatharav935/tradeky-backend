const express = require('express');
const router = express.Router();

const { getTopTraders } = require('../controllers/topTradersController');

/* ===== PUBLIC ===== */
router.get('/', getTopTraders);

module.exports = router;
