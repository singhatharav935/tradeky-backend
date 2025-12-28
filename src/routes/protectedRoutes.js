const express = require('express');
const protect = require('../middlewares/authMiddleware');


const router = express.Router();

router.get('/protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed',
    user: req.user,
  });
});

module.exports = router;
