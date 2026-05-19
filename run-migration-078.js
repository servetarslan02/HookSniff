const { Client } = require('pg');

const SQL = `
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    condition TEXT NOT NULL,
    actual_value DOUBLE PRECISION NOT NULL,
    threshold INT NOT NULL,
    channels_sent JSONB NOT NULL DEFAULT '[]',
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_history_rule ON alert_history(alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_customer ON alert_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered ON alert_history(triggered_at DESC);

ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS webhook_url TEXT;
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS cooldown_minutes INT NOT NULL DEFAULT 15;
`;

async function migrate() {
  const url = process.argv[2];
  if (!url) { console.error('Usage: node run-migration-078.js <DATABASE_URL>'); process.exit(1); }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('✅ Connected to Neon DB');
    await client.query(SQL);
    console.log('✅ Migration 078 applied');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}
migrate();
