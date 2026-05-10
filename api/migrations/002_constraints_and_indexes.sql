-- Migration 002: Add missing FK constraints and CHECK constraints
-- Addresses: HS-025 (CHECK constraints), HS-026 (webhook_queue FK)

-- ──────────────────────────────────────────────────────────────
-- HS-026: Add FK to webhook_queue.delivery_id
-- ──────────────────────────────────────────────────────────────
-- Note: webhook_queue records are created AFTER deliveries, so FK is safe.
-- ON DELETE CASCADE ensures cleanup when delivery is deleted.
ALTER TABLE webhook_queue
    ADD CONSTRAINT IF NOT EXISTS fk_webhook_queue_delivery
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────────────────
-- HS-025: CHECK constraints for status columns
-- ──────────────────────────────────────────────────────────────

-- deliveries.status: must be one of the valid states
ALTER TABLE deliveries
    ADD CONSTRAINT IF NOT EXISTS chk_deliveries_status
    CHECK (status IN ('pending', 'processing', 'delivered', 'failed'));

-- webhook_queue.status: must be one of the valid states
ALTER TABLE webhook_queue
    ADD CONSTRAINT IF NOT EXISTS chk_webhook_queue_status
    CHECK (status IN ('pending', 'processing', 'delivered', 'dead_letter'));

-- delivery_attempts: attempt_number must be positive
ALTER TABLE delivery_attempts
    ADD CONSTRAINT IF NOT EXISTS chk_delivery_attempts_number
    CHECK (attempt_number > 0);

-- deliveries: attempt_count must be non-negative
ALTER TABLE deliveries
    ADD CONSTRAINT IF NOT EXISTS chk_deliveries_attempt_count
    CHECK (attempt_count >= 0);

-- deliveries: max_attempts must be positive
ALTER TABLE deliveries
    ADD CONSTRAINT IF NOT EXISTS chk_deliveries_max_attempts
    CHECK (max_attempts > 0);

-- webhook_queue: attempt_count must be non-negative
ALTER TABLE webhook_queue
    ADD CONSTRAINT IF NOT EXISTS chk_webhook_queue_attempt_count
    CHECK (attempt_count >= 0);

-- webhook_queue: max_attempts must be positive
ALTER TABLE webhook_queue
    ADD CONSTRAINT IF NOT EXISTS chk_webhook_queue_max_attempts
    CHECK (max_attempts > 0);

-- dead_letters: attempts must be positive
ALTER TABLE dead_letters
    ADD CONSTRAINT IF NOT EXISTS chk_dead_letters_attempts
    CHECK (attempts > 0);

-- ──────────────────────────────────────────────────────────────
-- HS-057: Add missing delivery index for common query pattern
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_deliveries_customer_created
    ON deliveries(customer_id, created_at DESC);
