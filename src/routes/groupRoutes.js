const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');

const isAdmin = (group, userId) =>
  group.owner.toString() === userId ||
  (group.admins || []).some(a => a.toString() === userId);

/* ================= CREATE GROUP ================= */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Group name required' });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description || '',
      owner: req.user.id,
      admins: [],
      members: [req.user.id],
      banned: [],
      isPrivate: !!isPrivate,
      isLocked: false,
    });

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

/* ================= LIST GROUPS (PUBLIC SAFE) ================= */
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({ isPrivate: false })
      .populate('owner', 'name')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load groups' });
  }
});

/* ================= GROUP DETAILS ================= */
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name')
      .populate('owner', 'name');

    if (!group) return res.sendStatus(404);

    if (group.isPrivate) {
      return res.status(403).json({ error: 'Private group' });
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load group' });
  }
});

/* ================= JOIN / LEAVE ================= */
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.sendStatus(404);

    if (group.banned.includes(req.user.id)) {
      return res.status(403).json({ error: 'Banned' });
    }

    if (group.isPrivate) {
      return res.status(403).json({ error: 'Private group' });
    }

    const isMember = group.members.includes(req.user.id);

    isMember
      ? group.members.pull(req.user.id)
      : group.members.push(req.user.id);

    await group.save();
    res.json({ joined: !isMember });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join/leave group' });
  }
});

/* ================= ADMIN: EDIT GROUP ================= */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.sendStatus(404);

    if (!isAdmin(group, req.user.id)) return res.sendStatus(403);

    group.name = req.body.name?.trim() || group.name;
    group.description = req.body.description ?? group.description;

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update group' });
  }
});

/* ================= ADMIN: LOCK / UNLOCK CHAT ================= */
router.post('/:id/lock', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.sendStatus(404);

    if (!isAdmin(group, req.user.id)) return res.sendStatus(403);

    group.isLocked = !group.isLocked;
    await group.save();

    res.json({ locked: group.isLocked });
  } catch (err) {
    res.status(500).json({ error: 'Failed to lock/unlock group' });
  }
});

/* ================= ADMIN: REMOVE / BAN MEMBER ================= */
router.post('/:id/remove/:userId', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.sendStatus(404);

    if (!isAdmin(group, req.user.id)) return res.sendStatus(403);

    group.members.pull(req.params.userId);

    if (!group.banned.includes(req.params.userId)) {
      group.banned.push(req.params.userId);
    }

    await group.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
