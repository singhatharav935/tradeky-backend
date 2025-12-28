const News = require('../models/News');

/* ================= CREATE NEWS ================= */
exports.createNews = async (req, res) => {
  try {
    const { title, summary, source, url, tags } = req.body;

    if (!title || !summary) {
      return res.status(400).json({ message: 'Title and summary required' });
    }

    const news = await News.create({
      title,
      summary,
      source: source || 'TradeKY',
      url: url || '',
      tags: tags || [],
    });

    res.status(201).json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create news' });
  }
};

/* ================= GET NEWS FEED ================= */
exports.getNewsFeed = async (req, res) => {
  try {
    const news = await News.find({ isActive: true })
      .sort({ publishedAt: -1 })
      .limit(50);

    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
};
