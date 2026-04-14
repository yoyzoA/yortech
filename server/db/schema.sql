-- ──────────────────────────────────────────────────────────────────────────────
-- YorTech Database Schema
-- Run this once against your Neon database to initialize all tables.
-- Command: psql $DATABASE_URL -f server/db/schema.sql
-- Or paste directly into the Neon SQL Editor in your dashboard.
-- ──────────────────────────────────────────────────────────────────────────────


-- ── Extensions ────────────────────────────────────────────────────────────────
-- pgcrypto is available on Neon by default — not needed here but
-- useful if you ever add user features later.


-- ── Editions ──────────────────────────────────────────────────────────────────
-- One row per daily newspaper edition.
-- The UNIQUE constraint on date ensures we never generate two editions
-- for the same day even if the scheduler fires twice accidentally.

CREATE TABLE IF NOT EXISTS editions (
  id          SERIAL      PRIMARY KEY,
  date        DATE        UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by date (used by every API route)
CREATE INDEX IF NOT EXISTS idx_editions_date
  ON editions (date DESC);


-- ── Articles ──────────────────────────────────────────────────────────────────
-- One row per article, always linked to a parent edition.
-- ON DELETE CASCADE means deleting an edition automatically deletes
-- all its articles — essential for the FIFO cleanup job.

CREATE TABLE IF NOT EXISTS articles (
  id            SERIAL      PRIMARY KEY,
  edition_id    INTEGER     NOT NULL
                            REFERENCES editions (id)
                            ON DELETE CASCADE,

  -- Editorial fields
  category      TEXT        NOT NULL
                            CHECK (category IN (
                              'ai_genai',
                              'dev_tools',
                              'ml_research',
                              'market'
                            )),
  title         TEXT        NOT NULL,
  summary       TEXT        NOT NULL,
  is_lead       BOOLEAN     DEFAULT FALSE,

  -- Source attribution (always required)
  source_name   TEXT        NOT NULL,
  source_author TEXT,                    -- null if author not available
  source_url    TEXT        NOT NULL,

  -- Image (from Pexels)
  image_url     TEXT,                    -- null if no image found
  image_credit  TEXT,                    -- e.g. "Photo by X on Pexels"

  -- Keywords for image search and frontend display
  -- Stored as a native Postgres text array e.g. '{LLM, inference, OpenAI}'
  keywords      TEXT[]      DEFAULT '{}',

  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookups by edition (main query for every page load)
CREATE INDEX IF NOT EXISTS idx_articles_edition_id
  ON articles (edition_id);

-- Fast lookups by category (used for section filtering)
CREATE INDEX IF NOT EXISTS idx_articles_category
  ON articles (category);

-- Fast lookup for the lead story per edition
CREATE INDEX IF NOT EXISTS idx_articles_is_lead
  ON articles (is_lead)
  WHERE is_lead = TRUE;


-- ──────────────────────────────────────────────────────────────────────────────
-- Verification query — run this after migration to confirm tables exist:
--
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public';
--
-- Expected output:
--   editions
--   articles
-- ──────────────────────────────────────────────────────────────────────────────
