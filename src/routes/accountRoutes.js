const express = require('express');
const Trade = require('../models/trade');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/account/summary
 * Balance, Unrealized P&L, Daily P&L, Capital
 */
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.sendStatus(404);

    const trades = await Trade.find({ user: req.user.id });

    let unrealizedPnl = 0;
    let dailyPnl = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const positions = {};

    for (const t of trades) {
      if (!positions[t.symbol]) {
        positions[t.symbol] = { qty: 0, avg: 0 };
      }

      const pos = positions[t.symbol];

      if (t.side === 'BUY') {
        const total = pos.avg * pos.qty + t.price * t.quantity;
        pos.qty += t.quantity;
        pos.avg = total / pos.qty;
      } else {
        const pnl = (t.price - pos.avg) * t.quantity;
        pos.qty -= t.quantity;

        if (t.createdAt >= today) {
          dailyPnl += pnl;
        }
      }
    }

    // ⚠️ Unrealized uses last traded price (demo-safe)
    for (const symbol in positions) {
      const pos = positions[symbol];
      if (pos.qty > 0) {
        unrealizedPnl += 0; // frontend will calculate live
      }
    }

    const capital =
      user.balance + unrealizedPnl + dailyPnl;

    res.json({
      balance: user.balance,
      unrealizedPnl,
      dailyPnl,
      capital,
    });
  } catch (err) {
    console.error('Account summary error:', err);
    res.status(500).json({ error: 'Failed to load account summary' });
  }
});

module.exports = router;
