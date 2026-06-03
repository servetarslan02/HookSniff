const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require'
});

async function migrate() {
  await client.connect();
  console.log('Connected to database');

  const steps = [
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='overage_terms_accepted_at') THEN ALTER TABLE customers ADD COLUMN overage_terms_accepted_at TIMESTAMPTZ; END IF; END $$;",
    "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='invoices_provider_invoice_id_unique') THEN ALTER TABLE invoices ADD CONSTRAINT invoices_provider_invoice_id_unique UNIQUE (provider_invoice_id); END IF; END $$;",
    "CREATE INDEX IF NOT EXISTS idx_invoices_provider_invoice_id ON invoices(provider_invoice_id) WHERE provider_invoice_id IS NOT NULL;"
  ];

  for (const sql of steps) {
    try {
      const result = await client.query(sql);
      console.log('OK:', sql.substring(0, 60) + '...');
    } catch (err) {
      console.error('Error:', err.message, '| SQL:', sql.substring(0, 60));
    }
  }

  await client.end();
}

migrate().catch(console.error);
