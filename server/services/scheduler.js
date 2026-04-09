/**
 * scheduler.js  (service)
 * ──────────────────────────────────────────────────────────────────────────────
 * Wires together the daily generation pipeline and FIFO cleanup job.
 * Called once at server startup (production only).
 *
 * Pipeline order for each edition:
 *   1. fetchAllSources()         — pull raw articles from all 4 sources
 *   2. curateEdition()           — Claude Haiku selects + rewrites articles
 *   3. enrichArticlesWithImages() — Pexels image per article
 *   4. saveEdition()             — persist to Neon PostgreSQL
 * ──────────────────────────────────────────────────────────────────────────────
 */

const cron = require('node-cron');

const schedulerConfig             = require('../config/scheduler');
const { fetchAllSources }         = require('./fetcher');
const { curateEdition }           = require('./curator');
const { enrichArticlesWithImages } = require('./imageService');
const { saveEdition, deleteOldEditions } = require('../db/database');


// ── Generation pipeline ───────────────────────────────────────────────────────

/**
 * Runs the full edition generation pipeline for a given date.
 * Exported so it can be triggered manually during development/testing.
 *
 * @param {string} date - 'YYYY-MM-DD' (defaults to today)
 */
const generateEdition = async (date = null) => {
  const editionDate = date || new Date().toISOString().split('T')[0];

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`[Scheduler] Generating edition for ${editionDate}`);
  console.log(`${'─'.repeat(60)}`);

  const startTime = Date.now();

  try {
    // Step 1 — Fetch raw articles from all sources
    const rawArticles = await fetchAllSources();

    if (rawArticles.length === 0) {
      throw new Error('No articles fetched from any source');
    }

    // Step 2 — Curate with Claude Haiku
    const edition = await curateEdition(rawArticles, editionDate);

    // Step 3 — Enrich with Pexels images
    const enrichedArticles = await enrichArticlesWithImages(edition.articles);

    // Step 4 — Save to database
    await saveEdition(editionDate, enrichedArticles, edition.lead_story_index);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Scheduler] Edition ${editionDate} complete in ${elapsed}s`);
    console.log(`${'─'.repeat(60)}\n`);

    return { success: true, date: editionDate, articleCount: enrichedArticles.length };

  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[Scheduler] Edition ${editionDate} FAILED after ${elapsed}s:`, err.message);
    console.log(`${'─'.repeat(60)}\n`);

    return { success: false, date: editionDate, error: err.message };
  }
};


// ── Cleanup pipeline ──────────────────────────────────────────────────────────

const runCleanup = async () => {
  const { retentionDays } = schedulerConfig.cleanup;
  console.log(`[Scheduler] Running FIFO cleanup — deleting editions older than ${retentionDays} days`);

  try {
    const deleted = await deleteOldEditions(retentionDays);
    console.log(`[Scheduler] Cleanup complete — ${deleted} edition(s) removed`);
  } catch (err) {
    console.error('[Scheduler] Cleanup failed:', err.message);
  }
};


// ── Start scheduler ───────────────────────────────────────────────────────────

/**
 * Registers both cron jobs.
 * Called once from server/index.js when NODE_ENV === 'production'.
 */
const startScheduler = () => {
  const { generation, cleanup } = schedulerConfig;

  // ── Daily generation job ────────────────────────────────────────────────
  if (generation.enabled) {
    const isValidCron = cron.validate(generation.cronExpression);

    if (!isValidCron) {
      console.error(`[Scheduler] Invalid generation cron expression: "${generation.cronExpression}"`);
    } else {
      cron.schedule(generation.cronExpression, () => {
        generateEdition();
      }, {
        timezone: generation.timezone,
      });

      console.log(
        `[Scheduler] Generation job scheduled — ` +
        `"${generation.cronExpression}" (${generation.timezone})`
      );
    }
  }

  // ── Daily cleanup job ───────────────────────────────────────────────────
  if (cleanup.enabled) {
    const isValidCron = cron.validate(cleanup.cronExpression);

    if (!isValidCron) {
      console.error(`[Scheduler] Invalid cleanup cron expression: "${cleanup.cronExpression}"`);
    } else {
      cron.schedule(cleanup.cronExpression, () => {
        runCleanup();
      }, {
        timezone: generation.timezone,
      });

      console.log(
        `[Scheduler] Cleanup job scheduled — ` +
        `"${cleanup.cronExpression}" (${generation.timezone})`
      );
    }
  }
};


module.exports = { startScheduler, generateEdition };