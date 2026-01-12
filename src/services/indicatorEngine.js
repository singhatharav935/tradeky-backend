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

  // ⚠️ simulated price feed (replace later with real candles)
  const price = 100 + Math.random() * 10;
  indicatorCache[symbol].push(price);

  if (indicatorCache[symbol].length < 30) return null;

  const values = indicatorCache[symbol].slice(-30);
  const prevValues = values.slice(0, -1);

  switch (indicator) {
    case 'EMA': {
      const fast = params?.fast || params?.period || 9;
      const slow = params?.slow || 21;

      const fastPrev = calculateEMA(prevValues, fast);
      const fastCurrent = calculateEMA(values, fast);

      const slowPrev = calculateEMA(prevValues, slow);
      const slowCurrent = calculateEMA(values, slow);

      return {
        prev: fastPrev,
        current: fastCurrent,
        fast: fastCurrent,
        slow: slowCurrent,
      };
    }

    case 'RSI': {
      const prev = calculateRSI(prevValues, params?.period || 14);
      const current = calculateRSI(values, params?.period || 14);

      return {
        prev,
        current,
      };
    }

    default:
      return null;
  }
}

module.exports = {
  getIndicator,
};
