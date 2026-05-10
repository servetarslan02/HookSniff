-- HS-021: Add provider_event_id for billing webhook idempotency
-- Prevents duplicate processing of Stripe/Polar/iyzico webhook events

-- Add provider_event_id column to payment_transactions
ALTER TABLE payment_transactions
    ADD COLUMN IF NOT EXISTS provider_event_id TEXT;

-- Unique index for idempotency check (per provider)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_event_id
    ON payment_transactions(provider, provider_event_id)
    WHERE provider_event_id IS NOT NULL;

-- Also add to webhook_queue for general webhook idempotency
ALTER TABLE webhook_queue
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_queue_idempotency
    ON webhook_queue(endpoint_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
