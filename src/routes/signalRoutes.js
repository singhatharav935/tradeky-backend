const express = require('express');
const router = express.Router();
const Signal = require('../models/Signal');
const authMiddleware = require('../middleware/authMiddleware');

/* ================= CREATE SIGNAL ================= */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      mode,
      symbol,
      exchange,
      entryCondition,
      exitCondition,
    } = req.body;

    if (!mode || !symbol || !exchange || !entryCondition) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const signal = await Signal.create({
      user: req.user.id,
      mode,
      symbol: symbol.toUpperCase(),
      exchange,
      entryCondition,
      exitCondition,
    });

    res.json(signal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create signal' });
  }
});

/* ================= LIST MY SIGNALS ================= */
router.get('/my', authMiddleware, async (req, res) => {
  const signals = await Signal.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json(signals);
});

module.exports = router;
