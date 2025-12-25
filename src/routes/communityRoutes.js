const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Strategy = require('../models/Strategy');

/* CREATE POST */
router.post('/post', auth, async (req, res) => {
  const { title, description, symbol, timeframe } = req.body;

  const post = await Strategy.create({
    authorId: req.user.id,
    authorName: req.user.email,
    title,
    description,
    symbol,
    timeframe,
  });

  res.json(post);
});

/* FEED */
router.get('/feed', auth, async (req, res) => {
  const posts = await Strategy.find().sort({ createdAt: -1 });
  res.json(posts);
});

/* LIKE */
router.post('/like/:id', auth, async (req, res) => {
  await Strategy.findByIdAndUpdate(req.params.id, {
    $inc: { likes: 1 },
  });
  res.json({ ok: true });
});

module.exports = router;
