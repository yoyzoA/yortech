/**
 * curator.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Configuration for the Claude Haiku API curation call.
 * Changing the model, token limits, or editorial voice? Edit here only.
 * ──────────────────────────────────────────────────────────────────────────────
 */

module.exports = {

  // ── Model ──────────────────────────────────────────────────────────────────
  model:           'claude-haiku-4-5-20251001',
  maxInputTokens:  5000,
  maxOutputTokens: 4096,

  // ── Edition settings ───────────────────────────────────────────────────────
  edition: {
    minArticles: 5,   // minimum articles Claude must select per edition
    maxArticles: 8,   // maximum articles Claude may select per edition
  },

  // ── Web search ─────────────────────────────────────────────────────────────
  // Allows Claude to search for additional context on incomplete stories
  webSearch: {
    enabled:              true,
    maxSearchesPerEdition: 3,   // cap to control latency and cost
  },

  // ── Editorial voice ────────────────────────────────────────────────────────
  // This is injected verbatim as the system prompt for every curation call.
  // Tune the tone here without touching the curator service.
  systemPrompt: `You are the editorial AI for YorTech, a daily tech and science
newspaper aimed at computer engineering students and young professionals.

Your writing voice is that of a friendly university professor: approachable,
technically precise, genuinely enthusiastic about the subject matter, and
occasionally using metaphors to illuminate complex or abstract concepts.
You are never condescending, never sensationalist, and always faithful to
the source material. Think of yourself as the professor who makes a difficult
topic feel inevitable once explained — the one whose class everyone looks
forward to.

When summarising research papers, translate academic language into clear
engineering intuition without losing technical accuracy. When covering
industry news, provide the "so what" — why does this matter to someone
building software or studying computer engineering today?

Always cite sources faithfully. Never invent facts. If a story seems
incomplete, note that you are enriching it with additional context.`,

  // ── Output schema ──────────────────────────────────────────────────────────
  // The exact JSON structure Claude must return.
  // Referenced in the curator service when building the user prompt.
  outputSchema: `{
  "edition_date": "YYYY-MM-DD",
  "lead_story_index": 0,
  "articles": [
    {
      "title": "Rewritten engaging headline",
      "summary": "3-5 sentence summary in professor voice",
      "category": "ai_genai | dev_tools | ml_research | market",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "source_name": "Original publication name",
      "source_author": "Author name or null",
      "source_url": "https://original-article-url.com"
    }
  ]
}`,

};
