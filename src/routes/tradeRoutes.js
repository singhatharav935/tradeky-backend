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
    const tradeValue = price * qty;

    const user = await User.findById(req.user.id);
    if (!user) return res.sendStatus(404);

    // 💸 BUY → CHECK BALANCE
    if (side === 'BUY') {
      if (user.balance < tradeValue) {
        return res.status(400).json({
          error: 'Insufficient balance',
          balance: user.balance,
        });
      }

      user.balance -= tradeValue;
    }

    // 💰 SELL → ADD BALANCE
    if (side === 'SELL') {
      user.balance += tradeValue;
    }

    const trade = await Trade.create({
      user: req.user.id,
      symbol,
      side,
      price,
      quantity: qty,
    });

    await user.save();

    res.status(201).json({
      trade,
      balance: user.balance,
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
