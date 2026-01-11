const mongoose = require('mongoose');

const alertEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    rule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlertRule',
      required: true,
      index: true,
    },

    symbol: {
      type: String,
      required: true,
      index: true,
    },

    timeframe: {
      type: String,
      required: true,
    },

    triggerType: {
      type: String,
      enum: ['ENTRY', 'EXIT'],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    message: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AlertEvent', alertEventSchema);
