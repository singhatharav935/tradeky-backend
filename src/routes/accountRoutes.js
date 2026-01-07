const express = require('express');
const Trade = require('../models/trade');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/account/summary
 * Balance, Daily P&L (server), Capital
 */
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.sendStatus(404);

    const trades = await Trade.find({ user: req.user.id })
      .sort({ createdAt: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const positions = {};
    let dailyPnl = 0;

    for (const t of trades) {
      if (!positions[t.symbol]) {
        positions[t.symbol] = { qty: 0, avgPrice: 0 };
      }

      const pos = positions[t.symbol];

      if (t.side === 'BUY') {
        const totalCost =
          pos.avgPrice * pos.qty + t.price * t.quantity;

        pos.qty += t.quantity;
        pos.avgPrice = totalCost / pos.qty;
      } else {
        const sellQty = Math.min(pos.qty, t.quantity);
        const realized = (t.price - pos.avgPrice) * sellQty;

        pos.qty -= sellQty;

        // ✅ DAILY P&L (today only)
        if (t.createdAt >= today) {
          dailyPnl += realized;
        }

        if (pos.qty === 0) pos.avgPrice = 0;
      }
    }

    const balance = user.balance;
    const capital = balance + user.realizedPnl;

    res.json({
      balance,
      unrealizedPnl: 0, // frontend live
      dailyPnl,
      capital,
    });
  } catch (err) {
    console.error('Account summary error:', err);
    res.status(500).json({ error: 'Failed to load account summary' });
  }
});

module.exports = router;
