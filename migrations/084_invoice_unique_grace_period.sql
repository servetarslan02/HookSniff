-- 084: Invoice unique constraint and payment failure grace period

-- Prevent duplicate invoices for the same provider invoice
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_provider_invoice_id 
ON invoices(customer_id, provider_invoice_id) 
WHERE provider_invoice_id IS NOT NULL;

-- Add grace period tracking for payment failures
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_grace_until TIMESTAMPTZ;

-- Index for finding customers in grace period
CREATE INDEX IF NOT EXISTS idx_customers_payment_grace ON customers(payment_grace_until) WHERE payment_grace_until IS NOT NULL;
