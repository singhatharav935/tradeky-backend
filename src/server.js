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

// ====== PUBLIC ROUTES ======

// Health check
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'TradeKY backend running',
  });
});

// ====== ROUTES ======
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

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
