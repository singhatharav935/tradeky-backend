// src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// ====== GLOBAL MIDDLEWARES ======
app.use(cors());
app.use(express.json());

// ====== PUBLIC ROUTES ======

// Health check
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'TradeKY backend running',
  });
});

// ====== PROTECTED TEST ROUTE ======
app.get('/api/protected', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: 'Protected route accessed',
      user: decoded,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// ====== AUTH ROUTES ======
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ====== START SERVER ======
const PORT = process.env.PORT || 7000;

const startServer = async () => {
  try {
    console.log('🚀 Starting TradeKY backend...');
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
