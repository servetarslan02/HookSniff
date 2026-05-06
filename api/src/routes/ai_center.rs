use axum::extract::{Extension, Path, Query};
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/events", get(list_events))
        .route("/risks", get(list_risks))
        .route("/actions", get(list_actions))
        .route("/actions/{id}/approve", post(approve_action))
        .route("/actions/{id}/reject", post(reject_action))
        .route("/actions/{id}/rollback", post(rollback_action))
        .route("/blocklist", get(list_blocklist).post(add_block))
        .route("/blocklist/{id}", axum::routing::delete(remove_block))
        .route("/status", get(ai_status))
        .route("/providers", get(list_providers))
        .route("/stats", get(ai_stats))
}

#[derive(Debug, Deserialize)]
struct EventsParams {
    severity: Option<String>,
    event_type: Option<String>,
    limit: Option<i64>,
}

#[derive(Debug, Serialize)]
struct AiEvent {
    id: Uuid,
    event_type: String,
    severity: String,
    title: String,
    description: Option<String>,
    action_taken: Option<String>,
    target_type: Option<String>,
    target_id: Option<Uuid>,
    resolved: bool,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
struct RiskScore {
    id: Uuid,
    target_type: String,
    target_id: Uuid,
    score: i32,
    factors: Option<serde_json::Value>,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
struct AiAction {
    id: Uuid,
    action_type: String,
    description: String,
    target_type: Option<String>,
    target_id: Option<Uuid>,
    status: String,
    risk_level: String,
    auto_approved: bool,
    executed_at: Option<chrono::DateTime<chrono::Utc>>,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
struct BlocklistEntry {
    id: Uuid,
    block_type: String,
    block_value: String,
    reason: Option<String>,
    expires_at: Option<chrono::DateTime<chrono::Utc>>,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
struct AddBlockRequest {
    block_type: String,
    block_value: String,
    reason: Option<String>,
    duration_minutes: Option<i32>,
}

#[derive(Debug, Serialize)]
struct AiStatusResponse {
    active_events: i64,
    critical_events: i64,
    pending_actions: i64,
    blocked_items: i64,
    avg_risk_score: f64,
    high_risk_endpoints: i64,
}

async fn list_events(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
    Query(params): Query<EventsParams>,
) -> Result<Json<Vec<AiEvent>>, AppError> {
    let limit = params.limit.unwrap_or(50).min(200);

    let events = if let Some(severity) = &params.severity {
        sqlx::query_as::<_, (Uuid, String, String, String, Option<String>, Option<String>, Option<String>, Option<Uuid>, bool, chrono::DateTime<chrono::Utc>)>(
            "SELECT id, event_type, severity, title, description, action_taken, target_type, target_id, resolved, created_at FROM ai_events WHERE severity = $1 ORDER BY created_at DESC LIMIT $2"
        )
        .bind(severity)
        .bind(limit)
        .fetch_all(&pool)
        .await?
    } else if let Some(event_type) = &params.event_type {
        sqlx::query_as::<_, (Uuid, String, String, String, Option<String>, Option<String>, Option<String>, Option<Uuid>, bool, chrono::DateTime<chrono::Utc>)>(
            "SELECT id, event_type, severity, title, description, action_taken, target_type, target_id, resolved, created_at FROM ai_events WHERE event_type = $1 ORDER BY created_at DESC LIMIT $2"
        )
        .bind(event_type)
        .bind(limit)
        .fetch_all(&pool)
        .await?
    } else {
        sqlx::query_as::<_, (Uuid, String, String, String, Option<String>, Option<String>, Option<String>, Option<Uuid>, bool, chrono::DateTime<chrono::Utc>)>(
            "SELECT id, event_type, severity, title, description, action_taken, target_type, target_id, resolved, created_at FROM ai_events ORDER BY created_at DESC LIMIT $1"
        )
        .bind(limit)
        .fetch_all(&pool)
        .await?
    };

    let result: Vec<AiEvent> = events
        .into_iter()
        .map(|(id, et, sev, title, desc, action, tt, tid, resolved, created)| AiEvent {
            id,
            event_type: et,
            severity: sev,
            title,
            description: desc,
            action_taken: action,
            target_type: tt,
            target_id: tid,
            resolved,
            created_at: created,
        })
        .collect();

    Ok(Json(result))
}

async fn list_risks(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
) -> Result<Json<Vec<RiskScore>>, AppError> {
    let risks = sqlx::query_as::<_, (Uuid, String, Uuid, i32, Option<serde_json::Value>, chrono::DateTime<chrono::Utc>)>(
        r#"
        SELECT DISTINCT ON (target_id) id, target_type, target_id, score, factors, created_at
        FROM risk_scores
        ORDER BY target_id, created_at DESC
        LIMIT 50
        "#,
    )
    .fetch_all(&pool)
    .await?;

    let result: Vec<RiskScore> = risks
        .into_iter()
        .map(|(id, tt, tid, score, factors, created)| RiskScore {
            id,
            target_type: tt,
            target_id: tid,
            score,
            factors,
            created_at: created,
        })
        .collect();

    Ok(Json(result))
}

async fn list_actions(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
) -> Result<Json<Vec<AiAction>>, AppError> {
    let actions = sqlx::query_as::<_, (Uuid, String, String, Option<String>, Option<Uuid>, String, String, bool, Option<chrono::DateTime<chrono::Utc>>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, action_type, description, target_type, target_id, status, risk_level, auto_approved, executed_at, created_at FROM ai_actions ORDER BY created_at DESC LIMIT 50"
    )
    .fetch_all(&pool)
    .await?;

    let result: Vec<AiAction> = actions
        .into_iter()
        .map(|(id, at, desc, tt, tid, status, rl, aa, ea, created)| AiAction {
            id,
            action_type: at,
            description: desc,
            target_type: tt,
            target_id: tid,
            status,
            risk_level: rl,
            auto_approved: aa,
            executed_at: ea,
            created_at: created,
        })
        .collect();

    Ok(Json(result))
}

async fn approve_action(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "UPDATE ai_actions SET status = 'approved', executed_at = now() WHERE id = $1 AND status = 'pending'"
    )
    .bind(id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("✅ AI aksiyonu onaylandı: {}", id);
    Ok(Json(serde_json::json!({"approved": true, "id": id})))
}

async fn reject_action(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "UPDATE ai_actions SET status = 'rejected' WHERE id = $1 AND status = 'pending'"
    )
    .bind(id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("❌ AI aksiyonu reddedildi: {}", id);
    Ok(Json(serde_json::json!({"rejected": true, "id": id})))
}

async fn rollback_action(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "UPDATE ai_actions SET status = 'rolled_back', rolled_back_at = now() WHERE id = $1 AND status IN ('executed', 'approved')"
    )
    .bind(id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::warn!("⏪ AI aksiyonu geri alındı: {}", id);
    Ok(Json(serde_json::json!({"rolled_back": true, "id": id})))
}

async fn list_blocklist(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
) -> Result<Json<Vec<BlocklistEntry>>, AppError> {
    let entries = sqlx::query_as::<_, (Uuid, String, String, Option<String>, Option<chrono::DateTime<chrono::Utc>>, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, block_type, block_value, reason, expires_at, created_at FROM ai_blocklist WHERE expires_at IS NULL OR expires_at > now() ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await?;

    let result: Vec<BlocklistEntry> = entries
        .into_iter()
        .map(|(id, bt, bv, reason, expires, created)| BlocklistEntry {
            id,
            block_type: bt,
            block_value: bv,
            reason,
            expires_at: expires,
            created_at: created,
        })
        .collect();

    Ok(Json(result))
}

async fn add_block(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
    Json(req): Json<AddBlockRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let expires_at = req.duration_minutes.map(|mins| {
        chrono::Utc::now() + chrono::Duration::minutes(mins as i64)
    });

    let result = sqlx::query(
        "INSERT INTO ai_blocklist (block_type, block_value, reason, expires_at) VALUES ($1, $2, $3, $4) RETURNING id"
    )
    .bind(&req.block_type)
    .bind(&req.block_value)
    .bind(&req.reason)
    .bind(expires_at)
    .fetch_one(&pool)
    .await?;

    let id: Uuid = result.get("id");
    tracing::info!("🚫 Manuel engelleme eklendi: {} = {}", req.block_type, req.block_value);

    Ok(Json(serde_json::json!({"id": id, "blocked": true})))
}

async fn remove_block(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query("DELETE FROM ai_blocklist WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    tracing::info!("✅ Engelleme kaldırıldı: {}", id);
    Ok(Json(serde_json::json!({"removed": true, "id": id})))
}

async fn ai_status(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
) -> Result<Json<AiStatusResponse>, AppError> {
    let active_events: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM ai_events WHERE resolved = false AND created_at > now() - INTERVAL '24 hours'"
    )
    .fetch_one(&pool)
    .await?;

    let critical_events: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM ai_events WHERE severity = 'critical' AND resolved = false AND created_at > now() - INTERVAL '24 hours'"
    )
    .fetch_one(&pool)
    .await?;

    let pending_actions: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM ai_actions WHERE status = 'pending'"
    )
    .fetch_one(&pool)
    .await?;

    let blocked_items: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM ai_blocklist WHERE expires_at IS NULL OR expires_at > now()"
    )
    .fetch_one(&pool)
    .await?;

    let avg_risk: (Option<f64>,) = sqlx::query_as(
        r#"
        SELECT AVG(score)::FLOAT FROM risk_scores
        WHERE created_at > now() - INTERVAL '1 hour'
        "#
    )
    .fetch_one(&pool)
    .await?;

    let high_risk: (i64,) = sqlx::query_as(
        r#"
        SELECT COUNT(DISTINCT target_id) FROM risk_scores
        WHERE score > 60 AND created_at > now() - INTERVAL '1 hour'
        "#
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(AiStatusResponse {
        active_events: active_events.0,
        critical_events: critical_events.0,
        pending_actions: pending_actions.0,
        blocked_items: blocked_items.0,
        avg_risk_score: avg_risk.0.unwrap_or(0.0),
        high_risk_endpoints: high_risk.0,
    }))
}

async fn list_providers(
    Extension(_pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Return info about configured AI providers
    let mimo_configured = std::env::var("MIMO_API_KEY")
        .ok()
        .filter(|k| !k.is_empty() && k != "your-mimo-api-key-here")
        .is_some();

    let openai_configured = std::env::var("OPENAI_API_KEY")
        .ok()
        .filter(|k| !k.is_empty() && k != "your-openai-api-key-here")
        .is_some();

    let total_active = [mimo_configured, openai_configured].iter().filter(|&&x| x).count();

    Ok(Json(serde_json::json!({
        "providers": [
            {
                "name": "mimo",
                "enabled": mimo_configured,
                "capabilities": ["log_analysis", "anomaly_detection", "threat_analysis", "report_generation"],
                "api_key_env": "MIMO_API_KEY",
                "docs": "https://mimo.xiaomi.com"
            },
            {
                "name": "openai",
                "enabled": openai_configured,
                "capabilities": ["code_review", "code_generation", "command_interpretation", "report_generation", "log_analysis"],
                "api_key_env": "OPENAI_API_KEY",
                "docs": "https://platform.openai.com/api-keys"
            }
        ],
        "total_active": total_active,
        "note": "Yeni AI eklemek için .env dosyasına API key ekleyin ve provider modülü oluşturun"
    })))
}

async fn ai_stats(
    Extension(pool): Extension<PgPool>,
    Extension(_customer): Extension<Customer>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Task stats from last 24h
    let events_by_type: Vec<(String, i64)> = sqlx::query_as(
        r#"
        SELECT event_type, COUNT(*) as cnt
        FROM ai_events
        WHERE created_at > now() - INTERVAL '24 hours'
        GROUP BY event_type
        ORDER BY cnt DESC
        "#
    )
    .fetch_all(&pool)
    .await?;

    let actions_by_status: Vec<(String, i64)> = sqlx::query_as(
        r#"
        SELECT status, COUNT(*) as cnt
        FROM ai_actions
        WHERE created_at > now() - INTERVAL '24 hours'
        GROUP BY status
        ORDER BY cnt DESC
        "#
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(serde_json::json!({
        "events_24h": events_by_type.into_iter().map(|(t, c)| serde_json::json!({"type": t, "count": c})).collect::<Vec<_>>(),
        "actions_24h": actions_by_status.into_iter().map(|(s, c)| serde_json::json!({"status": s, "count": c})).collect::<Vec<_>>(),
        "providers_note": "GET /v1/ai/providers ile AI sağlayıcı durumlarını görebilirsiniz"
    })))
}
