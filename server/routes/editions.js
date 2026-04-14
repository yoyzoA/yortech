/**
 * routes/editions.js
 * ──────────────────────────────────────────────────────────────────────────────
 * REST API routes for the YorTech newspaper editions.
 * All routes are read-only (GET) — no authentication required.
 *
 * Mounted at /api/editions in server/index.js
 *
 * Routes:
 *   GET /api/editions              → archive list (date + article count)
 *   GET /api/editions/latest       → today's or most recent edition
 *   GET /api/editions/:date        → specific edition by date (YYYY-MM-DD)
 * ──────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router  = express.Router();

const {
  getLatestEdition,
  getEditionByDate,
  getAllEditions,
} = require('../db/database');


// ── Input validation helper ───────────────────────────────────────────────────

/**
 * Validates that a date string matches YYYY-MM-DD format.
 * Prevents SQL injection and malformed queries reaching the database.
 */
const isValidDate = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};


// ── GET /api/editions ─────────────────────────────────────────────────────────
// Returns a list of all editions for the archive page.
// Only returns metadata (date, article count) — not full article content.
// This keeps the archive page load fast.

router.get('/', async (req, res) => {
  try {
    const editions = await getAllEditions();

    if (editions.length === 0) {
      return res.status(200).json({
        editions: [],
        message:  'No editions published yet. Check back Monday–Friday at 8 AM GMT.',
      });
    }

    res.status(200).json({ editions });

  } catch (err) {
    console.error('[API] GET /editions failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch editions' });
  }
});


// ── GET /api/editions/latest ──────────────────────────────────────────────────
// Returns the most recent edition with all articles.
// This is the primary endpoint — called on every visit to the homepage.
// NOTE: This route must be defined BEFORE /:date to avoid Express
// matching "latest" as a date parameter.

router.get('/latest', async (req, res) => {
  try {
    const edition = await getLatestEdition();

    if (!edition) {
      return res.status(200).json({
        edition: null,
        message: 'No editions published yet. Check back Monday–Friday at 8 AM GMT.',
      });
    }

    res.status(200).json({ edition });

  } catch (err) {
    console.error('[API] GET /editions/latest failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch latest edition' });
  }
});


// ── GET /api/editions/:date ───────────────────────────────────────────────────
// Returns a specific edition by date.
// Date format must be YYYY-MM-DD (e.g. /api/editions/2026-04-09)

router.get('/:date', async (req, res) => {
  const { date } = req.params;

  // Validate date format before hitting the database
  if (!isValidDate(date)) {
    return res.status(400).json({
      error: 'Invalid date format. Use YYYY-MM-DD (e.g. 2026-04-09)',
    });
  }

  try {
    const edition = await getEditionByDate(date);

    if (!edition) {
      return res.status(404).json({
        error: `No edition found for ${date}`,
      });
    }

    res.status(200).json({ edition });

  } catch (err) {
    console.error(`[API] GET /editions/${date} failed:`, err.message);
    res.status(500).json({ error: 'Failed to fetch edition' });
  }
});


module.exports = router;
