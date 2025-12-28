const express = require('express');
const router = express.Router();

const { getMembers } = require('../controllers/membersController');

/* ===== PUBLIC ===== */
router.get('/', getMembers);

module.exports = router;
