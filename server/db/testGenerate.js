require('dotenv').config();
const { generateEdition } = require('../services/scheduler');

// Pass today's date or any date you want to test with
const date = new Date().toISOString().split('T')[0];

console.log(`\nTriggering manual generation for: ${date}\n`);

generateEdition(date)
  .then(result => {
    if (result.success) {
      console.log(`\n✅ Success — ${result.articleCount} articles saved for ${result.date}`);
    } else {
      console.log(`\n❌ Failed — ${result.error}`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Unexpected error:', err.message);
    process.exit(1);
  });