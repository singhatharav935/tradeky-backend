const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      trim: true,
      default: '',
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', mediaSchema);
