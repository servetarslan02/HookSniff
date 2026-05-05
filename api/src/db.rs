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
        "ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash STRING",
    )
    .await?;

    // Step 4: Migration 003 — add IP filtering and event filtering to endpoints
    run_migration(
        pool,
        "003_add_endpoint_security_columns",
        r#"
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS allowed_ips JSONB;
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS event_filter STRING[];
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS custom_headers JSONB;
        "#,
    )
    .await?;

    // Step 5: Migration 004 — add signing secret rotation support
    run_migration(
        pool,
        "004_add_secret_rotation",
        r#"
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS old_signing_secret STRING;
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
        ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS fallback_url STRING;
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
        ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS fifo_group_id STRING;
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

    tracing::info!("✅ All database migrations completed");
    Ok(())
}
