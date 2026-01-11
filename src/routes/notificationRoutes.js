// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

/* ================= GET MY NOTIFICATIONS ================= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
    })
      .populate('from', 'name')
      .populate('post', 'content')
      .populate('alertRule', 'symbol timeframe triggerType')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

/* ================= MARK ONE AS READ ================= */
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true }
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to mark read' });
  }
});

/* ================= MARK ALL AS READ ================= */
router.post('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to mark all read' });
  }
});

/* ================= UNREAD COUNT ================= */
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });

    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;
