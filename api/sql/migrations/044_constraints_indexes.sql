-- HS-026: FK on webhook_queue.delivery_id
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_webhook_queue_delivery') THEN
                ALTER TABLE webhook_queue
                    ADD CONSTRAINT fk_webhook_queue_delivery
                    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE;
            END IF;
        END $$;

        -- HS-025: CHECK constraints for status columns
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_deliveries_status') THEN
                ALTER TABLE deliveries ADD CONSTRAINT chk_deliveries_status CHECK (status IN ('pending', 'processing', 'delivered', 'failed'));
            END IF;
        END $$;
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_webhook_queue_status') THEN
                ALTER TABLE webhook_queue ADD CONSTRAINT chk_webhook_queue_status CHECK (status IN ('pending', 'processing', 'delivered', 'dead_letter'));
            END IF;
        END $$;
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_delivery_attempts_number') THEN
                ALTER TABLE delivery_attempts ADD CONSTRAINT chk_delivery_attempts_number CHECK (attempt_number > 0);
            END IF;
        END $$;
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_deliveries_attempt_count') THEN
                ALTER TABLE deliveries ADD CONSTRAINT chk_deliveries_attempt_count CHECK (attempt_count >= 0);
            END IF;
        END $$;
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_deliveries_max_attempts') THEN
                ALTER TABLE deliveries ADD CONSTRAINT chk_deliveries_max_attempts CHECK (max_attempts > 0);
            END IF;
        END $$;
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_webhook_queue_attempt_count') THEN
                ALTER TABLE webhook_queue ADD CONSTRAINT chk_webhook_queue_attempt_count CHECK (attempt_count >= 0);
            END IF;
        END $$;
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_webhook_queue_max_attempts') THEN
                ALTER TABLE webhook_queue ADD CONSTRAINT chk_webhook_queue_max_attempts CHECK (max_attempts > 0);
            END IF;
        END $$;
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_dead_letters_attempts') THEN
                ALTER TABLE dead_letters ADD CONSTRAINT chk_dead_letters_attempts CHECK (attempts > 0);
            END IF;
        END $$;

        -- HS-057: Delivery index for common query pattern
        CREATE INDEX IF NOT EXISTS idx_deliveries_customer_created
            ON deliveries(customer_id, created_at DESC);
