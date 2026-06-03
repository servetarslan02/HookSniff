const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require' });
client.connect().then(async () => {
  const tables = ['payment_transactions', 'communication_history', 'payments', 'admin_communications'];
  for (const t of tables) {
    const r = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position", [t]);
    if (r.rows.length > 0) {
      console.log(t + ': ' + r.rows.map(r => r.column_name).join(', '));
    } else {
      console.log(t + ': NOT FOUND');
    }
  }
  await client.end();
});
