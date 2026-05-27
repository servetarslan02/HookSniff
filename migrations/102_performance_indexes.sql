-- Performance indexes for common admin and analytics queries
-- These indexes speed up COUNT(*) and time-range queries used by:
--   - /admin/stats (system_stats)
--   - /admin/revenue (revenue_by_month)
--   - /v1/stats (user stats)
--   - /admin/deliveries/failed
--   - /admin/audit-logs

-- Deliveries: composite index for time-range + status queries
-- Speeds up: COUNT(*) FILTER (WHERE created_at >= X), COUNT(*) FILTER (WHERE status = 'pending')
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at_status ON deliveries(created_at DESC, status);

-- Deliveries: customer + created_at for per-user time-range queries
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_created ON deliveries(customer_id, created_at DESC);

-- Invoices: status index for revenue calculations
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Invoices: status + paid_at for monthly revenue breakdowns
CREATE INDEX IF NOT EXISTS idx_invoices_status_paid_at ON invoices(status, paid_at DESC) WHERE status = 'paid';

-- Endpoints: is_active filter
CREATE INDEX IF NOT EXISTS idx_endpoints_active ON endpoints(is_active) WHERE is_active = TRUE;

-- Customers: created_at for signup trend queries
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Customers: is_active for churn queries
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active) WHERE is_active = FALSE;

-- Audit log: created_at for recent activity queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Rate limit violations: created_at for recent violations
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_created ON rate_limit_violations(created_at DESC);
