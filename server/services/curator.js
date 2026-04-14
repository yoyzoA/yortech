/**
 * curator.js  (service)
 * ──────────────────────────────────────────────────────────────────────────────
 * Sends pre-filtered articles to Claude Haiku via the Batch API.
 * Returns a structured edition object ready for the database.
 *
 * Uses the Batch API for a 50% cost saving — since the newspaper is
 * generated once per day on a fixed schedule, there is no real-time
 * requirement on this call.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const Anthropic = require('@anthropic-ai/sdk');
const curatorConfig  = require('../config/curator');
const categoriesConfig = require('../config/categories');

const client = new Anthropic.Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});


// ── Build the user prompt ─────────────────────────────────────────────────────

/**
 * Constructs the user-facing part of the Claude prompt.
 * Injects the raw articles and instructs Claude on what to return.
 */
const buildUserPrompt = (articles, date) => {
  const categoryList = Object.entries(categoriesConfig)
    .map(([key, val]) => `  - ${key}: ${val.label} (max ${val.maxArticlesPerEdition} articles)`)
    .join('\n');

  const articleList = articles
    .map((a, i) => `[${i}] ${a.title}
     Source: ${a.source_name}${a.source_author ? ' by ' + a.source_author : ''}
     URL: ${a.source_url}
     Hint: ${a.category_hint}
     Summary: ${a.summary}`)
    .join('\n\n');

  return `Today's date: ${date}

You have received ${articles.length} pre-filtered tech and science articles.
Your task is to curate the best ${curatorConfig.edition.minArticles}–${curatorConfig.edition.maxArticles} articles for today's YorTech edition.

CATEGORIES (assign each article to exactly one):
${categoryList}

INSTRUCTIONS:
1. Select the ${curatorConfig.edition.minArticles}–${curatorConfig.edition.maxArticles} most relevant and significant articles for a computer engineering student audience.
2. Discard duplicates, press releases, and low-quality content.
3. Rewrite each title to be clear and engaging — no clickbait, no sensationalism.
4. Write a 3–5 sentence summary in your professor voice for each article.
5. Assign each article to exactly one category.
6. Generate 2–3 short keywords per article (for image search — keep them visual and concrete).
7. Choose one article as the lead story — the single most significant story of the day across all categories.
8. lead_story_index must be the position of the lead article in your returned articles array (0-indexed).
9. If any article seems incomplete or lacks context, you may enrich it — note this in the summary.
10. Preserve source_name, source_author, and source_url EXACTLY as given — never modify URLs.

ARTICLES:
${articleList}

Return ONLY valid JSON matching this exact schema — no markdown, no preamble, no explanation:
${curatorConfig.outputSchema}`;
};


// ── Curate with Batch API ─────────────────────────────────────────────────────

/**
 * Submits a batch request to Claude and polls until complete.
 * The Batch API typically resolves within 1–3 minutes.
 *
 * @param {Array}  articles - pre-filtered articles from the fetcher
 * @param {string} date     - 'YYYY-MM-DD'
 * @returns {Object} parsed edition object
 */
const curateEdition = async (articles, date) => {
  console.log(`[Curator] Submitting batch request for ${date} with ${articles.length} articles...`);

  const userPrompt = buildUserPrompt(articles, date);

  // ── Submit the batch ──────────────────────────────────────────────────────
  const batch = await client.beta.messages.batches.create({
    requests: [{
      custom_id: `yortech-${date}`,
      params: {
        model:      curatorConfig.model,
        max_tokens: curatorConfig.maxOutputTokens,
        system:     curatorConfig.systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        // Enable web search for enriching incomplete stories
        ...(curatorConfig.webSearch.enabled && {
          tools: [{
            type: 'web_search_20250305',
            name: 'web_search',
          }],
        }),
      },
    }],
  });

  console.log(`[Curator] Batch submitted — ID: ${batch.id}`);

  // ── Poll until complete ───────────────────────────────────────────────────
  // Batches typically complete in 1–5 minutes.
  // We poll every 30 seconds with a 15-minute timeout.
  const MAX_WAIT_MS   = 60 * 60 * 1000;  // 15 minutes
  const POLL_INTERVAL = 30 * 1000;        // 30 seconds
  const startTime     = Date.now();

  let completedBatch = null;

  while (Date.now() - startTime < MAX_WAIT_MS) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));

    const status = await client.beta.messages.batches.retrieve(batch.id);
    console.log(`[Curator] Batch status: ${status.processing_status} — ${JSON.stringify(status.request_counts)}`);

    if (status.processing_status === 'ended') {
      completedBatch = status;
      break;
    }
  }

  if (!completedBatch) {
    throw new Error(`[Curator] Batch ${batch.id} timed out after 15 minutes`);
  }

  // ── Extract results ───────────────────────────────────────────────────────
  const results = await client.beta.messages.batches.results(completedBatch.id);

  let rawContent = null;

  for await (const result of results) {
    if (result.custom_id !== `yortech-${date}`) continue;

    if (result.result.type === 'errored') {
      throw new Error(`[Curator] Batch request failed: ${JSON.stringify(result.result.error)}`);
    }

    // Extract text blocks only (ignore tool_use blocks from web search)
    const textBlocks = result.result.message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    rawContent = textBlocks;
    break;
  }

  if (!rawContent) {
    throw new Error('[Curator] No text content in batch response');
  }

  // ── Parse JSON response ───────────────────────────────────────────────────
  // Strip any accidental markdown fences Claude might add
  const cleaned = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let edition;
  try {
    edition = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error('[Curator] Failed to parse JSON response:', rawContent.slice(0, 500));
    throw new Error(`[Curator] JSON parse failed: ${parseErr.message}`);
  }

  // ── Validate response shape ───────────────────────────────────────────────
  if (!edition.articles || !Array.isArray(edition.articles)) {
    throw new Error('[Curator] Response missing articles array');
  }

  if (edition.articles.length < curatorConfig.edition.minArticles) {
    console.warn(`[Curator] Only ${edition.articles.length} articles returned — below minimum`);
  }

  console.log(
    `[Curator] Edition curated — ${edition.articles.length} articles, ` +
    `lead: "${edition.articles[edition.lead_story_index]?.title}"`
  );

  return edition;
};


module.exports = { curateEdition };
