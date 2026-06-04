//! Model Versioning — ML model versiyonlama ve rollback
//!
//! Her model güncellemesini kaydeder:
//! - Versiyon geçmişi
//! - Tek komutla rollback
//! - A/B testing için eski model erişimi
//! - Audit trail

use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use sqlx::PgPool;
use uuid::Uuid;

/// Model versiyon kaydı
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ModelVersion {
    pub id: i64,
    pub endpoint_id: Uuid,
    pub model_type: String,
    pub version: i32,
    pub parameters: serde_json::Value,
    pub training_samples: i32,
    pub reason: String,         // "scheduled_training", "drift_retrain", "manual", "quality_reset"
    pub performance_snapshot: serde_json::Value,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub is_active: bool,
}

/// Versiyonlama metadata'sı
#[derive(Debug, Serialize)]
pub struct VersionHistory {
    pub endpoint_id: Uuid,
    pub model_type: String,
    pub current_version: i32,
    pub versions: Vec<ModelVersion>,
    pub total_versions: i32,
}

/// Mevcut modeli versiyonla (eğitim öncesi çağır)
pub async fn snapshot_current_model(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
    reason: &str,
) -> Result<i64, sqlx::Error> {
    // Mevcut model parametrelerini al
    let current: Option<(serde_json::Value, i32)> = sqlx::query_as(
        "SELECT parameters, training_samples FROM ml_models WHERE endpoint_id = $1 AND model_type = $2"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .fetch_optional(pool)
    .await?;

    let (params, samples) = current.unwrap_or((serde_json::json!({}), 0));

    // Son performans metriklerini al
    let quality: Option<(f64, f64)> = sqlx::query_as(
        "SELECT accuracy_pct, quality_score FROM ml_model_quality
         WHERE endpoint_id = $1 AND model_type = $2
         ORDER BY measured_at DESC LIMIT 1"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .fetch_optional(pool)
    .await?;

    let perf = match quality {
        Some((acc, qs)) => serde_json::json!({"accuracy": acc, "quality_score": qs}),
        None => serde_json::json!({"accuracy": null, "quality_score": null}),
    };

    // Mevcut max version'ı bul
    let max_ver: Option<(i32,)> = sqlx::query_as(
        "SELECT COALESCE(MAX(version), 0) FROM ml_model_versions WHERE endpoint_id = $1 AND model_type = $2"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .fetch_optional(pool)
    .await?;

    let new_version = max_ver.map(|(v,)| v).unwrap_or(0) + 1;

    // Versiyonu kaydet
    let id: (i64,) = sqlx::query_as(
        "INSERT INTO ml_model_versions (endpoint_id, model_type, version, parameters, training_samples, reason, performance_snapshot, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(new_version)
    .bind(&params)
    .bind(samples)
    .bind(reason)
    .bind(&perf)
    .fetch_one(pool)
    .await?;

    // Eski versiyonları pasif yap
    sqlx::query(
        "UPDATE ml_model_versions SET is_active = false
         WHERE endpoint_id = $1 AND model_type = $2 AND version != $3"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(new_version)
    .execute(pool)
    .await?;

    Ok(id.0)
}

/// Belirli bir versiyona rollback
pub async fn rollback_to_version(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
    target_version: i32,
) -> Result<bool, sqlx::Error> {
    // Hedef versiyonu bul
    let version: Option<(serde_json::Value, i32)> = sqlx::query_as(
        "SELECT parameters, training_samples FROM ml_model_versions
         WHERE endpoint_id = $1 AND model_type = $2 AND version = $3"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(target_version)
    .fetch_optional(pool)
    .await?;

    let (params, samples) = match version {
        Some(v) => v,
        None => return Ok(false),
    };

    // Mevcut modeli versiyonla (rollback öncesi snapshot)
    snapshot_current_model(pool, endpoint_id, model_type, "pre_rollback").await?;

    // Modeli güncelle
    sqlx::query(
        "UPDATE ml_models SET parameters = $1, training_samples = $2, updated_at = NOW()
         WHERE endpoint_id = $3 AND model_type = $4"
    )
    .bind(&params)
    .bind(samples)
    .bind(endpoint_id)
    .bind(model_type)
    .execute(pool)
    .await?;

    // Hedef versiyonu aktif yap
    sqlx::query(
        "UPDATE ml_model_versions SET is_active = true
         WHERE endpoint_id = $1 AND model_type = $2 AND version = $3"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .bind(target_version)
    .execute(pool)
    .await?;

    tracing::info!(
 " Rollback: endpoint {} model {} → version {}",
        endpoint_id, model_type, target_version
    );

    Ok(true)
}

/// Versiyon geçmişini getir
pub async fn get_version_history(
    pool: &PgPool,
    endpoint_id: Uuid,
    model_type: &str,
) -> Result<VersionHistory, sqlx::Error> {
    let versions: Vec<ModelVersion> = sqlx::query_as(
        "SELECT id, endpoint_id, model_type, version, parameters, training_samples,
                reason, performance_snapshot, created_at, is_active
         FROM ml_model_versions
         WHERE endpoint_id = $1 AND model_type = $2
         ORDER BY version DESC"
    )
    .bind(endpoint_id)
    .bind(model_type)
    .fetch_all(pool)
    .await?;

    let current_version = versions.iter().find(|v| v.is_active).map(|v| v.version).unwrap_or(0);
    let total = versions.len() as i32;

    Ok(VersionHistory {
        endpoint_id,
        model_type: model_type.to_string(),
        current_version,
        versions,
        total_versions: total,
    })
}

/// Eski versiyonları temizle (son N hariç)
pub async fn prune_old_versions(
    pool: &PgPool,
    keep_last: i32,
) -> Result<u64, sqlx::Error> {
    let result = sqlx::query(
        "DELETE FROM ml_model_versions WHERE id NOT IN (
            SELECT id FROM ml_model_versions
            WHERE is_active = true
            UNION
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY endpoint_id, model_type ORDER BY version DESC) as rn
                FROM ml_model_versions
            ) sub WHERE rn <= $1
        )"
    )
    .bind(keep_last)
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}
