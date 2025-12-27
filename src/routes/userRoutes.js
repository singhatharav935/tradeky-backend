const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Strategy = require('../models/strategy');

/* PUBLIC PROFILE */
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name followers following');

  if (!user) return res.sendStatus(404);

  const posts = await Strategy.find({
    user: user._id,
    isDeleted: false,
  }).sort({ createdAt: -1 });

  res.json({ user, posts });
});

module.exports = router;
