// src/services/indicatorEngine.js

const indicatorCache = {};

/* ================= EMA ================= */
function calculateEMA(values, period) {
  const k = 2 / (period + 1);
  let ema = values[0];

  for (let i = 1; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
  }

  return ema;
}

/* ================= RSI ================= */
function calculateRSI(values, period = 14) {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    diff >= 0 ? (gains += diff) : (losses -= diff);
  }

  if (losses === 0) return 100;

  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

/* ================= GET INDICATOR ================= */
async function getIndicator({ symbol, indicator, params }) {
  if (!indicatorCache[symbol]) indicatorCache[symbol] = [];

  // simulate price series
  const price = 100 + Math.random() * 10;
  indicatorCache[symbol].push(price);

  if (indicatorCache[symbol].length < 30) return null;

  const values = indicatorCache[symbol].slice(-30);

  switch (indicator) {
    case 'EMA':
      return calculateEMA(values, params?.period || 9);

    case 'RSI':
      return calculateRSI(values, params?.period || 14);

    default:
      return null;
  }
}

module.exports = {
  getIndicator,
};
