const mongoose = require('mongoose');

/* ================= MEDIA SUB-SCHEMA ================= */
const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/* ================= COMMENT SUB-SCHEMA ================= */
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

/* ================= GROUP POST ================= */
const groupPostSchema = new mongoose.Schema(
  {
    // 🔗 which group this post belongs to
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },

    // 👤 post author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // 📝 text content (optional if media exists)
    content: {
      type: String,
      default: '',
      trim: true,
    },

    // 🖼️ image / video attachments
    media: [mediaSchema],

    // ❤️ likes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],

    // 💬 comments
    comments: [commentSchema],

    // 🗑️ soft delete (admin / owner)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GroupPost', groupPostSchema);
