const express = require('express');
const Trade = require('../models/Trade');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * GET /api/positions
 * Returns net positions per symbol
 */
router.get('/', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.id }).sort({ createdAt: 1 });

    const positions = {};

    for (const t of trades) {
      if (!positions[t.symbol]) {
        positions[t.symbol] = {
          symbol: t.symbol,
          qty: 0,
          avgPrice: 0,
          realizedPnl: 0,
        };
      }

      const pos = positions[t.symbol];

      if (t.side === 'BUY') {
        const totalCost = pos.avgPrice * pos.qty + t.price * t.quantity;
        pos.qty += t.quantity;
        pos.avgPrice = totalCost / pos.qty;
      } else {
        // SELL
        pos.realizedPnl += (t.price - pos.avgPrice) * t.quantity;
        pos.qty -= t.quantity;

        if (pos.qty === 0) {
          pos.avgPrice = 0;
        }
      }
    }

    res.json(Object.values(positions));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate positions' });
  }
});

module.exports = router;
