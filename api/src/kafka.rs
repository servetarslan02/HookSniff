//! DEPRECATED: Kafka yerine PostgreSQL queue kullanılıyor.
//! Bu dosya backward compatibility için tutulmuştur.
//! Yeni kodda `db::publish_to_queue` kullanın.

use anyhow::Result;
use sqlx::PgPool;
use uuid::Uuid;

/// Webhook teslimatını PostgreSQL queue'ya ekle.
/// (Eski Kafka publish_webhook fonksiyonunun yerini alır)
pub async fn publish_to_queue(
    pool: &PgPool,
    delivery_id: Uuid,
    endpoint_id: Uuid,
    endpoint_url: &str,
    signing_secret: &str,
    payload: &str,
    custom_headers: Option<&serde_json::Value>,
) -> Result<()> {
    sqlx::query(
        r#"
        INSERT INTO webhook_queue (delivery_id, endpoint_id, endpoint_url, signing_secret, payload, custom_headers)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
    )
    .bind(delivery_id)
    .bind(endpoint_id)
    .bind(endpoint_url)
    .bind(signing_secret)
    .bind(payload)
    .bind(custom_headers)
    .execute(pool)
    .await?;

    tracing::debug!("📤 Webhook {} queued for delivery", delivery_id);
    Ok(())
}
