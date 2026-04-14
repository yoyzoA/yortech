require('dotenv').config();
const Anthropic  = require('@anthropic-ai/sdk');
const curatorConfig = require('../config/curator');
const { enrichArticlesWithImages } = require('../services/imageService');
const { saveEdition } = require('../db/database');

const client   = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const BATCH_ID = 'msgbatch_01NitPL4pT1DTh65gfN2uwtG';
const DATE     = '2026-04-14';

const run = async () => {
  console.log('\nRetrieving batch results for', BATCH_ID);

  const batch = await client.beta.messages.batches.retrieve(BATCH_ID);
  console.log('Status:', batch.processing_status);

  if (batch.processing_status !== 'ended') {
    console.log('⏳ Not ready yet — try again in a few minutes');
    process.exit(0);
  }

  // Extract results
  const results = await client.beta.messages.batches.results(BATCH_ID);
  let rawContent = null;

  for await (const result of results) {
    if (result.result.type === 'errored') {
      console.error('❌ Batch errored:', result.result.error);
      process.exit(1);
    }

    rawContent = result.result.message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');
    break;
  }

  if (!rawContent) {
    console.error('❌ No content in batch response');
    process.exit(1);
  }

  // Parse JSON
  const cleaned = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i,     '')
    .replace(/```\s*$/i,     '')
    .trim();

  const edition = JSON.parse(cleaned);
  console.log(`\n✅ Got ${edition.articles.length} articles from Claude`);
  console.log(`Lead story: "${edition.articles[edition.lead_story_index]?.title}"`);

  // Enrich with images
  console.log('\nFetching images...');
  const enriched = await enrichArticlesWithImages(edition.articles);

  // Save to database
  await saveEdition(DATE, enriched, edition.lead_story_index);
  console.log(`\n✅ Edition ${DATE} saved to database`);
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Recovery failed:', err.message);
  process.exit(1);
});