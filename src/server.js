// src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());

// ===== HEALTH =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TradeKY backend running' });
});

// ===== ROUTES =====
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const communityRoutes = require('./routes/communityRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/community', communityRoutes);

// ===== START =====
const PORT = process.env.PORT || 7000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
})();
