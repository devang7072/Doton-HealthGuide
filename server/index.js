/**
 * index.js — Doton Express Server Entry Point
 * Runs on PORT 5000 by default
 */
// Load env vars from .env file (for local dev)
require('dotenv').config(); 
// Also try loading from one level up just in case (legacy)
require('dotenv').config({ path: '../.env' }); 

const express        = require('express');
const cors           = require('cors');
const connectDB      = require('./config/db');

const authRoutes      = require('./routes/authRoutes');
const reminderRoutes  = require('./routes/reminderRoutes');
const healthLogRoutes = require('./routes/healthLogRoutes');
const outbreakRoutes  = require('./routes/outbreakRoutes');

// ── Connect to MongoDB ───────────────────────────────────────────
connectDB();

const app = express();

// ── Middleware ───────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3005',
  'http://localhost:3000',
  'https://doton.netlify.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/reminders',   reminderRoutes);
app.use('/api/health-log',  healthLogRoutes);
app.use('/api/outbreaks',   outbreakRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', message: '🩺 Doton API is running' });
});

// ── 404 handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

// ── Start server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Doton API running at http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/ping`);
});
