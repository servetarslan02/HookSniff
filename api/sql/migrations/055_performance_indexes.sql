-- Migration 055: Additional performance indexes for slow query optimization
-- Addresses missing composite indexes for common query patterns

-- webhook_queue: health check query pattern (status + updated_at)
-- Used by: SELECT COUNT(*) FROM webhook_queue WHERE status = 'processing' AND updated_at < ...
CREATE INDEX IF NOT EXISTS idx_webhook_queue_status_updated
    ON webhook_queue(status, updated_at)
    WHERE status IN ('processing', 'pending');

-- deliveries: analytics query pattern (customer + status + created_at)
-- Used by: dashboard delivery stats with time range
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_status_created
    ON deliveries(customer_id, status, created_at DESC);

-- deliveries: failed deliveries lookup (for health page)
CREATE INDEX IF NOT EXISTS idx_deliveries_failed_created
    ON deliveries(created_at DESC)
    WHERE status = 'failed';

-- login_attempts: brute force detection (email + success + created_at)
-- Used by: security_monitor login tracking
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_success
    ON login_attempts(email, success, created_at DESC);

-- security_events: admin dashboard filtering (customer + severity + created_at)
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',
    customer_id UUID,
    email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_security_events_customer_severity
    ON security_events(customer_id, severity, created_at DESC)
    WHERE customer_id IS NOT NULL;

-- endpoints: active endpoints by customer (most common lookup)
CREATE INDEX IF NOT EXISTS idx_endpoints_customer_active
    ON endpoints(customer_id, is_active)
    WHERE is_active = true;

-- ANALYZE to update table statistics for query planner
ANALYZE webhook_queue;
ANALYZE deliveries;
ANALYZE login_attempts;
ANALYZE security_events;
ANALYZE endpoints;
