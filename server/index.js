require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');

const editionsRouter = require('./routes/editions');
const { startScheduler } = require('./services/scheduler');
const { testConnection } = require('./db/database');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://yorgoassal.com'
    : 'http://localhost:5173',   // Vite dev server default port
  methods: ['GET'],              // read-only public API
}));

app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
// Used by CloudWatch and Nginx to confirm the server is alive
app.get('/health', (req, res) => {
  res.status(200).json({
    status:  'ok',
    service: 'yortech-api',
    time:    new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/editions', editionsRouter);

// ── Serve React frontend in production ───────────────────────────────────────
// In production, Nginx serves the static client build directly.
// This fallback is here as a safety net only.
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'dist');
  app.use('/yortech', express.static(clientBuild));

  // React Router catch-all — any /yortech/* route serves index.html
  app.get('/yortech/*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`[YorTech API] Running on port ${PORT} — ${process.env.NODE_ENV || 'development'} mode`);

  // Verify database connection on startup
  // If this fails, check your DATABASE_URL in .env
  await testConnection();

  // Start the daily generation + cleanup scheduler
  // Only runs in production to avoid accidental API calls during development
  if (process.env.NODE_ENV === 'production') {
    startScheduler();
    console.log('[Scheduler] Daily generation job active');
  } else {
    console.log('[Scheduler] Skipped in development mode — use generateEdition() to test manually');
  }
});

module.exports = app;
