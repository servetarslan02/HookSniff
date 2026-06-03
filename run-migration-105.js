const fs = require('fs');
const { Client } = require('pg');
const sql = fs.readFileSync('migrations/105_admin_detail_tables.sql', 'utf8');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
client.connect().then(async () => {
  try {
    await client.query(sql);
    console.log('Migration 105 applied!');
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name IN ('customer_notes','customer_tags','admin_communications','payments') ORDER BY table_name");
    console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));
  } catch(e) { console.log('Error:', e.message); }
  finally { await client.end(); }
});
