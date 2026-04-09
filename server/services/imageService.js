/**
 * imageService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Fetches a relevant stock image from Pexels for each article.
 * Uses the article's Claude-generated keywords as the search query.
 *
 * Pexels API terms require attribution — the credit string is stored
 * alongside the image URL in the database and displayed in the frontend.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const axios       = require('axios');
const imagesConfig = require('../config/images');


/**
 * Fetch a single image for one article.
 * Returns { image_url, image_credit } or null if nothing found.
 *
 * @param {string[]} keywords - 2-3 keywords from the curator
 */
const fetchImageForArticle = async (keywords = []) => {
  if (!process.env.PEXELS_API_KEY) {
    console.warn('[Images] Pexels API key missing — skipping images');
    return null;
  }

  if (keywords.length === 0) return null;

  try {
    // Build search query: combine keywords + append words for better results
    const query = [
      ...keywords,
      ...imagesConfig.appendKeywords,
    ].join(' ');

    const { data } = await axios.get(imagesConfig.endpoint, {
      timeout: 8000,
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
      params: {
        query,
        per_page:    imagesConfig.perPage,
        orientation: imagesConfig.orientation,
        size:        imagesConfig.size,
      },
    });

    const photos = data?.photos || [];

    if (photos.length === 0) {
      return {
        image_url:    imagesConfig.fallbackImageUrl,
        image_credit: null,
      };
    }

    const photo  = photos[0];
    const imgUrl = photo.src?.large || photo.src?.medium || photo.src?.original;

    if (!imgUrl) return null;

    // Build attribution string as required by Pexels terms of service
    const credit = imagesConfig.creditTemplate
      .replace('{photographer}', photo.photographer || 'Unknown')
      .replace('{url}', photo.photographer_url     || 'https://pexels.com');

    return {
      image_url:    imgUrl,
      image_credit: credit,
    };

  } catch (err) {
    console.error(`[Images] Pexels fetch failed for "${keywords.join(', ')}":`, err.message);
    return {
      image_url:    imagesConfig.fallbackImageUrl,
      image_credit: null,
    };
  }
};


/**
 * Enrich all articles in an edition with images.
 * Fetches images in parallel with a small concurrency limit to avoid
 * hitting Pexels rate limits (200 requests/hour on free tier).
 *
 * @param {Array} articles - array of curated article objects
 * @returns {Array} articles with image_url and image_credit added
 */
const enrichArticlesWithImages = async (articles) => {
  console.log(`[Images] Fetching images for ${articles.length} articles...`);

  // Process in batches of 5 to stay within Pexels rate limits
  const BATCH_SIZE = 5;
  const enriched   = [];

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (article) => {
        const imageData = await fetchImageForArticle(article.keywords || []);
        return {
          ...article,
          image_url:    imageData?.image_url    || imagesConfig.fallbackImageUrl,
          image_credit: imageData?.image_credit || null,
        };
      })
    );

    enriched.push(...results);

    // Small delay between batches to be a good API citizen
    if (i + BATCH_SIZE < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  const withImages = enriched.filter(a => a.image_url !== imagesConfig.fallbackImageUrl).length;
  console.log(`[Images] Done — ${withImages}/${articles.length} articles have real images`);

  return enriched;
};


module.exports = { enrichArticlesWithImages };