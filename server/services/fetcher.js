/**
 * fetcher.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Pulls raw articles from all four news sources with pre-filtering applied.
 * Claude never sees unfiltered content — this service is the first line
 * of relevance filtering, keeping token usage minimal.
 *
 * Each source returns a normalised article object:
 * {
 *   title:        string,
 *   summary:      string,   // first paragraph / description only
 *   source_name:  string,
 *   source_author: string | null,
 *   source_url:   string,
 *   category_hint: string   // loose hint for Claude, not enforced
 * }
 * ──────────────────────────────────────────────────────────────────────────────
 */

const axios  = require('axios');
const { XMLParser } = require('fast-xml-parser');

const sourcesConfig = require('../config/sources');

const xmlParser = new XMLParser({ ignoreAttributes: false });


// ── Utility ───────────────────────────────────────────────────────────────────

/**
 * Check if a string contains at least one keyword (case-insensitive).
 */
const containsKeyword = (text = '', keywords = []) => {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
};

/**
 * Deduplicate articles by URL across all sources.
 */
const deduplicateByUrl = (articles) => {
  const seen = new Set();
  return articles.filter(a => {
    if (seen.has(a.source_url)) return false;
    seen.add(a.source_url);
    return true;
  });
};

/**
 * Truncate a string to a maximum number of words.
 * Keeps the summary slim to reduce token usage.
 */
const truncateWords = (text = '', maxWords = 60) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + '...';
};


// ── HackerNews ────────────────────────────────────────────────────────────────

const fetchHackerNews = async () => {
  const cfg = sourcesConfig.hackernews;
  if (!cfg.enabled) return [];

  try {
    // Fetch the top story IDs
    const { data: storyIds } = await axios.get(
      `${cfg.endpoint}/topstories.json`,
      { timeout: 8000 }
    );

    const cutoffTime = Date.now() / 1000 - cfg.maxAgeHours * 3600;
    const articles   = [];

    // Fetch story details in parallel (first 60 candidates)
    const candidates = storyIds.slice(0, 60);
    const stories = await Promise.allSettled(
      candidates.map(id =>
        axios.get(`${cfg.endpoint}/item/${id}.json`, { timeout: 5000 })
          .then(r => r.data)
      )
    );

    for (const result of stories) {
      if (result.status !== 'fulfilled') continue;
      const story = result.value;

      // Skip if no URL (text-only Ask HN / Show HN without link)
      if (!story || !story.url) continue;

      // Score filter
      if ((story.score || 0) < cfg.scoreThreshold) continue;

      // Age filter
      if ((story.time || 0) < cutoffTime) continue;

      // Keyword filter — title must match at least one keyword
      if (!containsKeyword(story.title, cfg.keywords)) continue;

      articles.push({
        title:         story.title,
        summary:       truncateWords(story.title, 40), // HN has no body text
        source_name:   'Hacker News',
        source_author: story.by || null,
        source_url:    story.url,
        category_hint: 'dev_tools',
      });

      if (articles.length >= cfg.maxArticles) break;
    }

    console.log(`[Fetcher] HackerNews: ${articles.length} articles`);
    return articles;

  } catch (err) {
    console.error('[Fetcher] HackerNews failed:', err.message);
    return [];
  }
};


// ── arXiv ─────────────────────────────────────────────────────────────────────

const fetchArxiv = async () => {
  const cfg = sourcesConfig.arxiv;
  if (!cfg.enabled) return [];

  try {
    const categoryQuery = cfg.categories
      .map(c => `cat:${c}`)
      .join('+OR+');

    const { data: xml } = await axios.get(cfg.endpoint, {
      timeout: 10000,
      params: {
        search_query: categoryQuery,
        start:        0,
        max_results:  cfg.maxResults,
        sortBy:       cfg.sortBy,
        sortOrder:    cfg.sortOrder,
      },
    });

    const parsed  = xmlParser.parse(xml);
    const entries = parsed?.feed?.entry;

    if (!entries) return [];

    // arXiv returns a single object if there's only one result
    const entryArray = Array.isArray(entries) ? entries : [entries];

    const articles = entryArray.map(entry => {
      // Authors can be a single object or an array
      const authors = Array.isArray(entry.author)
        ? entry.author.map(a => a.name).join(', ')
        : entry.author?.name || null;

      // Strip newlines from abstract
      const abstract = (entry.summary || '')
        .replace(/\n/g, ' ')
        .trim();

      return {
        title:         (entry.title || '').replace(/\n/g, ' ').trim(),
        summary:       truncateWords(abstract, 60),
        source_name:   'arXiv',
        source_author: authors,
        source_url:    entry.id || '',
        category_hint: 'ml_research',
      };
    });

    console.log(`[Fetcher] arXiv: ${articles.length} papers`);
    return articles;

  } catch (err) {
    console.error('[Fetcher] arXiv failed:', err.message);
    return [];
  }
};


// ── NewsAPI ───────────────────────────────────────────────────────────────────

const fetchNewsAPI = async () => {
  const cfg = sourcesConfig.newsapi;
  if (!cfg.enabled) return [];

  if (!process.env.NEWSAPI_KEY) {
    console.warn('[Fetcher] NewsAPI key missing — skipping');
    return [];
  }

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const from = yesterday.toISOString().split('T')[0];

    const { data } = await axios.get(cfg.endpoint, {
      timeout: 10000,
      params: {
        q:        cfg.query.join(' OR '),
        language: cfg.language,
        sortBy:   cfg.sortBy,
        pageSize: cfg.maxArticles,
        from,
        apiKey:   process.env.NEWSAPI_KEY,
      },
    });

    const articles = (data.articles || [])
      .filter(a => {
        // Skip removed articles
        if (!a.url || a.title === '[Removed]') return false;
        // Skip blocked domains
        const domain = new URL(a.url).hostname.replace('www.', '');
        return !cfg.blockedDomains.includes(domain);
      })
      .map(a => ({
        title:         a.title || '',
        summary:       truncateWords(a.description || a.title, 60),
        source_name:   a.source?.name || 'NewsAPI',
        source_author: a.author       || null,
        source_url:    a.url,
        category_hint: 'ai_genai',
      }));

    console.log(`[Fetcher] NewsAPI: ${articles.length} articles`);
    return articles;

  } catch (err) {
    console.error('[Fetcher] NewsAPI failed:', err.message);
    return [];
  }
};


// ── DEV.to ────────────────────────────────────────────────────────────────────

const fetchDevTo = async () => {
  const cfg = sourcesConfig.devto;
  if (!cfg.enabled) return [];

  try {
    const allArticles = [];

    // Fetch each tag in parallel
    const tagResults = await Promise.allSettled(
      cfg.tags.map(tag =>
        axios.get(cfg.endpoint, {
          timeout: 8000,
          params: {
            tag,
            top:      1,       // top article of the day for this tag
            per_page: cfg.articlesPerTag,
          },
        }).then(r => r.data)
      )
    );

    for (const result of tagResults) {
      if (result.status !== 'fulfilled') continue;

      for (const article of result.value) {
        if (!article.url) continue;

        allArticles.push({
          title:         article.title || '',
          summary:       truncateWords(article.description || article.title, 60),
          source_name:   'DEV.to',
          source_author: article.user?.name || null,
          source_url:    article.url,
          category_hint: 'dev_tools',
        });
      }
    }

    console.log(`[Fetcher] DEV.to: ${allArticles.length} articles (pre-dedup)`);
    return allArticles;

  } catch (err) {
    console.error('[Fetcher] DEV.to failed:', err.message);
    return [];
  }
};


// ── Main fetch function ───────────────────────────────────────────────────────

/**
 * Fetch from all sources, deduplicate, and return a flat array of
 * normalised article objects ready for the curator.
 */
const fetchAllSources = async () => {
  console.log('[Fetcher] Starting fetch from all sources...');

  // Run all fetchers in parallel — a failure in one never blocks the others
  const [hn, arxiv, newsapi, devto] = await Promise.all([
    fetchHackerNews(),
    fetchArxiv(),
    fetchNewsAPI(),
    fetchDevTo(),
  ]);

  const combined   = [...hn, ...arxiv, ...newsapi, ...devto];
  const deduplicated = deduplicateByUrl(combined);

  console.log(
    `[Fetcher] Total: ${combined.length} raw → ${deduplicated.length} after dedup`
  );

  return deduplicated;
};


module.exports = { fetchAllSources };
