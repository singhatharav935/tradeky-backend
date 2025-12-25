const express = require('express');
const router = express.Router();

const Strategy = require('../models/strategy');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * =====================================
 * POST /api/community
 * Create a strategy post
 * =====================================
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
 * =====================================
 * GET /api/community
 * Fetch community feed
 * =====================================
 */
router.get('/', async (req, res) => {
  try {
    const posts = await Strategy.find()
      .populate('user', 'email followers')
      .populate('comments.user', 'email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

/**
 * =====================================
 * POST /api/community/:id/like
 * Like a strategy
 * =====================================
 */
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Strategy.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

/**
 * =====================================
 * POST /api/community/:id/comment
 * Add a comment
 * =====================================
 */
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: 'Comment required' });
    }

    const post = await Strategy.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Not found' });
    }

    post.comments.push({
      user: req.user.id,
      text,
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/**
 * =====================================
 * POST /api/community/follow/:userId
 * Follow / Unfollow a trader
 * =====================================
 */
router.post(
  '/follow/:userId',
  authMiddleware,
  async (req, res) => {
    try {
      const targetUser = await User.findById(req.params.userId);
      const currentUser = await User.findById(req.user.id);

      if (!targetUser || !currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isFollowing = currentUser.following.includes(
        targetUser._id
      );

      if (isFollowing) {
        currentUser.following.pull(targetUser._id);
        targetUser.followers.pull(currentUser._id);
      } else {
        currentUser.following.push(targetUser._id);
        targetUser.followers.push(currentUser._id);
      }

      await currentUser.save();
      await targetUser.save();

      res.json({
        following: !isFollowing,
        followersCount: targetUser.followers.length,
      });
    } catch (err) {
      res.status(500).json({ error: 'Follow action failed' });
    }
  }
);

module.exports = router;
