/**
 * categories.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Defines the four editorial sections of YorTech.
 * Claude uses the keywords here as hints when assigning articles to categories.
 * displayOrder controls the order sections appear on the frontend.
 * ──────────────────────────────────────────────────────────────────────────────
 */

module.exports = {

  ai_genai: {
    label:                'AI & GenAI',
    displayOrder:         1,
    maxArticlesPerEdition: 4,

    // Keywords Claude uses to identify this category
    keywords: [
      'GPT', 'Claude', 'Gemini', 'Llama', 'Mistral', 'Grok', 'Phi',
      'generative AI', 'GenAI', 'large language model', 'LLM',
      'agentic', 'agent', 'multimodal', 'foundation model',
      'fine-tuning', 'RLHF', 'alignment', 'prompt engineering',
      'AI regulation', 'AI policy', 'EU AI Act',
      'OpenAI', 'Anthropic', 'DeepMind', 'xAI', 'Cohere', 'Mistral AI',
      'text-to-image', 'diffusion model', 'ChatGPT',
    ],
  },

  dev_tools: {
    label:                'Dev Tools & Releases',
    displayOrder:         2,
    maxArticlesPerEdition: 4,

    keywords: [
      'VS Code', 'GitHub', 'Copilot', 'Cursor', 'Claude Code',
      'framework', 'library', 'SDK', 'CLI', 'plugin', 'extension',
      'Docker', 'Kubernetes', 'CI/CD', 'DevOps', 'pipeline',
      'open source release', 'npm', 'PyPI', 'crates.io',
      'Python', 'TypeScript', 'JavaScript', 'Rust', 'Go', 'Java',
      'AWS', 'GCP', 'Azure', 'Vercel', 'Cloudflare',
      'database', 'PostgreSQL', 'Redis', 'MongoDB',
      'REST', 'GraphQL', 'WebAssembly', 'edge computing',
    ],
  },

  ml_research: {
    label:                'ML & AI Research',
    displayOrder:         3,
    maxArticlesPerEdition: 3,

    keywords: [
      'arXiv', 'paper', 'research', 'study', 'benchmark', 'dataset',
      'transformer', 'attention mechanism', 'diffusion',
      'reinforcement learning', 'RL', 'reward model',
      'computer vision', 'NLP', 'natural language processing',
      'robotics', 'embodied AI', 'physical AI',
      'breakthrough', 'state-of-the-art', 'SOTA',
      'MIT', 'Stanford', 'CMU', 'Berkeley', 'Oxford', 'Cambridge',
      'DeepMind', 'Google Research', 'Meta AI', 'Microsoft Research',
      'protein folding', 'drug discovery', 'climate model',
    ],
  },

  market: {
    label:                'Market & Trends',
    displayOrder:         4,
    maxArticlesPerEdition: 3,

    keywords: [
      'funding', 'acquisition', 'IPO', 'valuation', 'investment',
      'Series A', 'Series B', 'Series C', 'venture capital', 'VC',
      'NVIDIA', 'Microsoft', 'Google', 'Meta', 'Apple', 'Amazon',
      'layoffs', 'hiring', 'job market', 'talent',
      'analyst', 'forecast', 'market cap', 'revenue',
      'tech stock', 'earnings', 'quarterly results',
      'partnership', 'merger', 'strategic',
      'AI infrastructure', 'data center', 'compute',
    ],
  },

};