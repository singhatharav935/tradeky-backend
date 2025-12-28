const Strategy = require('../models/Strategy');
const Media = require('../models/Media');

/* ================= GET TRENDING ================= */
exports.getTrending = async (req, res) => {
  try {
    // last 7 days
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const strategies = await Strategy.find({
      isDeleted: false,
      createdAt: { $gte: since },
    })
      .populate('user', 'name')
      .lean();

    const media = await Media.find({
      createdAt: { $gte: since },
    })
      .populate('author', 'name')
      .lean();

    const scoredStrategies = strategies.map(s => ({
      type: 'strategy',
      id: s._id,
      content: s.content,
      author: s.user?.name || 'User',
      createdAt: s.createdAt,
      score:
        s.likes.length * 3 +
        s.savedBy.length * 4 +
        s.comments.length * 2,
    }));

    const scoredMedia = media.map(m => ({
      type: 'media',
      id: m._id,
      mediaType: m.type,
      url: m.url,
      caption: m.caption || '',
      author: m.author?.name || 'User',
      createdAt: m.createdAt,
      score: m.likes.length * 3,
    }));

    const trending = [...scoredStrategies, ...scoredMedia]
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    res.json(trending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch trending posts' });
  }
};
