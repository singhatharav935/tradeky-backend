const express = require('express');
const router = express.Router();

const GroupPost = require('../models/GroupPost');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');

/* ================= HELPERS ================= */
const isGroupMember = (group, userId) =>
  group.members.some(m => m.toString() === userId);

/* ================= CREATE GROUP POST ================= */
/*
  body:
  {
    content?: string,
    media?: [{ type: 'image' | 'video', url: string }]
  }
*/
router.post('/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content = '', media = [] } = req.body;

    if (!content.trim() && (!media || media.length === 0)) {
      return res.status(400).json({ error: 'Post content or media required' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.sendStatus(404);

    if (!isGroupMember(group, req.user.id)) {
      return res.status(403).json({ error: 'Not a group member' });
    }

    const post = await GroupPost.create({
      group: groupId,
      author: req.user.id,
      content: content.trim(),
      media,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create group post' });
  }
});

/* ================= FETCH GROUP POSTS ================= */
router.get('/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.sendStatus(404);

    if (!isGroupMember(group, req.user.id)) {
      return res.status(403).json({ error: 'Not a group member' });
    }

    const posts = await GroupPost.find({
      group: groupId,
      isDeleted: false,
    })
      .populate('author', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load group posts' });
  }
});

/* ================= LIKE / UNLIKE ================= */
router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    const post = await GroupPost.findById(req.params.postId);
    if (!post || post.isDeleted) return res.sendStatus(404);

    post.likes.includes(req.user.id)
      ? post.likes.pull(req.user.id)
      : post.likes.push(req.user.id);

    await post.save();
    res.json({ likes: post.likes.length });
  } catch {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

/* ================= ADD COMMENT ================= */
router.post('/:postId/comment', authMiddleware, async (req, res) => {
  try {
    if (!req.body.text?.trim()) {
      return res.status(400).json({ error: 'Comment text required' });
    }

    const post = await GroupPost.findById(req.params.postId);
    if (!post || post.isDeleted) return res.sendStatus(404);

    post.comments.push({
      user: req.user.id,
      text: req.body.text.trim(),
    });

    await post.save();
    res.json(post);
  } catch {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/* ================= DELETE OWN POST ================= */
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await GroupPost.findById(req.params.postId);
    if (!post) return res.sendStatus(404);

    if (post.author.toString() !== req.user.id) {
      return res.sendStatus(403);
    }

    post.isDeleted = true;
    await post.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
