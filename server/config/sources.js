/**
 * sources.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Configuration for every news source the fetcher pulls from.
 * To add a new source or tune filtering behaviour, edit this file only —
 * no changes needed in the fetcher service itself.
 * ──────────────────────────────────────────────────────────────────────────────
 */

module.exports = {

  hackernews: {
    enabled:         true,
    endpoint:        'https://hacker-news.firebaseio.com/v0',
    scoreThreshold:  100,      // minimum HN score to qualify
    maxArticles:     10,       // max articles to take after filtering
    maxAgeHours:     24,       // only articles published within this window

    // Article title must contain at least one of these (case-insensitive)
    // to pass the keyword filter. Add/remove freely.
    keywords: [
      'AI', 'ML', 'LLM', 'GPT', 'Claude', 'Gemini', 'Llama', 'Mistral',
      'model', 'neural', 'deep learning', 'machine learning', 'inference',
      'fine-tuning', 'RAG', 'agent', 'benchmark', 'dataset',
      'open source', 'framework', 'library', 'SDK', 'API', 'release',
      'Python', 'TypeScript', 'Rust', 'Go', 'Node',
      'AWS', 'cloud', 'Docker', 'Kubernetes', 'DevOps',
      'startup', 'funding', 'research', 'paper', 'tool',
      'NVIDIA', 'GPU', 'chip', 'semiconductor',
    ],
  },

  arxiv: {
    enabled:     true,
    endpoint:    'https://export.arxiv.org/api/query',
    maxResults:  8,
    sortBy:      'submittedDate',
    sortOrder:   'descending',

    // Only pull papers from these arXiv categories.
    // Full list: arxiv.org/help/api/user-manual#subject_classifications
    categories: [
      'cs.AI',    // Artificial Intelligence
      'cs.LG',    // Machine Learning
      'cs.CV',    // Computer Vision
      'cs.CL',    // Computation & Language (NLP)
      'cs.SE',    // Software Engineering
      'stat.ML',  // Statistics / Machine Learning
    ],
  },

  newsapi: {
    enabled:     true,
    endpoint:    'https://newsapi.org/v2/everything',
    maxArticles: 15,
    language:    'en',
    sortBy:      'relevancy',   // newsapi built-in relevance ranking

    // Terms joined as OR query — newsapi handles the search
    query: [
      'artificial intelligence', 'machine learning', 'large language model',
      'neural network', 'deep learning', 'AI model', 'generative AI',
      'developer tools', 'open source release', 'tech funding',
      'GPU', 'semiconductor', 'AI startup', 'AI research',
    ],

    // Domains to exclude from results (tabloids, low-quality sources)
    blockedDomains: [
      'tmz.com',
      'buzzfeed.com',
      'dailymail.co.uk',
      'thesun.co.uk',
      'nypost.com',
    ],
  },

  devto: {
    enabled:        true,
    endpoint:       'https://dev.to/api/articles',
    articlesPerTag: 5,          // how many articles to fetch per tag

    // DEV.to tag list — each tag is fetched separately then deduplicated
    tags: [
      'ai',
      'machinelearning',
      'opensource',
      'devtools',
      'typescript',
      'rust',
      'cloud',
    ],
  },

};