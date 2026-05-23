const { Pool } = require('pg');
const p = new Pool({
  connectionString: 'postgres://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

(async () => {
  // List all tables
  const tables = await p.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('=== NEON TABLOLARI ===');
  tables.rows.forEach((t, i) => console.log(`${i+1}. ${t.table_name}`));
  console.log(`\nToplam: ${tables.rows.length} tablo\n`);

  // Count rows in each table
  console.log('=== VERI SAYILARI ===');
  for (const t of tables.rows) {
    try {
      const r = await p.query(`SELECT COUNT(*) as cnt FROM "${t.table_name}"`);
      const cnt = r.rows[0].cnt;
      const status = cnt > 0 ? '✅' : '⬜';
      console.log(`${status} ${t.table_name}: ${cnt}`);
    } catch (e) {
      console.log(`❌ ${t.table_name}: ${e.message.substring(0, 50)}`);
    }
  }

  await p.end();
})().catch(e => { console.error(e); process.exit(1); });
