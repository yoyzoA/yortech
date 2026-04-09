/**
 * database.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Single shared connection pool for the entire backend.
 * Every service imports { query, getClient } from here — never creates
 * its own connection. This keeps connection count low, which matters
 * on Neon's free tier.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const { Pool } = require('pg');

// ── Connection pool ───────────────────────────────────────────────────────────
// Neon requires SSL. The connection string from your .env already includes
// ?sslmode=require — pg handles the rest automatically.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Keep the pool small — Neon free tier has connection limits
  max:             5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log when the pool connects successfully (helpful on first deploy)
pool.on('connect', () => {
  console.log('[DB] Connected to Neon PostgreSQL');
});

// Log pool errors without crashing the process
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});


// ── query() ───────────────────────────────────────────────────────────────────
// Simple wrapper for single queries.
// Usage:
//   const { rows } = await query('SELECT * FROM editions WHERE date = $1', [date]);
//
const query = (text, params) => pool.query(text, params);


// ── getClient() ───────────────────────────────────────────────────────────────
// Returns a dedicated client for transactions.
// Always call client.release() in a finally block to return it to the pool.
// Usage:
//   const client = await getClient();
//   try {
//     await client.query('BEGIN');
//     await client.query(...);
//     await client.query('COMMIT');
//   } catch (err) {
//     await client.query('ROLLBACK');
//     throw err;
//   } finally {
//     client.release();
//   }
//
const getClient = () => pool.connect();


// ── testConnection() ─────────────────────────────────────────────────────────
// Runs a lightweight query to verify the database is reachable.
// Called once at server startup.
const testConnection = async () => {
  try {
    const { rows } = await query('SELECT NOW() AS time');
    console.log(`[DB] Connection verified — server time: ${rows[0].time}`);
    return true;
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    return false;
  }
};


// ── Edition queries ───────────────────────────────────────────────────────────

/**
 * Get the most recent edition with all its articles.
 * Returns null if no editions exist yet.
 */
const getLatestEdition = async () => {
  const editionResult = await query(
    `SELECT * FROM editions ORDER BY date DESC LIMIT 1`
  );

  if (editionResult.rows.length === 0) return null;

  const edition = editionResult.rows[0];

  const articlesResult = await query(
    `SELECT * FROM articles
     WHERE edition_id = $1
     ORDER BY is_lead DESC, category ASC, id ASC`,
    [edition.id]
  );

  return { ...edition, articles: articlesResult.rows };
};


/**
 * Get a specific edition by date (format: 'YYYY-MM-DD') with all its articles.
 * Returns null if not found.
 */
const getEditionByDate = async (date) => {
  const editionResult = await query(
    `SELECT * FROM editions WHERE date = $1`,
    [date]
  );

  if (editionResult.rows.length === 0) return null;

  const edition = editionResult.rows[0];

  const articlesResult = await query(
    `SELECT * FROM articles
     WHERE edition_id = $1
     ORDER BY is_lead DESC, category ASC, id ASC`,
    [edition.id]
  );

  return { ...edition, articles: articlesResult.rows };
};


/**
 * Get all edition summaries for the archive page.
 * Returns date and article count only — no full article content.
 * Ordered newest first.
 */
const getAllEditions = async () => {
  const result = await query(
    `SELECT
       e.id,
       e.date,
       e.created_at,
       COUNT(a.id)::int AS article_count
     FROM editions e
     LEFT JOIN articles a ON a.edition_id = e.id
     GROUP BY e.id, e.date, e.created_at
     ORDER BY e.date DESC`
  );

  return result.rows;
};


/**
 * Save a complete edition (edition row + all articles) in a single transaction.
 * If anything fails, the entire edition is rolled back — no partial saves.
 *
 * @param {string}   date     - 'YYYY-MM-DD'
 * @param {Array}    articles - array of article objects from the curator
 * @param {number}   leadIdx  - index of the lead story in the articles array
 */
const saveEdition = async (date, articles, leadIdx = 0) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Insert the edition row
    const editionResult = await client.query(
      `INSERT INTO editions (date) VALUES ($1)
       ON CONFLICT (date) DO UPDATE SET date = EXCLUDED.date
       RETURNING *`,
      [date]
    );

    const editionId = editionResult.rows[0].id;

    // Delete any existing articles for this edition (handles re-generation)
    await client.query(
      `DELETE FROM articles WHERE edition_id = $1`,
      [editionId]
    );

    // Insert all articles
    for (let i = 0; i < articles.length; i++) {
      const a = articles[i];
      await client.query(
        `INSERT INTO articles (
           edition_id, category, title, summary, is_lead,
           source_name, source_author, source_url,
           image_url, image_credit, keywords
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          editionId,
          a.category,
          a.title,
          a.summary,
          i === leadIdx,           // mark the lead story
          a.source_name,
          a.source_author || null,
          a.source_url,
          a.image_url    || null,
          a.image_credit || null,
          a.keywords     || [],
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`[DB] Edition ${date} saved — ${articles.length} articles`);
    return editionId;

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[DB] Failed to save edition ${date}:`, err.message);
    throw err;
  } finally {
    client.release();
  }
};


/**
 * FIFO cleanup — delete editions older than retentionDays.
 * ON DELETE CASCADE automatically removes their articles too.
 *
 * @param {number} retentionDays - editions older than this are deleted
 */
const deleteOldEditions = async (retentionDays) => {
  const result = await query(
    `DELETE FROM editions
     WHERE date < CURRENT_DATE - INTERVAL '1 day' * $1
     RETURNING date`,
    [retentionDays]
  );

  const deleted = result.rows.map(r => r.date);

  if (deleted.length > 0) {
    console.log(`[DB] Cleaned up ${deleted.length} old edition(s): ${deleted.join(', ')}`);
  }

  return deleted.length;
};


module.exports = {
  query,
  getClient,
  testConnection,
  getLatestEdition,
  getEditionByDate,
  getAllEditions,
  saveEdition,
  deleteOldEditions,
};