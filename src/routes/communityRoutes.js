const express = require('express');
const router = express.Router();

const Strategy = require('../models/strategy');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

/* ================= CREATE STRATEGY (TEXT + MEDIA) ================= */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, media = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Strategy.create({
      user: req.user.id,
      content: content.trim(),
      media, // ✅ embedded media [{ type, url }]
    });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create strategy' });
  }
});

/* ================= FETCH STRATEGY FEED ================= */
router.get('/', async (req, res) => {
  try {
    const posts = await Strategy.find({ isDeleted: false })
      .populate('user', 'name followers')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch strategies' });
  }
});

/* ================= FETCH SAVED STRATEGIES ================= */
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const posts = await Strategy.find({
      isDeleted: false,
      savedBy: req.user.id,
    })
      .populate('user', 'name followers')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved strategies' });
  }
});

/* ================= LIKE / UNLIKE ================= */
router.post('/:id/like', authMiddleware, async (req, res) => {
  const post = await Strategy.findById(req.params.id);
  if (!post || post.isDeleted) return res.sendStatus(404);

  post.likes.includes(req.user.id)
    ? post.likes.pull(req.user.id)
    : post.likes.push(req.user.id);

  await post.save();
  res.json({ likes: post.likes });
});

/* ================= SAVE / UNSAVE ================= */
router.post('/:id/save', authMiddleware, async (req, res) => {
  const post = await Strategy.findById(req.params.id);
  if (!post || post.isDeleted) return res.sendStatus(404);

  post.savedBy.includes(req.user.id)
    ? post.savedBy.pull(req.user.id)
    : post.savedBy.push(req.user.id);

  await post.save();
  res.json({ savedBy: post.savedBy });
});

/* ================= ADD COMMENT ================= */
router.post('/:id/comment', authMiddleware, async (req, res) => {
  const post = await Strategy.findById(req.params.id);
  if (!post || post.isDeleted) return res.sendStatus(404);

  post.comments.push({
    user: req.user.id,
    text: req.body.text,
  });

  await post.save();
  res.json(post);
});

/* ================= DELETE COMMENT ================= */
router.delete('/:postId/comment/:commentId', authMiddleware, async (req, res) => {
  const post = await Strategy.findById(req.params.postId);
  if (!post) return res.sendStatus(404);

  const comment = post.comments.id(req.params.commentId);
  if (!comment) return res.sendStatus(404);
  if (comment.user.toString() !== req.user.id) return res.sendStatus(403);

  comment.deleteOne();
  await post.save();
  res.json({ success: true });
});

/* ================= DELETE OWN POST ================= */
router.delete('/:id', authMiddleware, async (req, res) => {
  const post = await Strategy.findById(req.params.id);
  if (!post) return res.sendStatus(404);
  if (post.user.toString() !== req.user.id) return res.sendStatus(403);

  post.isDeleted = true;
  await post.save();
  res.json({ success: true });
});

/* ================= FOLLOW / UNFOLLOW ================= */
router.post('/follow/:userId', authMiddleware, async (req, res) => {
  const me = await User.findById(req.user.id);
  const target = await User.findById(req.params.userId);

  if (!me || !target) return res.sendStatus(404);

  const following = me.following.includes(target._id);

  following
    ? (me.following.pull(target._id), target.followers.pull(me._id))
    : (me.following.push(target._id), target.followers.push(me._id));

  await me.save();
  await target.save();

  res.json({ following: !following });
});

module.exports = router;
