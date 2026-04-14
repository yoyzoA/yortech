/**
 * scheduler.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Controls when the daily generation runs and how long articles are retained.
 * All timing changes happen here — no need to touch the scheduler service.
 *
 * Cron format: second(optional) minute hour day-of-month month day-of-week
 * Day-of-week:  0=Sunday, 1=Monday ... 5=Friday, 6=Saturday
 * ──────────────────────────────────────────────────────────────────────────────
 */

module.exports = {

  generation: {
    enabled: true,

    // 8:00 AM UTC, Monday through Friday only
    cronExpression: '0 8 * * 1-5',
    timezone:       'UTC',
  },

  cleanup: {
    enabled: true,

    // 8:01 AM UTC, Monday through Friday
    // Runs 1 minute after generation to ensure today's edition is saved first
    cronExpression: '1 8 * * 1-5',

    // Articles older than this many days are permanently deleted (FIFO)
    retentionDays: 30,
  },

};
