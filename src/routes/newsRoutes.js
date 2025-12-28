const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const {
  createNews,
  getNewsFeed,
} = require('../controllers/newsController');

/* ===== PUBLIC ===== */
router.get('/', getNewsFeed);

/* ===== PROTECTED (ADMIN / INTERNAL) ===== */
router.post('/', authMiddleware, createNews);

module.exports = router;
