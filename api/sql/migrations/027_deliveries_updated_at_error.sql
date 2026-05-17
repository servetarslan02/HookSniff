ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS error_message TEXT;

        DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON deliveries;
        CREATE TRIGGER trg_deliveries_updated_at
            BEFORE UPDATE ON deliveries
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
