const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
      default: 'TradeKY',
    },

    url: {
      type: String,
      default: '',
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('News', newsSchema);
