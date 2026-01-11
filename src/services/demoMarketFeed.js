// src/services/demoMarketFeed.js

/**
 * Demo market feed (Paper Trading)
 * This simulates OHLC candles
 * Later replace this with NSE / Crypto feeds
 */

const lastPrices = {};

/* ================= GET PRICE ================= */
async function getPrice(symbol, timeframe) {
  if (!lastPrices[symbol]) {
    lastPrices[symbol] = 100 + Math.random() * 50;
  }

  const prevClose = lastPrices[symbol];

  // simulate candle movement
  const change = (Math.random() - 0.5) * 2;
  const close = Math.max(1, prevClose + change);

  lastPrices[symbol] = close;

  return {
    open: prevClose,
    high: Math.max(prevClose, close) + Math.random(),
    low: Math.min(prevClose, close) - Math.random(),
    close,
    prevClose,
    timestamp: Date.now(),
  };
}

module.exports = {
  getPrice,
};
