const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  createMedia,
  getMediaFeed,
  toggleLike,
} = require('../controllers/mediaController');

/* ===== PUBLIC ===== */
router.get('/', getMediaFeed);

/* ===== PROTECTED ===== */
router.post('/', authMiddleware, createMedia);
router.post('/:id/like', authMiddleware, toggleLike);

module.exports = router;
