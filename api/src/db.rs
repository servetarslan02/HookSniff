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

async fn run_migrations(pool: &PgPool) -> Result<()> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email STRING NOT NULL UNIQUE,
            api_key_hash STRING NOT NULL,
            api_key_prefix STRING NOT NULL,
            plan STRING NOT NULL DEFAULT 'free',
            webhook_limit INT NOT NULL DEFAULT 1000,
            webhook_count INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            password_hash STRING
        );

        CREATE TABLE IF NOT EXISTS endpoints (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            url STRING NOT NULL,
            description STRING,
            is_active BOOL NOT NULL DEFAULT true,
            signing_secret STRING NOT NULL,
            retry_policy JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            allowed_ips JSONB,
            event_filter STRING[],
            custom_headers JSONB,
            old_signing_secret STRING,
            secret_rotated_at TIMESTAMPTZ
        );

        CREATE TABLE IF NOT EXISTS deliveries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
            customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            payload JSONB NOT NULL,
            event_type STRING,
            status STRING NOT NULL DEFAULT 'pending',
            attempt_count INT NOT NULL DEFAULT 0,
            max_attempts INT NOT NULL DEFAULT 3,
            last_attempt_at TIMESTAMPTZ,
            response_status INT,
            response_body STRING,
            next_retry_at TIMESTAMPTZ,
            replay_count INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS delivery_attempts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
            attempt_number INT NOT NULL,
            status_code INT,
            response_body STRING,
            duration_ms INT,
            error_message STRING,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_attempts_delivery ON delivery_attempts(delivery_id);

        CREATE TABLE IF NOT EXISTS dead_letters (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
            endpoint_id UUID NOT NULL REFERENCES endpoints(id),
            customer_id UUID NOT NULL REFERENCES customers(id),
            payload JSONB NOT NULL,
            reason STRING,
            attempts INT NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS idempotency_keys (
            key STRING PRIMARY KEY,
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

        -- Ensure new columns exist for upgrades (ALTER TABLE IF NOT EXISTS not supported in CockroachDB,
        -- but CREATE TABLE IF NOT EXISTS above handles fresh installs. For existing DBs, run separately.)
        -- ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash STRING;
        -- ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS allowed_ips JSONB;
        -- ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS event_filter STRING[];
        -- ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS custom_headers JSONB;
        -- ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS old_signing_secret STRING;
        -- ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS secret_rotated_at TIMESTAMPTZ;
        "#,
    )
    .execute(pool)
    .await?;

    // For existing databases, add missing columns
    let alter_statements = vec![
        "ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash STRING",
        "ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS allowed_ips JSONB",
        "ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS event_filter STRING[]",
        "ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS custom_headers JSONB",
        "ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS old_signing_secret STRING",
        "ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS secret_rotated_at TIMESTAMPTZ",
        "ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS retry_policy JSONB",
    ];

    for stmt in alter_statements {
        // These may fail on CockroachDB if column already exists; that's OK
        let _ = sqlx::query(stmt).execute(pool).await;
    }

    tracing::info!("✅ Database migrations completed");
    Ok(())
}
