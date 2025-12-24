// src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// ====== GLOBAL MIDDLEWARES ======
app.use(cors());
app.use(express.json());

// ====== ROOT (IMPORTANT FIX) ======
app.get('/', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'TradeKY Backend Live',
  });
});

// ====== HEALTH CHECK ======
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'TradeKY backend running',
  });
});

// ====== ROUTES ======
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const communityRoutes = require('./routes/communityRoutes');

console.log('✅ Routes loaded');

// Auth
app.use('/api/auth', authRoutes);

// Protected test route
app.use('/api', protectedRoutes);

// Trades
app.use('/api/trades', tradeRoutes);

// Community (posts, likes, follow later)
app.use('/api/community', communityRoutes);

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
