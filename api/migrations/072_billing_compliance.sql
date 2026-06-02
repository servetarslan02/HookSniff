-- Billing Compliance: Invoice idempotency + Overage consent tracking

-- 1. Add UNIQUE constraint on provider_invoice_id to prevent duplicate invoices
-- This prevents the same payment from creating 2 invoices (Polar retry, network issues)
ALTER TABLE invoices ADD CONSTRAINT IF NOT EXISTS invoices_provider_invoice_id_unique UNIQUE (provider_invoice_id);

-- 2. Add overage consent tracking (Transparency Compliance)
-- Records when customer accepted overage charges (legal requirement for metered billing)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS overage_terms_accepted_at TIMESTAMPTZ;

-- 3. Add index for faster idempotency lookups
CREATE INDEX IF NOT EXISTS idx_invoices_provider_invoice_id ON invoices(provider_invoice_id) WHERE provider_invoice_id IS NOT NULL;
