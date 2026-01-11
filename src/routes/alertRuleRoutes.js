const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const AlertRule = require('../models/AlertRule');

/* ================= CREATE ALERT RULE ================= */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { symbol, timeframe, logic, triggerType } = req.body;

    if (!symbol || !timeframe || !logic?.indicator || !logic?.condition) {
      return res.status(400).json({ error: 'Invalid alert rule data' });
    }

    const rule = await AlertRule.create({
      user: req.user.id,
      symbol: symbol.toUpperCase(),
      timeframe,
      logic,
      triggerType: triggerType || 'ENTRY',
    });

    res.json(rule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create alert rule' });
  }
});

/* ================= GET MY ALERT RULES ================= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rules = await AlertRule.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(rules);
  } catch {
    res.status(500).json({ error: 'Failed to fetch alert rules' });
  }
});

/* ================= TOGGLE ON / OFF ================= */
router.post('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const rule = await AlertRule.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!rule) return res.sendStatus(404);

    rule.isActive = !rule.isActive;
    await rule.save();

    res.json({ isActive: rule.isActive });
  } catch {
    res.status(500).json({ error: 'Failed to toggle rule' });
  }
});

/* ================= DELETE RULE ================= */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await AlertRule.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) return res.sendStatus(404);

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

module.exports = router;
