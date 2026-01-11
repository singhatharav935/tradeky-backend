const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: ['demo', 'live'],
      required: true,
      index: true,
    },

    symbol: {
      type: String, // e.g. NIFTY, BTCUSDT
      required: true,
      index: true,
    },

    exchange: {
      type: String, // NSE / BSE / BINANCE
      required: true,
    },

    entryCondition: {
      type: String, // e.g. "price >= 22000"
      required: true,
    },

    exitCondition: {
      type: String, // e.g. "price <= 21850"
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'triggered', 'closed'],
      default: 'active',
      index: true,
    },

    lastCheckedPrice: {
      type: Number,
      default: null,
    },

    triggeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Signal', signalSchema);
