-- Feature flags integration: Add payload_hash for content-based deduplication
-- This allows the deduplication feature flag to work properly

-- Add payload_hash column to deliveries
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS payload_hash TEXT;

-- Index for fast dedup lookups (endpoint + customer + hash + time window)
CREATE INDEX IF NOT EXISTS idx_deliveries_dedup
    ON deliveries(endpoint_id, customer_id, payload_hash, created_at DESC);

-- Function to auto-compute payload_hash on insert (if not provided)
CREATE OR REPLACE FUNCTION compute_delivery_payload_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payload_hash IS NULL THEN
        NEW.payload_hash = encode(digest(NEW.payload::text, 'sha256'), 'hex');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-compute payload_hash
DROP TRIGGER IF EXISTS trg_delivery_payload_hash ON deliveries;
CREATE TRIGGER trg_delivery_payload_hash
    BEFORE INSERT ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION compute_delivery_payload_hash();
