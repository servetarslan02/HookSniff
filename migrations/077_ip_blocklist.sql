-- IP blocklist for blocking suspicious IPs at the middleware level

CREATE TABLE IF NOT EXISTS ip_blocklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    reason TEXT,
    blocked_by UUID REFERENCES customers(id),
    auto_blocked BOOLEAN NOT NULL DEFAULT false,  -- true if auto-blocked by security monitor
    event_id UUID REFERENCES security_events(id),  -- linked security event
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,                        -- NULL = permanent
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_blocklist_ip ON ip_blocklist(ip_address) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ip_blocklist_active ON ip_blocklist(is_active, created_at DESC);
