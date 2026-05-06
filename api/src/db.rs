use anyhow::Result;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let pool = PgPoolOptions::new()
        .max_connections(20)
        .connect(database_url)
        .await?;

    run_migrations(&pool).await?;
    Ok(pool)
}

/// Migration tracking table — records which migrations have been applied.
/// Each migration has a unique name and is only run once.
async fn ensure_migrations_table(pool: &PgPool) -> Result<()> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS _migrations (
            name TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )",
    )
    .execute(pool)
    .await?;
    Ok(())
}

/// Check if a migration has already been applied.
async fn is_migration_applied(pool: &PgPool, name: &str) -> Result<bool> {
    let row: Option<(String,)> =
        sqlx::query_as("SELECT name FROM _migrations WHERE name = $1")
            .bind(name)
            .fetch_optional(pool)
            .await?;
    Ok(row.is_some())
}

/// Record a migration as applied.
async fn record_migration(pool: &PgPool, name: &str) -> Result<()> {
    sqlx::query("INSERT INTO _migrations (name) VALUES ($1)")
        .bind(name)
        .execute(pool)
        .await?;
    Ok(())
}

/// Run a migration only if it hasn't been applied yet.
async fn run_migration(pool: &PgPool, name: &str, sql: &str) -> Result<()> {
    if is_migration_applied(pool, name).await? {
        tracing::debug!("⏭️  Migration '{}' already applied, skipping", name);
        return Ok(());
    }
    tracing::info!("🔄 Running migration: {}", name);
    sqlx::query(sql).execute(pool).await?;
    record_migration(pool, name).await?;
    tracing::info!("✅ Migration '{}' completed", name);
    Ok(())
}

async fn run_migrations(pool: &PgPool) -> Result<()> {
    // Step 1: Ensure migration tracking table exists
    ensure_migrations_table(pool).await?;

    // Step 2: Migration 001 — initial schema (base tables and indexes)
    run_migration(
        pool,
        "001_initial_schema",
        r#"
        CREATE TABLE IF NOT EXISTS customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL UNIQUE,
            api_key_hash TEXT NOT NULL,
            api_key_prefix TEXT NOT NULL,
            plan TEXT NOT NULL DEFAULT 'free',
            webhook_limit INT NOT NULL DEFAULT 1000,
            webhook_count INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS endpoints (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            description TEXT,
            is_active BOOL NOT NULL DEFAULT true,
            signing_secret TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS deliveries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            payload JSONB NOT NULL,
            event_type TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            attempt_count INT NOT NULL DEFAULT 0,
            max_attempts INT NOT NULL DEFAULT 3,
            last_attempt_at TIMESTAMPTZ,
            response_status INT,
            response_body TEXT,
            next_retry_at TIMESTAMPTZ,
            replay_count INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS delivery_attempts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
            attempt_number INT NOT NULL,
            status_code INT,
            response_body TEXT,
            duration_ms INT,
            error_message TEXT,
            trace_id VARCHAR(64),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_attempts_delivery ON delivery_attempts(delivery_id);

        CREATE TABLE IF NOT EXISTS dead_letters (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
            endpoint_id UUID NOT NULL REFERENCES endpoints(id),
            customer_id UUID NOT NULL REFERENCES customers(id),
            payload JSONB NOT NULL,
            reason TEXT,
            attempts INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS idempotency_keys (
            key TEXT PRIMARY KEY,
            customer_id UUID NOT NULL REFERENCES customers(id),
            response_body JSONB NOT NULL,
            status_code INT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            expires_at TIMESTAMPTZ NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
        CREATE INDEX IF NOT EXISTS idx_deliveries_customer ON deliveries(customer_id);
        CREATE INDEX IF NOT EXISTS idx_deliveries_next_retry ON deliveries(next_retry_at) WHERE status = 'pending';
        CREATE INDEX IF NOT EXISTS idx_endpoints_customer ON endpoints(customer_id);
        CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);
        "#,
    )
    .await?;

    // Step 3: Migration 002 — add password_hash to customers
    run_migration(
        pool,
        "002_add_password_hash",
        "ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT",
    )
    .await?;

    // Step 4: Migration 003 — add IP filtering and event filtering to endpoints
    run_migration(
        pool,
        "003_add_endpoint_security_columns",
        r#"
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS allowed_ips JSONB;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS event_filter TEXT[];
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS custom_headers JSONB;
        "#,
    )
    .await?;

    // Step 5: Migration 004 — add signing secret rotation support
    run_migration(
        pool,
        "004_add_secret_rotation",
        r#"
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS old_signing_secret TEXT;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS secret_rotated_at TIMESTAMPTZ;
        "#,
    )
    .await?;

    // Step 6: Migration 005 — add retry policy JSONB column to endpoints
    run_migration(
        pool,
        "005_add_retry_policy",
        "ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS retry_policy JSONB",
    )
    .await?;

    // Step 7: Migration 006 — smart routing columns
    run_migration(
        pool,
        "006_routing",
        r#"
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS routing_strategy TEXT NOT NULL DEFAULT 'round-robin';
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fallback_url TEXT;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS avg_response_ms INT NOT NULL DEFAULT 0;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS failure_streak INT NOT NULL DEFAULT 0;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS last_failure_at TIMESTAMPTZ;
        CREATE INDEX IF NOT EXISTS idx_endpoints_failure_streak ON endpoints(failure_streak) WHERE failure_streak > 0;
        "#,
    )
    .await?;

    // Step 8: Migration 007 — FIFO ordering
    run_migration(
        pool,
        "007_fifo_ordering",
        r#"
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_enabled BOOL DEFAULT false;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_sequence BIGINT DEFAULT 0;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_group_by_customer BOOL DEFAULT false;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fifo_max_wait_secs INT DEFAULT 300;
        ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS sequence_num BIGINT;
        ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS fifo_group_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_deliveries_fifo
            ON deliveries(endpoint_id, sequence_num)
            WHERE status = 'pending' AND sequence_num IS NOT NULL;
        "#,
    )
    .await?;

    // Step 9: Migration 008 — per-endpoint throttling
    run_migration(
        pool,
        "008_endpoint_throttling",
        r#"
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_rate INT;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_period_secs INT DEFAULT 60;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS throttle_strategy TEXT DEFAULT 'sliding_window';
        "#,
    )
    .await?;

    // Step 10: Migration 009 — webhook queue table (shared between API and worker)
    run_migration(
        pool,
        "009_webhook_queue",
        r#"
        CREATE TABLE IF NOT EXISTS webhook_queue (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            delivery_id UUID NOT NULL,
            endpoint_id UUID NOT NULL,
            endpoint_url TEXT NOT NULL,
            payload TEXT NOT NULL,
            custom_headers JSONB,
            attempt_count INT NOT NULL DEFAULT 0,
            max_attempts INT NOT NULL DEFAULT 3,
            next_retry_at TIMESTAMPTZ,
            status TEXT NOT NULL DEFAULT 'pending',
            trace_id VARCHAR(64),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            processed_at TIMESTAMPTZ
        );

        CREATE INDEX IF NOT EXISTS idx_webhook_queue_pending
            ON webhook_queue(status, next_retry_at)
            WHERE status = 'pending';

        CREATE INDEX IF NOT EXISTS idx_webhook_queue_delivery
            ON webhook_queue(delivery_id);

        CREATE INDEX IF NOT EXISTS idx_webhook_queue_trace_id
            ON webhook_queue(trace_id) WHERE trace_id IS NOT NULL;
        "#,
    )
    .await?;

    // Step 11: Migration 010 — add format column to endpoints
    run_migration(
        pool,
        "010_add_endpoint_format",
        "ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'standard'",
    )
    .await?;

    // Step 12: Migration 011 — seen_webhooks table for replay protection
    run_migration(
        pool,
        "011_seen_webhooks",
        r#"
        CREATE TABLE IF NOT EXISTS seen_webhooks (
            webhook_id TEXT PRIMARY KEY,
            seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            expires_at TIMESTAMPTZ NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_seen_webhooks_expires
            ON seen_webhooks (expires_at);
        "#,
    )
    .await?;

    // Step 13: Migration 012 — retry policies table
    run_migration(
        pool,
        "012_retry_policies",
        r#"
        CREATE TABLE IF NOT EXISTS retry_policies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL UNIQUE REFERENCES endpoints(id) ON DELETE CASCADE,
            max_attempts INT NOT NULL DEFAULT 5,
            base_delay_ms BIGINT NOT NULL DEFAULT 1000,
            max_delay_ms BIGINT NOT NULL DEFAULT 3600000,
            multiplier DOUBLE PRECISION NOT NULL DEFAULT 2.0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_retry_policies_endpoint
            ON retry_policies(endpoint_id);
        "#,
    )
    .await?;

    // Step 14: Migration 013 — transform rules table
    run_migration(
        pool,
        "013_transform_rules",
        r#"
        CREATE TABLE IF NOT EXISTS transform_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
            rule_json JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_transform_rules_endpoint
            ON transform_rules(endpoint_id);
        "#,
    )
    .await?;

    // Step 15: Migration 014 — event schemas table
    run_migration(
        pool,
        "014_event_schemas",
        r#"
        CREATE TABLE IF NOT EXISTS event_schemas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            version INT NOT NULL DEFAULT 1,
            schema JSONB NOT NULL,
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_event_schemas_customer
            ON event_schemas(customer_id, name);
        "#,
    )
    .await?;

    // Step 16: Migration 015 — api_keys table
    run_migration(
        pool,
        "015_api_keys",
        r#"
        CREATE TABLE IF NOT EXISTS api_keys (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            api_key_hash TEXT NOT NULL,
            api_key_prefix TEXT NOT NULL,
            name TEXT NOT NULL DEFAULT 'Default',
            is_active BOOL NOT NULL DEFAULT true,
            last_used_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_api_keys_customer
            ON api_keys(customer_id);
        CREATE INDEX IF NOT EXISTS idx_api_keys_hash
            ON api_keys(api_key_hash);
        "#,
    )
    .await?;

    // Step 17: Migration 016 — alert_rules table
    run_migration(
        pool,
        "016_alert_rules",
        r#"
        CREATE TABLE IF NOT EXISTS alert_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            condition TEXT NOT NULL,
            threshold INT NOT NULL DEFAULT 0,
            channels JSONB NOT NULL DEFAULT '[]',
            is_active BOOL NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_alert_rules_customer
            ON alert_rules(customer_id);
        "#,
    )
    .await?;

    // Step 18: Migration 017 — ai_center tables
    run_migration(
        pool,
        "017_ai_center",
        r#"
        CREATE TABLE IF NOT EXISTS ai_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type TEXT NOT NULL,
            severity TEXT NOT NULL DEFAULT 'info',
            title TEXT NOT NULL,
            description TEXT,
            action_taken TEXT,
            target_type TEXT,
            target_id UUID,
            resolved BOOL NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_ai_events_created
            ON ai_events(created_at DESC);

        CREATE TABLE IF NOT EXISTS risk_scores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            target_type TEXT NOT NULL,
            target_id UUID NOT NULL,
            score INT NOT NULL DEFAULT 0,
            factors JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_risk_scores_target
            ON risk_scores(target_id, created_at DESC);

        CREATE TABLE IF NOT EXISTS ai_actions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            action_type TEXT NOT NULL,
            description TEXT NOT NULL,
            target_type TEXT,
            target_id UUID,
            status TEXT NOT NULL DEFAULT 'pending',
            risk_level TEXT NOT NULL DEFAULT 'low',
            auto_approved BOOL NOT NULL DEFAULT false,
            executed_at TIMESTAMPTZ,
            rolled_back_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_ai_actions_status
            ON ai_actions(status);

        CREATE TABLE IF NOT EXISTS ai_blocklist (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            block_type TEXT NOT NULL,
            block_value TEXT NOT NULL,
            reason TEXT,
            expires_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_ai_blocklist_expires
            ON ai_blocklist(expires_at) WHERE expires_at IS NOT NULL;
        "#,
    )
    .await?;

    // Step 19: Migration 018 — ai agents tables
    run_migration(
        pool,
        "018_ai_agents",
        r#"
        CREATE TABLE IF NOT EXISTS ai_agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            enabled BOOL NOT NULL DEFAULT true,
            config JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS ai_agent_executions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
            delivery_id UUID,
            customer_id UUID,
            trigger_reason TEXT,
            actions_taken JSONB,
            confidence_score DOUBLE PRECISION,
            ai_provider TEXT,
            latency_ms INT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_ai_agent_executions_agent
            ON ai_agent_executions(agent_id);
        CREATE INDEX IF NOT EXISTS idx_ai_agent_executions_customer
            ON ai_agent_executions(customer_id);

        CREATE TABLE IF NOT EXISTS ai_agent_configs (
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
            enabled BOOL NOT NULL DEFAULT true,
            config JSONB,
            PRIMARY KEY (customer_id, agent_id)
        );
        "#,
    )
    .await?;

    // Step 20: Migration 019 — marketplace tables
    run_migration(
        pool,
        "019_marketplace",
        r#"
        CREATE TABLE IF NOT EXISTS marketplace_agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            author TEXT NOT NULL DEFAULT 'unknown',
            version TEXT NOT NULL DEFAULT '1.0.0',
            config JSONB NOT NULL DEFAULT '{}',
            downloads INT NOT NULL DEFAULT 0,
            rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS installed_agents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            agent_id UUID NOT NULL REFERENCES marketplace_agents(id) ON DELETE CASCADE,
            enabled BOOL NOT NULL DEFAULT true,
            config JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE(customer_id, agent_id)
        );
        CREATE INDEX IF NOT EXISTS idx_installed_agents_customer
            ON installed_agents(customer_id);
        "#,
    )
    .await?;

    // Step 21: Migration 020 — fifo_queue table
    run_migration(
        pool,
        "020_fifo_queue",
        r#"
        CREATE TABLE IF NOT EXISTS fifo_queue (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
            event_type TEXT NOT NULL,
            payload JSONB NOT NULL,
            sequence_num BIGINT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_fifo_queue_endpoint_seq
            ON fifo_queue(endpoint_id, sequence_num);
        CREATE INDEX IF NOT EXISTS idx_fifo_queue_status
            ON fifo_queue(status) WHERE status = 'pending';
        "#,
    )
    .await?;

    // Step 22: Migration 021 — delivery_targets and fanout_rules tables
    run_migration(
        pool,
        "021_delivery_targets",
        r#"
        CREATE TABLE IF NOT EXISTS delivery_targets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
            target_type TEXT NOT NULL DEFAULT 'http',
            config JSONB NOT NULL DEFAULT '{}',
            enabled BOOL NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_delivery_targets_endpoint
            ON delivery_targets(endpoint_id);

        CREATE TABLE IF NOT EXISTS fanout_rules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            event_pattern TEXT NOT NULL,
            conditions JSONB,
            target_ids UUID[] NOT NULL DEFAULT '{}',
            dead_letter_endpoint_id UUID,
            enabled BOOL NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_fanout_rules_customer
            ON fanout_rules(customer_id);
        "#,
    )
    .await?;

    // Step 23: Migration 022 — stripe columns on customers
    run_migration(
        pool,
        "022_stripe_columns",
        r#"
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
        "#,
    )
    .await?;

    // Step 24: Migration 023 — updated_at column on webhook_queue (for zombie reaper)
    run_migration(
        pool,
        "023_updated_at_webhook_queue",
        r#"
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
        "#,
    )
    .await?;

    // Step 25: Migration 024 — LISTEN/NOTIFY trigger for webhook_queue
    run_migration(
        pool,
        "024_listen_notify",
        r#"
        CREATE OR REPLACE FUNCTION notify_new_webhook()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status = 'pending' THEN
                PERFORM pg_notify('new_webhook', NEW.id::text);
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trg_notify_new_webhook ON webhook_queue;

        CREATE TRIGGER trg_notify_new_webhook
            AFTER INSERT ON webhook_queue
            FOR EACH ROW
            EXECUTE FUNCTION notify_new_webhook();
        "#,
    )
    .await?;

    // Step 26: Migration 025 — trace_id columns for OpenTelemetry distributed tracing
    run_migration(
        pool,
        "025_trace_id",
        r#"
        ALTER TABLE webhook_queue ADD COLUMN IF NOT EXISTS trace_id VARCHAR(64);
        ALTER TABLE delivery_attempts ADD COLUMN IF NOT EXISTS trace_id VARCHAR(64);
        CREATE INDEX IF NOT EXISTS idx_webhook_queue_trace_id
            ON webhook_queue(trace_id) WHERE trace_id IS NOT NULL;
        "#,
    )
    .await?;

    // Step 27: Migration 026 — response_headers column on delivery_attempts
    run_migration(
        pool,
        "026_response_headers",
        "ALTER TABLE delivery_attempts ADD COLUMN IF NOT EXISTS response_headers JSONB",
    )
    .await?;

    // Step 28: Migration 027 — updated_at and error_message on deliveries
    run_migration(
        pool,
        "027_deliveries_updated_at_error",
        r#"
        ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS error_message TEXT;

        DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON deliveries;
        CREATE TRIGGER trg_deliveries_updated_at
            BEFORE UPDATE ON deliveries
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        "#,
    )
    .await?;

    // Step 29: Migration 028 — invoices table
    run_migration(
        pool,
        "028_invoices",
        r#"
        CREATE TABLE IF NOT EXISTS invoices (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            amount_cents INT NOT NULL DEFAULT 0,
            currency TEXT NOT NULL DEFAULT 'usd',
            plan TEXT NOT NULL DEFAULT 'free',
            status TEXT NOT NULL DEFAULT 'paid',
            provider TEXT NOT NULL DEFAULT 'stripe',
            provider_invoice_id TEXT,
            paid_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
        "#,
    )
    .await?;

    // Step 30: Migration 029 — payment_transactions table
    // Required by billing webhook handlers (polar.rs, iyzico.rs, stripe.rs)
    run_migration(
        pool,
        "029_payment_transactions",
        r#"
        CREATE TABLE IF NOT EXISTS payment_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            provider TEXT NOT NULL DEFAULT 'stripe',
            provider_tx_id TEXT,
            amount_cents BIGINT NOT NULL DEFAULT 0,
            currency TEXT NOT NULL DEFAULT 'USD',
            status TEXT NOT NULL DEFAULT 'completed',
            plan TEXT NOT NULL DEFAULT 'free',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer ON payment_transactions(customer_id);
        CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON payment_transactions(provider, provider_tx_id);
        "#,
    )
    .await?;

    // Step 31: Migration 030 — ensure customer payment columns exist
    // Some columns may be missing from older schemas
    run_migration(
        pool,
        "030_customer_payment_columns",
        r#"
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe';
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_customer_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS polar_subscription_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_customer_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS iyzico_subscription_id TEXT;
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        "#,
    )
    .await?;

    // Step 32: Migration 031 — remove signing_secret from webhook_queue
    // signing_secret is fetched from endpoints table at delivery time instead
    run_migration(
        pool,
        "031_remove_signing_secret_from_queue",
        "ALTER TABLE webhook_queue DROP COLUMN IF EXISTS signing_secret",
    )
    .await?;

    tracing::info!("✅ All database migrations completed");
    Ok(())
}

/// Publish a webhook delivery to the PostgreSQL-based queue.
/// Replaces the deprecated Kafka publish function.
pub async fn publish_to_queue(
    pool: &PgPool,
    delivery_id: uuid::Uuid,
    endpoint_id: uuid::Uuid,
    endpoint_url: &str,
    payload: &str,
    custom_headers: Option<&serde_json::Value>,
) -> Result<()> {
    // Capture the current OpenTelemetry trace-id (if active)
    let trace_id = crate::telemetry::current_trace_id();

    sqlx::query(
        r#"
        INSERT INTO webhook_queue (delivery_id, endpoint_id, endpoint_url, payload, custom_headers, trace_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
    )
    .bind(delivery_id)
    .bind(endpoint_id)
    .bind(endpoint_url)
    .bind(payload)
    .bind(custom_headers)
    .bind(trace_id)
    .execute(pool)
    .await?;

    tracing::debug!("📤 Webhook {} queued for delivery", delivery_id);
    Ok(())
}
