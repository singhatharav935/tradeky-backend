const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const {
  createStrategy,
  getStrategies,
  toggleLike,
  toggleSave,
  addComment,
} = require('../controllers/strategyController');

/* ===== PUBLIC ===== */
router.get('/', getStrategies);

/* ===== PROTECTED ===== */
router.post('/', authMiddleware, createStrategy);
router.post('/:id/like', authMiddleware, toggleLike);
router.post('/:id/save', authMiddleware, toggleSave);
router.post('/:id/comment', authMiddleware, addComment);

module.exports = router;
