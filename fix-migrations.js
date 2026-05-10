const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function fix() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected\n');

  const fixes = [
    // 009: Fix STRING → TEXT for payment columns
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe'`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_customer_id TEXT`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_customer_id TEXT`,
    `ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_subscription_id TEXT`,
    `CREATE INDEX IF NOT EXISTS idx_customers_payment_provider ON customers(payment_provider)`,
    `CREATE INDEX IF NOT EXISTS idx_customers_polar_id ON customers(polar_customer_id) WHERE polar_customer_id IS NOT NULL`,
    `CREATE INDEX IF NOT EXISTS idx_customers_iyzico_id ON customers(iyzico_customer_id) WHERE iyzico_customer_id IS NOT NULL`,

    // Payment transactions table
    `CREATE TABLE IF NOT EXISTS payment_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      provider_tx_id TEXT,
      amount_cents INT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending',
      plan TEXT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_payment_tx_customer ON payment_transactions(customer_id)`,
    `CREATE INDEX IF NOT EXISTS idx_payment_tx_provider ON payment_transactions(provider, provider_tx_id)`,

    // 010: Create webhook_queue table (was missing)
    `CREATE TABLE IF NOT EXISTS webhook_queue (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
      endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      payload JSONB NOT NULL,
      event_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempt_count INT NOT NULL DEFAULT 0,
      max_attempts INT NOT NULL DEFAULT 10,
      next_retry_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_webhook_queue_status ON webhook_queue(status)`,
    `CREATE INDEX IF NOT EXISTS idx_webhook_queue_next_retry ON webhook_queue(next_retry_at) WHERE status = 'pending'`,
    `CREATE INDEX IF NOT EXISTS idx_webhook_queue_status_updated_at ON webhook_queue(status, updated_at)`,

    // Seen webhooks for dedup
    `CREATE TABLE IF NOT EXISTS seen_webhooks (
      idempotency_key TEXT PRIMARY KEY,
      delivery_id UUID NOT NULL,
      seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,

    // update_updated_at_column function
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql`,

    // Trigger for webhook_queue
    `DROP TRIGGER IF EXISTS trg_webhook_queue_updated_at ON webhook_queue`,
    `CREATE TRIGGER trg_webhook_queue_updated_at
      BEFORE UPDATE ON webhook_queue
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()`,

    // 026: Create delivery_attempts table (was missing)
    `CREATE TABLE IF NOT EXISTS delivery_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
      attempt_number INT NOT NULL,
      status TEXT NOT NULL,
      response_status INT,
      response_body TEXT,
      response_headers JSONB,
      error_message TEXT,
      duration_ms INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_delivery_attempts_delivery ON delivery_attempts(delivery_id)`,

    // 027: Add updated_at and error_message to deliveries
    `ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
    `ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS error_message TEXT`,
    `DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON deliveries`,
    `CREATE TRIGGER trg_deliveries_updated_at
      BEFORE UPDATE ON deliveries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()`,

    // Alert rules table (referenced by alerts.rs)
    `CREATE TABLE IF NOT EXISTS alert_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      condition TEXT NOT NULL,
      threshold NUMERIC NOT NULL,
      window_minutes INT NOT NULL DEFAULT 5,
      channel TEXT NOT NULL DEFAULT 'email',
      enabled BOOLEAN NOT NULL DEFAULT true,
      last_triggered_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_alert_rules_customer ON alert_rules(customer_id)`,

    // Endpoint health table
    `CREATE TABLE IF NOT EXISTS endpoint_health (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'unknown',
      success_rate NUMERIC,
      avg_latency_ms INT,
      last_checked_at TIMESTAMPTZ,
      consecutive_failures INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_endpoint_health_endpoint ON endpoint_health(endpoint_id)`,
  ];

  for (let i = 0; i < fixes.length; i++) {
    const sql = fixes[i];
    const short = sql.replace(/\s+/g, ' ').substring(0, 80);
    try {
      await client.query(sql);
      console.log(`✅ [${i+1}/${fixes.length}] ${short}...`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`⚠️ [${i+1}/${fixes.length}] Already exists: ${short}...`);
      } else {
        console.log(`❌ [${i+1}/${fixes.length}] ${err.message} → ${short}...`);
      }
    }
  }

  // Verify
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  console.log('\n📋 Tables:', tables.rows.map(r => r.tablename).join(', '));

  await client.end();
  console.log('\n✅ Done!');
}

fix().catch(e => console.error('Fatal:', e.message));
