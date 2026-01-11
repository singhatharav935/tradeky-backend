const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  createRule,
  getMyRules,
  toggleRule,
  deleteRule,
} = require('../controllers/alertRuleController');

/* ================= ALERT RULES ================= */
router.post('/', authMiddleware, createRule);
router.get('/', authMiddleware, getMyRules);
router.post('/:id/toggle', authMiddleware, toggleRule);
router.delete('/:id', authMiddleware, deleteRule);

module.exports = router;
