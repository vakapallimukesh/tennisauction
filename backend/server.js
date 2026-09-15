const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const auctionRouter = require('./routes/auction');
const sponsorsRouter = require('./routes/sponsors');
const authRouter = require('./routes/auth');
const { initSocket } = require('./socket/auctionSocket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/auction', auctionRouter);
app.use('/api/sponsors', sponsorsRouter);

// Reset auction data (clear everything back to initial state)
app.post('/api/auction/reset', (req, res) => {
  const db = require('./config/db');
  const store = db.resetMemoryStore();
  const { broadcastAuctionState } = require('./socket/auctionSocket');
  broadcastAuctionState();
  res.json({
    success: true,
    message: 'All auction data reset to initial state. All bids, sold players, and team purchases cleared.'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'Tennis Player Auction Backend (with Real-Time Socket.IO)'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

server.listen(PORT, () => {
  console.log(`🎾 Tennis Auction Backend Server + Socket.IO running on port ${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});
