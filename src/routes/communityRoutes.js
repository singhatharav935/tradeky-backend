const express = require('express');
const router = express.Router();
const Strategy = require('../models/strategy');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * POST /api/community
 * Create a strategy post
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const strategy = await Strategy.create({
      user: req.user.id,
      content: req.body.content,
    });
    res.json(strategy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * GET /api/community
 * Fetch feed
 */
router.get('/', async (req, res) => {
  const posts = await Strategy.find()
    .populate('user', 'name')
    .populate('comments.user', 'name') // 🔥 COMMENTS USER
    .sort({ createdAt: -1 });

  res.json(posts);
});

/**
 * POST /api/community/:id/like
 */
router.post('/:id/like', authMiddleware, async (req, res) => {
  const post = await Strategy.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });

  if (!post.likes.includes(req.user.id)) {
    post.likes.push(req.user.id);
    await post.save();
  }

  res.json(post);
});

/**
 * POST /api/community/:id/comment
 */
router.post('/:id/comment', authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ error: 'Comment required' });
  }

  const post = await Strategy.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });

  post.comments.push({
    user: req.user.id,
    text,
  });

  await post.save();
  res.json(post);
});

module.exports = router;
