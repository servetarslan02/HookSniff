-- ════════════════════════════════════════════════════════
        -- HS-054: Missing Indexes
        -- ════════════════════════════════════════════════════════

        -- customers: plan-based queries (billing, analytics)
        CREATE INDEX IF NOT EXISTS idx_customers_plan ON customers(plan);

        -- customers: active user filtering
        CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active) WHERE is_active = true;

        -- customers: payment provider webhook lookups
        CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id
            ON customers(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_customers_polar_customer_id
            ON customers(polar_customer_id) WHERE polar_customer_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_customers_iyzico_customer_id
            ON customers(iyzico_customer_id) WHERE iyzico_customer_id IS NOT NULL;

        -- endpoints: active endpoint filtering
        CREATE INDEX IF NOT EXISTS idx_endpoints_is_active
            ON endpoints(customer_id, is_active) WHERE is_active = true;

        -- deliveries: endpoint + status for dashboard
        CREATE INDEX IF NOT EXISTS idx_deliveries_endpoint_status
            ON deliveries(endpoint_id, status);

        -- deliveries: status + created_at for worker retry queue
        CREATE INDEX IF NOT EXISTS idx_deliveries_status_created
            ON deliveries(status, created_at) WHERE status = 'pending';

        -- dead_letters: endpoint analysis
        CREATE INDEX IF NOT EXISTS idx_dead_letters_endpoint ON dead_letters(endpoint_id);
        CREATE INDEX IF NOT EXISTS idx_dead_letters_created ON dead_letters(created_at DESC);

        -- webhook_queue: endpoint monitoring
        CREATE INDEX IF NOT EXISTS idx_webhook_queue_endpoint ON webhook_queue(endpoint_id);

        -- api_keys: active key lookup
        CREATE INDEX IF NOT EXISTS idx_api_keys_active
            ON api_keys(customer_id, is_active) WHERE is_active = true;

        -- invoices: billing history
        CREATE INDEX IF NOT EXISTS idx_invoices_customer_created
            ON invoices(customer_id, created_at DESC);

        -- payment_transactions: time-based
        CREATE INDEX IF NOT EXISTS idx_payment_transactions_created
            ON payment_transactions(created_at DESC);

        -- notifications: unread + time composite
        CREATE INDEX IF NOT EXISTS idx_notifications_unread_created
            ON notifications(customer_id, created_at DESC) WHERE is_read = FALSE;

        -- ai_events: type + time
        CREATE INDEX IF NOT EXISTS idx_ai_events_type_created
            ON ai_events(event_type, created_at DESC);

        -- ai_actions: pending actions
        CREATE INDEX IF NOT EXISTS idx_ai_actions_pending
            ON ai_actions(status, created_at) WHERE status = 'pending';

        -- ai_agent_executions: time-based
        CREATE INDEX IF NOT EXISTS idx_ai_agent_executions_created
            ON ai_agent_executions(created_at DESC);

        -- team_members: permission check composite
        CREATE INDEX IF NOT EXISTS idx_team_members_team_customer
            ON team_members(team_id, customer_id);

        -- ════════════════════════════════════════════════════════
        -- HS-055: updated_at triggers
        -- ════════════════════════════════════════════════════════

        -- customers: has updated_at (migration 030) but no trigger
        DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
        CREATE TRIGGER trg_customers_updated_at
            BEFORE UPDATE ON customers FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- endpoints: add column + trigger
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        DROP TRIGGER IF EXISTS trg_endpoints_updated_at ON endpoints;
        CREATE TRIGGER trg_endpoints_updated_at
            BEFORE UPDATE ON endpoints FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- api_keys: add column + trigger
        ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        DROP TRIGGER IF EXISTS trg_api_keys_updated_at ON api_keys;
        CREATE TRIGGER trg_api_keys_updated_at
            BEFORE UPDATE ON api_keys FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- alert_rules: add column + trigger
        ALTER TABLE alert_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        DROP TRIGGER IF EXISTS trg_alert_rules_updated_at ON alert_rules;
        CREATE TRIGGER trg_alert_rules_updated_at
            BEFORE UPDATE ON alert_rules FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- notification_preferences: has column, no trigger
        DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON notification_preferences;
        CREATE TRIGGER trg_notification_preferences_updated_at
            BEFORE UPDATE ON notification_preferences FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- inbound_configs: add column + trigger
        ALTER TABLE inbound_configs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        DROP TRIGGER IF EXISTS trg_inbound_configs_updated_at ON inbound_configs;
        CREATE TRIGGER trg_inbound_configs_updated_at
            BEFORE UPDATE ON inbound_configs FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- fifo_queue: add column + trigger
        ALTER TABLE fifo_queue ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        DROP TRIGGER IF EXISTS trg_fifo_queue_updated_at ON fifo_queue;
        CREATE TRIGGER trg_fifo_queue_updated_at
            BEFORE UPDATE ON fifo_queue FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- transform_rules: add column + trigger
        ALTER TABLE transform_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        DROP TRIGGER IF EXISTS trg_transform_rules_updated_at ON transform_rules;
        CREATE TRIGGER trg_transform_rules_updated_at
            BEFORE UPDATE ON transform_rules FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- retry_policies: add column + trigger
        ALTER TABLE retry_policies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        DROP TRIGGER IF EXISTS trg_retry_policies_updated_at ON retry_policies;
        CREATE TRIGGER trg_retry_policies_updated_at
            BEFORE UPDATE ON retry_policies FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- ════════════════════════════════════════════════════════
        -- HS-056: UNIQUE constraints
        -- ════════════════════════════════════════════════════════

        -- api_keys: prevent duplicate key hashes
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_api_keys_hash') THEN
                ALTER TABLE api_keys ADD CONSTRAINT uq_api_keys_hash UNIQUE (api_key_hash);
            END IF;
        END $$;

        -- webhook_queue: one queue entry per delivery
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_webhook_queue_delivery') THEN
                ALTER TABLE webhook_queue ADD CONSTRAINT uq_webhook_queue_delivery UNIQUE (delivery_id);
            END IF;
        END $$;
