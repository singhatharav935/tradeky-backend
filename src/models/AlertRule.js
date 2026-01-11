const mongoose = require('mongoose');

const alertRuleSchema = new mongoose.Schema(
  {
    // 👤 Rule owner
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // 📈 Instrument
    symbol: {
      type: String,
      required: true,
      index: true,
    },

    // ⏱ Timeframe (1m, 5m, 15m, 1h)
    timeframe: {
      type: String,
      required: true,
    },

    // 🧠 Indicator logic (flexible JSON)
    logic: {
      type: {
        indicator: { type: String, required: true }, // EMA, RSI, VWAP
        params: { type: Object, default: {} },       // { fast: 9, slow: 21 }
        condition: { type: String, required: true }, // CROSS_ABOVE, GT, LT
      },
      required: true,
    },

    // 🚨 What type of alert
    triggerType: {
      type: String,
      enum: ['ENTRY', 'EXIT'],
      default: 'ENTRY',
    },

    // ⏳ Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // 🧯 Prevent spam
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AlertRule', alertRuleSchema);
