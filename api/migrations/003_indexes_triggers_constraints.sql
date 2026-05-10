-- Migration 003: Database Indexes, Triggers & Constraints
-- Addresses: HS-054 (missing indexes), HS-055 (updated_at triggers), HS-056 (unique constraints)

-- ──────────────────────────────────────────────────────────────
-- HS-054: Missing Indexes (20+ critical query patterns)
-- ──────────────────────────────────────────────────────────────

-- customers: plan-based queries (billing dashboard, analytics)
CREATE INDEX IF NOT EXISTS idx_customers_plan ON customers(plan);

-- customers: active user filtering
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active) WHERE is_active = true;

-- customers: payment provider webhook lookups (Stripe, Polar, iyzico)
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id
    ON customers(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_polar_customer_id
    ON customers(polar_customer_id) WHERE polar_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_iyzico_customer_id
    ON customers(iyzico_customer_id) WHERE iyzico_customer_id IS NOT NULL;

-- endpoints: active endpoint filtering for health checks
CREATE INDEX IF NOT EXISTS idx_endpoints_is_active
    ON endpoints(customer_id, is_active) WHERE is_active = true;

-- deliveries: endpoint + status for dashboard filtering
CREATE INDEX IF NOT EXISTS idx_deliveries_endpoint_status
    ON deliveries(endpoint_id, status);

-- deliveries: status + created_at for worker retry queue ordering
CREATE INDEX IF NOT EXISTS idx_deliveries_status_created
    ON deliveries(status, created_at) WHERE status = 'pending';

-- deliveries: test mode filtering
CREATE INDEX IF NOT EXISTS idx_deliveries_is_test
    ON deliveries(is_test) WHERE is_test = true;

-- dead_letters: endpoint analysis
CREATE INDEX IF NOT EXISTS idx_dead_letters_endpoint
    ON dead_letters(endpoint_id);

-- dead_letters: time-based queries
CREATE INDEX IF NOT EXISTS idx_dead_letters_created
    ON dead_letters(created_at DESC);

-- webhook_queue: endpoint monitoring
CREATE INDEX IF NOT EXISTS idx_webhook_queue_endpoint
    ON webhook_queue(endpoint_id);

-- api_keys: active key lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_active
    ON api_keys(customer_id, is_active) WHERE is_active = true;

-- invoices: billing history with time ordering
CREATE INDEX IF NOT EXISTS idx_invoices_customer_created
    ON invoices(customer_id, created_at DESC);

-- payment_transactions: time-based queries
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created
    ON payment_transactions(created_at DESC);

-- notifications: combined index for unread + time (replaces separate idx_notifications_unread)
CREATE INDEX IF NOT EXISTS idx_notifications_unread_created
    ON notifications(customer_id, created_at DESC) WHERE is_read = FALSE;

-- ai_events: time-based queries (complements existing idx_ai_events_created)
CREATE INDEX IF NOT EXISTS idx_ai_events_type_created
    ON ai_events(event_type, created_at DESC);

-- ai_actions: pending actions query
CREATE INDEX IF NOT EXISTS idx_ai_actions_pending
    ON ai_actions(status, created_at) WHERE status = 'pending';

-- ai_agent_executions: time-based queries
CREATE INDEX IF NOT EXISTS idx_ai_agent_executions_created
    ON ai_agent_executions(created_at DESC);

-- team_members: composite lookup for permission checks
CREATE INDEX IF NOT EXISTS idx_team_members_team_customer
    ON team_members(team_id, customer_id);

-- notification_preferences: already has customer index, no additional needed

-- ──────────────────────────────────────────────────────────────
-- HS-055: updated_at triggers for tables missing them
-- ──────────────────────────────────────────────────────────────

-- customers: has updated_at column (migration 030) but no trigger
DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- endpoints: add updated_at column + trigger
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_endpoints_updated_at ON endpoints;
CREATE TRIGGER trg_endpoints_updated_at
    BEFORE UPDATE ON endpoints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- api_keys: add updated_at column + trigger
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_api_keys_updated_at ON api_keys;
CREATE TRIGGER trg_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- alert_rules: add updated_at column + trigger
ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_alert_rules_updated_at ON alert_rules;
CREATE TRIGGER trg_alert_rules_updated_at
    BEFORE UPDATE ON alert_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- notification_preferences: has updated_at column but no trigger
DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- inbound_configs: add updated_at column + trigger
ALTER TABLE inbound_configs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_inbound_configs_updated_at ON inbound_configs;
CREATE TRIGGER trg_inbound_configs_updated_at
    BEFORE UPDATE ON inbound_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- fifo_queue: add updated_at column + trigger
ALTER TABLE fifo_queue ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_fifo_queue_updated_at ON fifo_queue;
CREATE TRIGGER trg_fifo_queue_updated_at
    BEFORE UPDATE ON fifo_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- transform_rules: add updated_at column + trigger
ALTER TABLE transform_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_transform_rules_updated_at ON transform_rules;
CREATE TRIGGER trg_transform_rules_updated_at
    BEFORE UPDATE ON transform_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- retry_policies: add updated_at column + trigger
ALTER TABLE retry_policies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_retry_policies_updated_at ON retry_policies;
CREATE TRIGGER trg_retry_policies_updated_at
    BEFORE UPDATE ON retry_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- custom_domains: add updated_at column + trigger (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'custom_domains') THEN
        ALTER TABLE custom_domains ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        DROP TRIGGER IF EXISTS trg_custom_domains_updated_at ON custom_domains;
        CREATE TRIGGER trg_custom_domains_updated_at
            BEFORE UPDATE ON custom_domains
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- HS-056: UNIQUE constraints missing
-- ──────────────────────────────────────────────────────────────

-- api_keys: api_key_hash should be unique (prevents duplicate key registration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_api_keys_hash'
    ) THEN
        ALTER TABLE api_keys ADD CONSTRAINT uq_api_keys_hash UNIQUE (api_key_hash);
    END IF;
END $$;

-- webhook_queue: delivery_id should have unique constraint (one queue entry per delivery)
-- Note: FK already exists from migration 044, adding UNIQUE for data integrity
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_webhook_queue_delivery'
    ) THEN
        ALTER TABLE webhook_queue ADD CONSTRAINT uq_webhook_queue_delivery UNIQUE (delivery_id);
    END IF;
END $$;
