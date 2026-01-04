const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  createNews,
  getNewsFeed,
} = require('../controllers/newsController');

/* ===== PUBLIC ===== */
router.get('/', getNewsFeed);

/* ===== PROTECTED (ADMIN / INTERNAL) ===== */
router.post('/', authMiddleware, createNews);

module.exports = router;
