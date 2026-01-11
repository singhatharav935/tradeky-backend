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
