const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const authMiddleware = require('../middleware/authMiddleware');

const isAdmin = (group, userId) =>
  group.owner.toString() === userId ||
  (group.admins || []).some(a => a.toString() === userId);

/* ================= CREATE GROUP (CREATOR) ================= */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Group name required' });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description || '',
      owner: req.user.id,          // 👑 CREATOR
      admins: [],
      members: [req.user.id],
      banned: [],
      joinRequests: [],            // ✅ NEW
      isPrivate: !!isPrivate,
      isLocked: false,
    });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

/* ================= LIST GROUPS (PUBLIC) ================= */
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({ isPrivate: false })
      .populate('owner', 'name')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch {
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
  } catch {
    res.status(500).json({ error: 'Failed to load group' });
  }
});

/* ================= JOIN / REQUEST ================= */
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.sendStatus(404);

    if (group.banned.includes(req.user.id)) {
      return res.status(403).json({ error: 'Banned from group' });
    }

    // 🔒 PRIVATE GROUP → REQUEST
    if (group.isPrivate) {
      if (!group.joinRequests.includes(req.user.id)) {
        group.joinRequests.push(req.user.id);
        await group.save();
      }
      return res.json({ requested: true });
    }

    // 🌍 PUBLIC GROUP
    const isMember = group.members.includes(req.user.id);
    isMember
      ? group.members.pull(req.user.id)
      : group.members.push(req.user.id);

    await group.save();
    res.json({ joined: !isMember });
  } catch {
    res.status(500).json({ error: 'Failed to join group' });
  }
});

/* ================= ADMIN: APPROVE REQUEST ================= */
router.post('/:id/approve/:userId', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.sendStatus(404);
    if (!isAdmin(group, req.user.id)) return res.sendStatus(403);

    group.joinRequests.pull(req.params.userId);
    if (!group.members.includes(req.params.userId)) {
      group.members.push(req.params.userId);
    }

    await group.save();
    res.json({ approved: true });
  } catch {
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

/* ================= ADMIN: REJECT REQUEST ================= */
router.post('/:id/reject/:userId', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.sendStatus(404);
    if (!isAdmin(group, req.user.id)) return res.sendStatus(403);

    group.joinRequests.pull(req.params.userId);
    await group.save();

    res.json({ rejected: true });
  } catch {
    res.status(500).json({ error: 'Failed to reject user' });
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
  } catch {
    res.status(500).json({ error: 'Failed to update group' });
  }
});

/* ================= ADMIN: LOCK / UNLOCK ================= */
router.post('/:id/lock', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.sendStatus(404);
    if (!isAdmin(group, req.user.id)) return res.sendStatus(403);

    group.isLocked = !group.isLocked;
    await group.save();

    res.json({ locked: group.isLocked });
  } catch {
    res.status(500).json({ error: 'Failed to lock group' });
  }
});

/* ================= ADMIN: REMOVE / BAN ================= */
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
  } catch {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

module.exports = router;
