use anyhow::Result;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

pub async fn create_pool(database_url: &str) -> Result<PgPool> {
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await?;

    run_migrations(&pool).await?;
    Ok(pool)
}

async fn run_migrations(pool: &PgPool) -> Result<()> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS ai_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_type STRING NOT NULL,
            severity STRING NOT NULL,
            title STRING NOT NULL,
            description STRING,
            action_taken STRING,
            target_type STRING,
            target_id UUID,
            metadata JSONB,
            resolved BOOL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS risk_scores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            target_type STRING NOT NULL,
            target_id UUID NOT NULL,
            score INT NOT NULL,
            factors JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS ai_actions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            action_type STRING NOT NULL,
            description STRING NOT NULL,
            target_type STRING,
            target_id UUID,
            status STRING NOT NULL DEFAULT 'pending',
            risk_level STRING NOT NULL,
            auto_approved BOOL DEFAULT false,
            executed_at TIMESTAMPTZ,
            rolled_back_at TIMESTAMPTZ,
            created_by STRING DEFAULT 'ai',
            metadata JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS ai_blocklist (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            block_type STRING NOT NULL,
            block_value STRING NOT NULL,
            reason STRING,
            expires_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS ai_config (
            key STRING PRIMARY KEY,
            value JSONB NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_ai_events_type ON ai_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_ai_events_severity ON ai_events(severity);
        CREATE INDEX IF NOT EXISTS idx_ai_events_created ON ai_events(created_at);
        CREATE INDEX IF NOT EXISTS idx_risk_scores_target ON risk_scores(target_type, target_id);
        CREATE INDEX IF NOT EXISTS idx_risk_scores_created ON risk_scores(created_at);
        CREATE INDEX IF NOT EXISTS idx_ai_actions_status ON ai_actions(status);
        CREATE INDEX IF NOT EXISTS idx_ai_blocklist_type ON ai_blocklist(block_type);
        CREATE INDEX IF NOT EXISTS idx_ai_blocklist_expires ON ai_blocklist(expires_at) WHERE expires_at IS NOT NULL;
        "#,
    )
    .execute(pool)
    .await?;

    tracing::info!("✅ AI Center migrations completed");
    Ok(())
}
