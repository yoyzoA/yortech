require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client  = new Anthropic.Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Paste your batch ID here
const BATCH_ID = 'msgbatch_01NitPL4pT1DTh65gfN2uwtG';

client.beta.messages.batches.retrieve(BATCH_ID)
  .then(batch => {
    console.log('\nBatch status:', batch.processing_status);
    console.log('Counts:', JSON.stringify(batch.request_counts, null, 2));

    if (batch.processing_status === 'ended') {
      console.log('\n✅ Batch completed — run recoverBatch.js to save the results');
    } else {
      console.log('\n⏳ Still processing — wait a few more minutes and run this again');
    }
  })
  .catch(err => {
    console.error('Error:', err.message);
  });