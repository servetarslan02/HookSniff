const { Client } = require('pg');
const c = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });

async function main() {
  await c.connect();

  // Check recent deliveries
  const deliveries = await c.query("SELECT id, status, attempt_count, error_message, updated_at FROM deliveries WHERE created_at > now() - interval '5 minutes' ORDER BY created_at DESC LIMIT 10");
  console.log('=== Son 5 dk teslimatlar ===');
  deliveries.rows.forEach(row => {
    console.log(`  ${row.id} | ${row.status} | attempts:${row.attempt_count} | err:${row.error_message || 'none'} | ${row.updated_at}`);
  });

  // Check queue
  const queue = await c.query("SELECT status, COUNT(*) as cnt FROM webhook_queue GROUP BY status");
  console.log('\n=== Queue Durumu ===');
  queue.rows.forEach(row => console.log(`  ${row.status}: ${row.cnt}`));

  // Check recent queue items
  const qItems = await c.query("SELECT delivery_id, status, attempt_count, next_retry_at FROM webhook_queue WHERE created_at > now() - interval '5 minutes' ORDER BY created_at DESC LIMIT 5");
  console.log('\n=== Son Queue Itemlar ===');
  qItems.rows.forEach(row => console.log(`  ${row.delivery_id} | ${row.status} | attempts:${row.attempt_count} | retry:${row.next_retry_at || 'none'}`));

  await c.end();
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
