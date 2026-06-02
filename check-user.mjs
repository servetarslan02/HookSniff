import pg from 'pg';
const c = new pg.Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
await c.connect();
const tables = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

// Find customer/user table
for (const t of tables.rows) {
  const name = t.table_name;
  if (name.includes('customer') || name.includes('user') || name.includes('account')) {
    const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='${name}' ORDER BY ordinal_position`);
    console.log(`\n${name} columns:`, cols.rows.map(r => r.column_name).join(', '));
    const rows = await c.query(`SELECT * FROM "${name}" LIMIT 2`);
    rows.rows.forEach(r => console.log(' ', JSON.stringify(r).substring(0, 200)));
  }
}
await c.end();
