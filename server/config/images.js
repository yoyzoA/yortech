/**
 * images.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Configuration for the Pexels image fetching service.
 * To swap image providers in the future, update provider and endpoint here.
 * ──────────────────────────────────────────────────────────────────────────────
 */

module.exports = {

  provider:    'pexels',
  endpoint:    'https://api.pexels.com/v1/search',

  // Number of candidate images to fetch — we always use the first result
  perPage:     3,

  // Image orientation — landscape fits article cards best
  orientation: 'landscape',

  // Pexels size filter: 'large' (original), 'medium', 'small'
  size:        'medium',

  // These words are appended to every Pexels search query.
  // e.g. searching "neural network" becomes "neural network technology"
  // Improves result relevance for abstract tech topics.
  appendKeywords: ['technology'],

  // Shown when Pexels returns no results for a given keyword set
  // Place a fallback image in client/public/fallback.jpg
  fallbackImageUrl: '/fallback.jpg',

  // Pexels attribution format — required by their API terms of service
  // {photographer} and {url} are replaced dynamically in the image service
  creditTemplate: 'Photo by {photographer} on Pexels',

};
