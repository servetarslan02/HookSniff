const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

(async () => {
  await client.connect();
  
  // Check current constraints
  const constraints = await client.query(
    "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'sso_configs' AND indexname LIKE '%customer%'"
  );
  console.log('Current customer indexes:', JSON.stringify(constraints.rows));
  
  // Create partial unique index
  const r = await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS uq_sso_configs_customer_no_team ON sso_configs (customer_id) WHERE team_id IS NULL`
  );
  console.log('Index created:', r.command);
  
  // Verify
  const verify = await client.query(
    "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'sso_configs' AND indexname LIKE '%customer%'"
  );
  console.log('After:', JSON.stringify(verify.rows));
  
  await client.end();
  console.log('Done');
})().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
