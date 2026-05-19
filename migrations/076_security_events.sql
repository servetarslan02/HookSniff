-- Security event detection and logging
-- Tracks suspicious activity: brute force, anomalous behavior, credential stuffing, etc.

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,       -- see EVENT TYPES below
    severity VARCHAR(20) NOT NULL DEFAULT 'medium',  -- low, medium, high, critical
    customer_id UUID,                        -- affected user (NULL if unknown)
    email VARCHAR(255),                      -- email involved (for login attempts)
    ip_address VARCHAR(45),                  -- IPv4 or IPv6
    user_agent TEXT,                         -- browser/client info
    details JSONB,                           -- event-specific data
    resolved BOOLEAN NOT NULL DEFAULT false, -- admin marked as reviewed
    resolved_by UUID,                        -- admin who resolved
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_customer ON security_events(customer_id, created_at DESC) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_email ON security_events(email, created_at DESC) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_unresolved ON security_events(created_at DESC) WHERE resolved = false;

-- Rate limiting tracking for brute force detection
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),  -- 'wrong_password', 'account_disabled', 'account_not_found', 'rate_limited'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_failed ON login_attempts(email, created_at DESC) WHERE success = false;

-- Cleanup: auto-delete old login attempts (keep 30 days)
-- This is handled by the retention job
