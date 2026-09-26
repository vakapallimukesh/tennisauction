const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const auctionRouter = require('./routes/auction');
const sponsorsRouter = require('./routes/sponsors');
const authRouter = require('./routes/auth');
const { initSocket } = require('./socket/auctionSocket');
const { requireAdmin } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Initialize Socket.IO
initSocket(server);

// Middleware — Restrict CORS to trusted origins
const ALLOWED_ORIGINS = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) return true;
  if (origin.endsWith('.onrender.com')) return true;
  if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) return true;
  return false;
};

app.use(cors({
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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

// Reset auction data (clear everything back to initial state) — Admin only
app.post('/api/auction/reset', requireAdmin, (req, res) => {
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

// Serve frontend static build in production (if frontend/dist exists)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global error handler — suppress details in production
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(isProduction ? {} : { error: err.message })
  });
});

server.listen(PORT, () => {
  console.log(`🎾 Tennis Auction Backend Server + Socket.IO running on port ${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});
