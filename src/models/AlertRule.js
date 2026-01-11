const mongoose = require('mongoose');

const alertRuleSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /* ================= MARKET ================= */
    marketType: {
      type: String,
      enum: ['DEMO', 'LIVE'],
      default: 'DEMO', // 👈 demo first, live later
      index: true,
    },

    exchange: {
      type: String,
      default: 'NSE', // NSE | BINANCE | BYBIT (future)
    },

    symbol: {
      type: String,
      required: true,
      index: true,
    },

    timeframe: {
      type: String,
      required: true, // 1m, 5m, 15m, 1h
    },

    /* ================= LOGIC ENGINE ================= */
    logic: {
      indicator: {
        type: String,
        required: true, // EMA, RSI, VWAP, MACD
        index: true,
      },

      params: {
        type: Object,
        default: {}, // { period: 14 } or { fast: 9, slow: 21 }
      },

      condition: {
        type: String,
        required: true, // CROSS_ABOVE, CROSS_BELOW, GT, LT
      },

      value: {
        type: Number,
        default: null, // RSI > 60 etc.
      },
    },

    /* ================= TRADING INTENT ================= */
    triggerType: {
      type: String,
      enum: ['ENTRY', 'EXIT'],
      default: 'ENTRY',
    },

    side: {
      type: String,
      enum: ['BUY', 'SELL'],
      default: 'BUY',
    },

    /* ================= RISK / CONTROL ================= */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    cooldownSeconds: {
      type: Number,
      default: 300, // 5 min spam protection
    },

    lastTriggeredAt: {
      type: Date,
      default: null,
    },

    /* ================= SYSTEM ================= */
    createdFrom: {
      type: String,
      enum: ['UI', 'API'],
      default: 'UI',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AlertRule', alertRuleSchema);
