const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: '',
    },

    // 👑 group creator
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // 🛡️ admins (owner is implicit admin)
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],

    // 👥 members
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],

    // 🚫 banned users
    banned: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],

    // 🔒 chat lock
    isLocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🔒 public / private
    isPrivate: {
      type: Boolean,
      default: false,
      index: true,
    },

    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
