const express = require('express');
const Trade = require('../models/Trade');
const authMiddleware = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const trade = await Trade.create({
      user: req.user.id,
      symbol: req.body.symbol,
      side: req.body.side,
      price: req.body.price,
      quantity: req.body.quantity || 1,
    });

    res.status(201).json(trade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  const trades = await Trade.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(trades);
});

module.exports = router;
