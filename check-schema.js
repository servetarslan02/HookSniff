const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const result = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'endpoint_hourly_stats'`);
  console.log('Columns:', result.rows.map(r => r.column_name).join(', '));
  await pool.end();
})();
