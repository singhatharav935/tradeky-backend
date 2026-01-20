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

/* ================= LAYER 3: SKILL, TIER & LEARNING ================= */
router.get('/stats/skill', authMiddleware, async (req, res) => {
  try {
    const alerts = await Notification.find({
      user: req.user.id,
      type: { $in: ['ALERT_ENTRY', 'ALERT_EXIT'] },
      outcome: { $ne: 'PENDING' },
    });

    let total = alerts.length;
    let win = 0;
    let loss = 0;
    let ignored = 0;

    let confidenceWeightedScore = 0;
    let confidenceTotal = 0;

    for (const a of alerts) {
      if (a.outcome === 'WIN') win++;
      if (a.outcome === 'LOSS') loss++;
      if (a.outcome === 'IGNORED') ignored++;

      if (a.meta?.confidence != null) {
        confidenceTotal += a.meta.confidence;
        if (a.outcome === 'WIN') {
          confidenceWeightedScore += a.meta.confidence;
        }
      }
    }

    const accuracy =
      win + loss > 0
        ? Number(((win / (win + loss)) * 100).toFixed(2))
        : 0;

    const skillScore =
      confidenceTotal > 0
        ? Number(
            ((confidenceWeightedScore / confidenceTotal) * 100).toFixed(2)
          )
        : 0;

    /* ================= SKILL TIER ================= */
    let skillTier = 'BEGINNER';

    if (total >= 20 && accuracy >= 55) skillTier = 'INTERMEDIATE';
    if (total >= 50 && accuracy >= 65 && skillScore >= 60)
      skillTier = 'PRO';
    if (total >= 100 && accuracy >= 72 && skillScore >= 70)
      skillTier = 'ELITE';

    /* ================= LEARNING SIGNAL ================= */
    let learningSignal = 'CONSERVATIVE';

    if (skillTier === 'INTERMEDIATE') learningSignal = 'BALANCED';
    if (skillTier === 'PRO' || skillTier === 'ELITE')
      learningSignal = 'AGGRESSIVE';

    res.json({
      totalAlerts: total,
      win,
      loss,
      ignored,
      accuracyPercent: accuracy,
      skillScore,
      skillTier,
      learningSignal,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to calculate skill stats',
    });
  }
});

module.exports = router;
