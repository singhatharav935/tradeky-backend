const express = require('express');
const Trade = require('../models/Trade');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// CREATE TRADE
router.post('/', protect, async (req, res) => {
  try {
    const { symbol, side, price, quantity } = req.body;

    if (!symbol || !side || !price) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const trade = await Trade.create({
      user: req.user.id,
      symbol,
      side,
      price,
      quantity: quantity || 1,
    });

    res.status(201).json(trade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Trade failed' });
  }
});

// GET USER TRADES
router.get('/', protect, async (req, res) => {
  const trades = await Trade.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(trades);
});

module.exports = router;
