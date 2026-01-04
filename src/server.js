// src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env
dotenv.config();

const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// make io available everywhere
app.set('io', io);

io.on('connection', socket => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('join-general', () => {
    socket.join('general');
  });

  socket.on('join-group', groupId => {
    socket.join(`group:${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

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
const positionsRoutes = require('./routes/positionsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');

const mediaRoutes = require('./routes/mediaRoutes');
const strategyRoutes = require('./routes/strategyRoutes');
const newsRoutes = require('./routes/newsRoutes');
const myPostsRoutes = require('./routes/myPostsRoutes');
const topTradersRoutes = require('./routes/topTradersRoutes');
const trendingRoutes = require('./routes/trendingRoutes');
const membersRoutes = require('./routes/membersRoutes'); // ✅ MEMBERS

// ✅ NEW — ACCOUNT / MONEY / P&L ROUTES (ADDED, NOTHING REMOVED)
const accountRoutes = require('./routes/accountRoutes');

// ================== USE ROUTES ==================
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

app.use('/api/trades', tradeRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/positions', positionsRoutes);

// ✅ NEW — MONEY / BALANCE / P&L
app.use('/api/account', accountRoutes);

app.use('/api/media', mediaRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/my-posts', myPostsRoutes);
app.use('/api/top-traders', topTradersRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/members', membersRoutes); // ✅ MEMBERS LIVE

// ================== START SERVER ==================
const PORT = process.env.PORT || 7000;

const startServer = async () => {
  try {
    console.log('🚀 Starting TradeKY backend...');
    await connectDB();

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
};

startServer();
