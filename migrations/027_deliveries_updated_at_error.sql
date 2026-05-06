-- Migration 027: Add updated_at and error_message to deliveries table
-- Dashboard expects these fields for delivery details view

-- Add updated_at with auto-update trigger
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON deliveries;
CREATE TRIGGER trg_deliveries_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add error_message for failed deliveries
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS error_message TEXT;
