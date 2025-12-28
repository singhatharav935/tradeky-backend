const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const authMiddleware = require('../middlewares/authMiddleware');

/* FETCH MY NOTIFICATIONS */
router.get('/', authMiddleware, async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id })
    .populate('from', 'name')
    .populate('post', 'content')
    .sort({ createdAt: -1 });

  res.json(notifications);
});

/* MARK AS READ */
router.post('/:id/read', authMiddleware, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

module.exports = router;
