const express = require('express');
const Trade = require('../models/trade');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/* ================= CREATE TRADE ================= */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { symbol, side, price, quantity } = req.body;

    if (!symbol || !side || !price) {
      return res.status(400).json({ error: 'Missing trade fields' });
    }

    const qty = quantity || 1;

    const user = await User.findById(req.user.id);
    if (!user) return res.sendStatus(404);

    // ================= SELL → UPDATE REALIZED P&L =================
    if (side === 'SELL') {
      // Find previous BUY trades to calculate avg price
      const trades = await Trade.find({
        user: req.user.id,
        symbol,
      }).sort({ createdAt: 1 });

      let totalQty = 0;
      let avgPrice = 0;

      for (const t of trades) {
        if (t.side === 'BUY') {
          const totalCost =
            avgPrice * totalQty + t.price * t.quantity;
          totalQty += t.quantity;
          avgPrice = totalCost / totalQty;
        } else {
          totalQty -= t.quantity;
          if (totalQty <= 0) {
            totalQty = 0;
            avgPrice = 0;
          }
        }
      }

      const sellQty = Math.min(totalQty, qty);
      const realized = (price - avgPrice) * sellQty;

      user.realizedPnl += realized;
      await user.save();
    }

    // ================= CREATE TRADE =================
    const trade = await Trade.create({
      user: req.user.id,
      symbol,
      side,
      price,
      quantity: qty,
    });

    res.status(201).json({
      trade,
      balance: user.balance,
      realizedPnl: user.realizedPnl,
    });
  } catch (err) {
    console.error('Trade create error:', err);
    res.status(500).json({ error: 'Failed to place trade' });
  }
});

/* ================= LIST USER TRADES ================= */
router.get('/', authMiddleware, async (req, res) => {
  const trades = await Trade.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json(trades);
});

/* ================= WALLET BALANCE ================= */
router.get('/wallet', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('balance');
  if (!user) return res.sendStatus(404);

  res.json({ balance: user.balance });
});

module.exports = router;
