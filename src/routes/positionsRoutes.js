const express = require('express');
const Trade = require('../models/trade');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/positions
 * Net positions + Realized & Unrealized P&L
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.id }).sort({ createdAt: 1 });

    const positions = {};

    for (const t of trades) {
      if (!positions[t.symbol]) {
        positions[t.symbol] = {
          symbol: t.symbol,
          quantity: 0,
          avgPrice: 0,
          realizedPnl: 0,
        };
      }

      const pos = positions[t.symbol];

      if (t.side === 'BUY') {
        const totalCost =
          pos.avgPrice * pos.quantity + t.price * t.quantity;

        pos.quantity += t.quantity;
        pos.avgPrice =
          pos.quantity === 0 ? 0 : totalCost / pos.quantity;
      } else {
        // SELL
        const sellQty = Math.min(pos.quantity, t.quantity);

        pos.realizedPnl +=
          (t.price - pos.avgPrice) * sellQty;

        pos.quantity -= sellQty;

        if (pos.quantity === 0) {
          pos.avgPrice = 0;
        }
      }
    }

    // Only open positions
    const openPositions = Object.values(positions).filter(
      p => p.quantity !== 0
    );

    res.json(openPositions);
  } catch (err) {
    console.error('Positions calc error:', err);
    res.status(500).json({ error: 'Failed to calculate positions' });
  }
});

module.exports = router;
