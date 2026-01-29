const express = require('express');
const router = express.Router();
const { getPrice } = require('../services/demoMarketFeed');

/**
 * GET /api/market/candle
 * ?symbol=NSE:NIFTY
 * ?resolution=1
 */
router.get('/candle', async (req, res) => {
  const { symbol = 'NSE:NIFTY' } = req.query;

  const candle = await getPrice(symbol);

  res.json({
    time: Math.floor(candle.timestamp / 1000),
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: 1,
  });
});

module.exports = router;
