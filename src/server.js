// src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env
dotenv.config();

const app = express();

// ================== MIDDLEWARES ==================
app.use(cors());
app.use(express.json());

// ================== HEALTH ==================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'TradeKY backend running',
  });
});

// ================== ROUTES ==================
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const communityRoutes = require('./routes/communityRoutes');
const positionsRoutes = require('./routes/positionsRoutes'); // ✅ P&L / Positions

// Auth
app.use('/api/auth', authRoutes);

// Protected test route
app.use('/api', protectedRoutes);

// Trades
app.use('/api/trades', tradeRoutes);

// Community (strategies / posts)
app.use('/api/community', communityRoutes);

// Positions & P&L
app.use('/api/positions', positionsRoutes);

// ================== START SERVER ==================
const PORT = process.env.PORT || 7000;

const startServer = async () => {
  try {
    console.log('🚀 Starting TradeKY backend...');
    await connectDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
};

startServer();
