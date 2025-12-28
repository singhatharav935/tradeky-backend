const Strategy = require('../models/strategy');

const Media = require('../models/Media');

/* ================= GET MY POSTS ================= */
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const strategies = await Strategy.find({
      user: userId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 });

    const media = await Media.find({
      author: userId,
    })
      .sort({ createdAt: -1 });

    res.json({
      strategies,
      media,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch my posts' });
  }
};
