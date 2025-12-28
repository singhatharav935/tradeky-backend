const Strategy = require('../models/Strategy');
const mongoose = require('mongoose');

/* ================= GET TOP TRADERS ================= */
exports.getTopTraders = async (req, res) => {
  try {
    const topTraders = await Strategy.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: '$user',
          totalStrategies: { $sum: 1 },
          totalLikes: { $sum: { $size: '$likes' } },
          totalSaves: { $sum: { $size: '$savedBy' } },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$totalStrategies', 5] },
              { $multiply: ['$totalLikes', 2] },
              { $multiply: ['$totalSaves', 3] },
            ],
          },
        },
      },
      {
        $sort: { score: -1 },
      },
      {
        $limit: 20,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          name: '$user.name',
          email: '$user.email',
          totalStrategies: 1,
          totalLikes: 1,
          totalSaves: 1,
          score: 1,
        },
      },
    ]);

    res.json(topTraders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch top traders' });
  }
};
