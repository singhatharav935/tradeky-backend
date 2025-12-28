const Media = require('../models/Media');

/* ================= CREATE MEDIA ================= */
exports.createMedia = async (req, res) => {
  try {
    const { type, url, caption } = req.body;

    if (!type || !url) {
      return res.status(400).json({ message: 'Media type and url required' });
    }

    const media = await Media.create({
      author: req.user.id,
      type,
      url,
      caption: caption || '',
    });

    res.status(201).json(media);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create media' });
  }
};

/* ================= GET MEDIA FEED ================= */
exports.getMediaFeed = async (req, res) => {
  try {
    const media = await Media.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(media);
  } catch {
    res.status(500).json({ message: 'Failed to fetch media' });
  }
};

/* ================= LIKE / UNLIKE ================= */
exports.toggleLike = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const userId = req.user.id;
    const liked = media.likes.includes(userId);

    if (liked) {
      media.likes.pull(userId);
    } else {
      media.likes.push(userId);
    }

    await media.save();
    res.json(media);
  } catch {
    res.status(500).json({ message: 'Failed to update like' });
  }
};
