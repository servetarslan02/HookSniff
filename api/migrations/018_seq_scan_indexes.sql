-- Migration 018: Fix seq scan storms — add missing indexes
-- Date: 2026-05-15
-- Addresses: endpoints (72K seq vs 308 idx), customers (13K seq vs 1.2K idx),
--            notifications (9.9K seq vs 670 idx)

-- 1. customers.api_key_prefix — used in WHERE api_key_prefix = $1 (inbound.rs)
--    No existing index on this column.
CREATE INDEX IF NOT EXISTS idx_customers_api_key_prefix ON customers(api_key_prefix);

-- 2. endpoints.team_id — used in WHERE team_id = $1 (webhooks.rs, endpoints.rs)
--    No existing index on this column.
CREATE INDEX IF NOT EXISTS idx_endpoints_team_id ON endpoints(team_id);

-- 3. endpoints(customer_id, is_active) — composite for the most common endpoint query
--    Existing idx_endpoints_customer_id doesn't cover is_active filter.
CREATE INDEX IF NOT EXISTS idx_endpoints_customer_active ON endpoints(customer_id, is_active);

-- 4. deliveries(customer_id, created_at DESC) — for ordered listing
--    Existing idx_deliveries_customer_id doesn't cover ORDER BY.
--    idx_deliveries_customer_created exists but verify it covers this pattern.
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_created_desc ON deliveries(customer_id, created_at DESC);

-- 5. deliveries(customer_id, status, created_at DESC) — composite for filtered queries
--    Common pattern: WHERE customer_id = $1 AND status = $2 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_deliveries_cust_status_created ON deliveries(customer_id, status, created_at DESC);

-- 6. notifications(customer_id, is_read) — for count queries
--    Common pattern: WHERE customer_id = $1 AND is_read = FALSE
--    idx_notifications_unread partial index exists but only for is_read = FALSE.
--    This composite index covers both read/unread counts.
CREATE INDEX IF NOT EXISTS idx_notifications_customer_read ON notifications(customer_id, is_read);

-- 7. webhook_queue(status, next_retry_at) — already exists but verify
--    idx_webhook_queue_status covers this.

-- 8. invoices(status) — admin queries use WHERE status = 'paid' without customer_id
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- 9. invoices(status, paid_at) — admin queries filter by status + date range
CREATE INDEX IF NOT EXISTS idx_invoices_status_paid ON invoices(status, paid_at);
