const { Client } = require('pg');
const c = new Client({
  connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  await c.connect();
  
  // Find API key columns
  const cols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='api_keys'");
  console.log('api_keys columns:', cols.rows.map(r => r.column_name).join(', '));
  
  // Get a test key
  const keys = await c.query('SELECT * FROM api_keys LIMIT 3');
  if (keys.rows.length > 0) {
    console.log('Sample key columns:', Object.keys(keys.rows[0]).join(', '));
    keys.rows.forEach(row => {
      const prefix = row.key_prefix || row.prefix || row.name || 'unknown';
      console.log('KEY:', JSON.stringify({prefix, customer_id: row.customer_id, id: row.id}));
    });
  }
  
  // Get active endpoints
  const eps = await c.query('SELECT id, url, fifo_enabled FROM endpoints WHERE is_active=true LIMIT 5');
  console.log('\nActive endpoints:');
  eps.rows.forEach(row => console.log(`  ${row.id} | ${row.url} | fifo:${row.fifo_enabled}`));
  
  await c.end();
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
