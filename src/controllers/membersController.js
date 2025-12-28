const User = require('../models/User');
const Strategy = require('../models/Strategy');
const Media = require('../models/Media');

/* ================= GET MEMBERS ================= */
exports.getMembers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('_id name email createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map(u => u._id);

    const strategiesCount = await Strategy.aggregate([
      { $match: { user: { $in: userIds }, isDeleted: false } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);

    const mediaCount = await Media.aggregate([
      { $match: { author: { $in: userIds } } },
      { $group: { _id: '$author', count: { $sum: 1 } } },
    ]);

    const strategyMap = {};
    strategiesCount.forEach(s => (strategyMap[s._id] = s.count));

    const mediaMap = {};
    mediaCount.forEach(m => (mediaMap[m._id] = m.count));

    const members = users.map(u => ({
      id: u._id,
      name: u.name || 'User',
      email: u.email,
      joinedAt: u.createdAt,
      strategies: strategyMap[u._id] || 0,
      media: mediaMap[u._id] || 0,
    }));

    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};
