const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');

/* ================= GENERAL CHAT ================= */

// Fetch global chat
router.get('/general', async (req, res) => {
  const messages = await Message.find({ group: null })
    .populate('sender', 'name')
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  res.json(messages);
});

// Send message to global chat
router.post('/general', authMiddleware, async (req, res) => {
  if (!req.body.text?.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  const msg = await Message.create({
    sender: req.user.id,
    text: req.body.text.trim(),
  });

  const io = req.app.get('io');
  io.to('general').emit('new-message', {
    _id: msg._id,
    text: msg.text,
    sender: { name: req.user.name },
    createdAt: msg.createdAt,
  });

  res.json(msg);
});

/* ================= GROUP CHAT ================= */

router.get('/group/:groupId', authMiddleware, async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.sendStatus(404);

  if (!group.members.includes(req.user.id)) {
    return res.status(403).json({ error: 'Not a group member' });
  }

  const messages = await Message.find({ group: group._id })
    .populate('sender', 'name')
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  res.json(messages);
});

router.post('/group/:groupId', authMiddleware, async (req, res) => {
  if (!req.body.text?.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  const group = await Group.findById(req.params.groupId);
  if (!group) return res.sendStatus(404);

  if (!group.members.includes(req.user.id)) {
    return res.status(403).json({ error: 'Not a group member' });
  }

  if (group.isLocked) {
    return res.status(403).json({ error: 'Chat is locked' });
  }

  const msg = await Message.create({
    sender: req.user.id,
    text: req.body.text.trim(),
    group: group._id,
  });

  const io = req.app.get('io');
  io.to(`group:${group._id}`).emit('new-message', {
    _id: msg._id,
    text: msg.text,
    sender: { name: req.user.name },
    createdAt: msg.createdAt,
  });

  res.json(msg);
});

module.exports = router;
