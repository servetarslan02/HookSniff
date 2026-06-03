const fs = require('fs');
const { Client } = require('pg');
const sql = fs.readFileSync('migrations/106_fix_admin_table_names.sql', 'utf8');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
client.connect().then(async () => {
  try {
    await client.query(sql);
    console.log('Migration 106 applied!');
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name IN ('payment_transactions','communication_history') ORDER BY table_name");
    console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));
  } catch(e) { console.log('Error:', e.message); }
  finally { await client.end(); }
});
