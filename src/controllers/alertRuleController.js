const AlertRule = require('../models/AlertRule');

/* ================= CREATE RULE ================= */
exports.createRule = async (req, res) => {
  try {
    const { symbol, timeframe, logic, triggerType } = req.body;

    if (!symbol || !timeframe || !logic?.indicator || !logic?.condition) {
      return res.status(400).json({ error: 'Invalid rule data' });
    }

    const rule = await AlertRule.create({
      user: req.user.id,
      symbol: symbol.toUpperCase(),
      timeframe,
      logic,
      triggerType: triggerType || 'ENTRY',
    });

    res.status(201).json(rule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create alert rule' });
  }
};

/* ================= GET MY RULES ================= */
exports.getMyRules = async (req, res) => {
  try {
    const rules = await AlertRule.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load alert rules' });
  }
};

/* ================= TOGGLE ACTIVE ================= */
exports.toggleRule = async (req, res) => {
  try {
    const rule = await AlertRule.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!rule) return res.sendStatus(404);

    rule.isActive = !rule.isActive;
    await rule.save();

    res.json({ isActive: rule.isActive });
  } catch {
    res.status(500).json({ error: 'Failed to toggle rule' });
  }
};

/* ================= DELETE RULE ================= */
exports.deleteRule = async (req, res) => {
  try {
    const rule = await AlertRule.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!rule) return res.sendStatus(404);

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};
