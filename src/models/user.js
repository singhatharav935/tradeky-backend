const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // 🔥 ADD THIS
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
