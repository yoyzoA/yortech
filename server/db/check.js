require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT table_name, 
         (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_name = t.table_name 
          AND table_schema = 'public') AS column_count
  FROM information_schema.tables t
  WHERE table_schema = 'public'
  ORDER BY table_name
`)
.then(result => {
  console.log('\n✅ Neon database connection successful\n');
  console.log('Tables found:');
  result.rows.forEach(row => {
    console.log(`  - ${row.table_name} (${row.column_count} columns)`);
  });
  pool.end();
})
.catch(err => {
  console.error('\n❌ Connection failed:', err.message);
  console.error('Check your DATABASE_URL in server/.env');
  pool.end();
  process.exit(1);
});