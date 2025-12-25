const express = require('express');
const Strategy = require('../models/strategy');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const strategy = await Strategy.create({
    user: req.user.id,
    title: req.body.title,
    description: req.body.description,
  });

  res.status(201).json(strategy);
});

router.get('/', async (req, res) => {
  const strategies = await Strategy.find()
    .populate('user', 'email')
    .sort({ createdAt: -1 });

  res.json(strategies);
});

module.exports = router;
