-- Migration 109: Security events auto-resolution support
-- Adds columns for Cortex-powered automatic event resolution

ALTER TABLE security_events
    ADD COLUMN IF NOT EXISTS auto_resolved BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS auto_resolve_reason TEXT;

-- Index for auto-resolve queries (find unresolved events efficiently)
CREATE INDEX IF NOT EXISTS idx_security_events_auto_resolve
    ON security_events (resolved, auto_resolved, severity, created_at)
    WHERE resolved = false;

-- Index for IP-based grouping
CREATE INDEX IF NOT EXISTS idx_security_events_ip_type
    ON security_events (ip_address, event_type, created_at DESC)
    WHERE resolved = false;
