-- Security: Add unique constraint on ip_blocklist.ip_address for ON CONFLICT support
-- Also add index for fast blocked IP lookups
DO $$ BEGIN
  ALTER TABLE ip_blocklist ADD CONSTRAINT uq_ip_blocklist_ip UNIQUE (ip_address);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_ip_blocklist_active ON ip_blocklist(ip_address, is_active) WHERE is_active = true;

-- Security: Add index on security_events for faster stats queries
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved, created_at DESC);
