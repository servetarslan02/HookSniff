ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_webhook_queue_updated_at ON webhook_queue;
        CREATE TRIGGER trg_webhook_queue_updated_at
            BEFORE UPDATE ON webhook_queue
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
