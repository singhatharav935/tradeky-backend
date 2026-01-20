// src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // 👤 Receiver
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // 👤 Actor (null for system / AI)
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // 🔔 Notification type
    type: {
      type: String,
      enum: [
        'LIKE',
        'COMMENT',
        'FOLLOW',
        'ALERT_ENTRY',
        'ALERT_EXIT',
      ],
      required: true,
      index: true,
    },

    // 🧠 Alert rule reference (AI only)
    alertRule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlertRule',
      default: null,
      index: true,
    },

    // 📈 Instrument snapshot (AI only)
    symbol: {
      type: String,
      default: null,
      index: true,
    },

    timeframe: {
      type: String,
      default: null,
    },

    triggerValue: {
      type: Number,
      default: null,
    },

    // 🧠 AI evaluation metadata (Layer 2 & 3)
    meta: {
      trendBias: {
        type: String,
        enum: ['BULLISH', 'BEARISH', 'NEUTRAL'],
        default: null,
      },
      volatility: {
        type: Number,
        default: null,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
    },

    // 🎯 LAYER 3: Outcome tracking (AI only)
    outcome: {
      type: String,
      enum: ['WIN', 'LOSS', 'IGNORED', 'PENDING'],
      default: 'PENDING',
      index: true,
    },

    evaluatedAt: {
      type: Date,
      default: null,
    },

    // 📝 Related post (community only)
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Strategy',
      default: null,
    },

    // 👀 Read status
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
