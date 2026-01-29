// src/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// 🔔 ALERT SCHEDULER (AI ENGINE)
const { startAlertScheduler } = require('./services/alertScheduler');

// ✅ MARKET ROUTES (TradingView / Paper Trading)
const marketRoutes = require('./routes/marketRoutes');

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

// ✅ MAKE IO GLOBAL (FOR ALERT ENGINE)
global.io = io;
app.set('io', io);

io.on('connection', socket => {
  console.log('🟢 Socket connected:', socket.id);

  // ✅ USER ROOM (FOR NOTIFICATIONS)
  socket.on('join-user', userId => {
    if (userId) {
      socket.join(userId);
      console.log(`👤 User joined socket room: ${userId}`);
    }
  });

  socket.on('join-general', () => socket.join('general'));

  socket.on('join-group', groupId => {
    socket.join(`group:${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

/* ================= MIDDLEWARES ================= */
app.use(cors());
app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* ================= HEALTH ================= */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TradeKY backend running',
  });
});

/* ================= ROUTES ================= */
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const communityRoutes = require('./routes/communityRoutes');
const positionsRoutes = require('./routes/positionsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const groupPostRoutes = require('./routes/groupPostRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const strategyRoutes = require('./routes/strategyRoutes');
const newsRoutes = require('./routes/newsRoutes');
const myPostsRoutes = require('./routes/myPostsRoutes');
const topTradersRoutes = require('./routes/topTradersRoutes');
const trendingRoutes = require('./routes/trendingRoutes');
const membersRoutes = require('./routes/membersRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const accountRoutes = require('./routes/accountRoutes');
const alertRuleRoutes = require('./routes/alertRuleRoutes');

/* ================= USE ROUTES ================= */
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

app.use('/api/trades', tradeRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/group-posts', groupPostRoutes);
app.use('/api/positions', positionsRoutes);

app.use('/api/account', accountRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/strategies', strategyRoutes);

// 🔔 AI ALERT RULES
app.use('/api/alert-rules', alertRuleRoutes);

app.use('/api/news', newsRoutes);
app.use('/api/my-posts', myPostsRoutes);
app.use('/api/top-traders', topTradersRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/members', membersRoutes);

app.use('/api/upload', uploadRoutes);

// ✅ MARKET DATA (TradingView / Demo Feed)
app.use('/api/market', marketRoutes);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 7000;

async function startServer() {
  try {
    console.log('🚀 Starting TradeKY backend...');
    await connectDB();

    // 🔔 START ALERT ENGINE
    startAlertScheduler();

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
}

startServer();
