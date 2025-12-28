const Strategy = require('../models/strategy');

/* ================= CREATE STRATEGY ================= */
exports.createStrategy = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Strategy content required' });
    }

    const strategy = await Strategy.create({
      user: req.user.id,
      content: content.trim(),
    });

    res.status(201).json(strategy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create strategy' });
  }
};

/* ================= GET STRATEGIES ================= */
exports.getStrategies = async (req, res) => {
  try {
    const strategies = await Strategy.find({ isDeleted: false })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(strategies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch strategies' });
  }
};

/* ================= LIKE / UNLIKE ================= */
exports.toggleLike = async (req, res) => {
  try {
    const strategy = await Strategy.findById(req.params.id);

    if (!strategy || strategy.isDeleted) {
      return res.status(404).json({ message: 'Strategy not found' });
    }

    const userId = req.user.id;
    const liked = strategy.likes.includes(userId);

    if (liked) {
      strategy.likes.pull(userId);
    } else {
      strategy.likes.push(userId);
    }

    await strategy.save();
    res.json(strategy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update like' });
  }
};

/* ================= SAVE / UNSAVE ================= */
exports.toggleSave = async (req, res) => {
  try {
    const strategy = await Strategy.findById(req.params.id);

    if (!strategy || strategy.isDeleted) {
      return res.status(404).json({ message: 'Strategy not found' });
    }

    const userId = req.user.id;
    const saved = strategy.savedBy.includes(userId);

    if (saved) {
      strategy.savedBy.pull(userId);
    } else {
      strategy.savedBy.push(userId);
    }

    await strategy.save();
    res.json(strategy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update save' });
  }
};

/* ================= ADD COMMENT ================= */
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment text required' });
    }

    const strategy = await Strategy.findById(req.params.id);

    if (!strategy || strategy.isDeleted) {
      return res.status(404).json({ message: 'Strategy not found' });
    }

    strategy.comments.push({
      user: req.user.id,
      text: text.trim(),
    });

    await strategy.save();
    res.json(strategy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};
