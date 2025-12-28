const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const { getMyPosts } = require('../controllers/myPostsController');

/* ===== PROTECTED ===== */
router.get('/', authMiddleware, getMyPosts);

module.exports = router;
