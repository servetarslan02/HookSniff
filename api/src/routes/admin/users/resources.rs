use axum::extract::{Extension, Path, Query};
use axum::Json;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::routes::admin::{require_admin, require_admin_write};

// ── User Resources (endpoints, webhooks, api-keys, applications, usage) ──

/// GET /v1/admin/users/:id/endpoints — List user's endpoints with delivery stats.
pub async fn admin_user_endpoints(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let endpoints = sqlx::query_as::<_, (Uuid, String, Option<String>, bool, chrono::DateTime<chrono::Utc>, Option<i64>, Option<chrono::DateTime<chrono::Utc>>)>(
        r#"SELECT e.id, e.url, e.description, e.is_active, e.created_at,
                  COUNT(d.id) as total_deliveries,
                  MAX(d.created_at) as last_delivery_at
           FROM endpoints e
           LEFT JOIN deliveries d ON d.endpoint_id = e.id
           WHERE e.customer_id = $1
           GROUP BY e.id, e.url, e.description, e.is_active, e.created_at
           ORDER BY e.created_at DESC"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let result: Vec<serde_json::Value> = endpoints
        .into_iter()
        .map(|(eid, url, desc, active, created, total, last)| {
            serde_json::json!({
                "id": eid,
                "url": url,
                "description": desc,
                "is_active": active,
                "created_at": created,
                "total_deliveries": total.unwrap_or(0),
                "last_delivery_at": last,
            })
        })
        .collect();

    Ok(Json(serde_json::json!({ "endpoints": result })))
}

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UserWebhooksQuery {
    pub page: Option<i64>,
    pub per_page: Option<i64>,
    pub status: Option<String>,
    pub event_type: Option<String>,
    pub since: Option<String>,
}

/// GET /v1/admin/users/:id/webhooks — List user's deliveries with filters.
pub async fn admin_user_webhooks(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Query(params): Query<UserWebhooksQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(50).clamp(1, 200);
    let offset = (page - 1) * per_page;

    let mut conditions = vec!["d.customer_id = $1".to_string()];
    let mut bind_idx = 2;

    if params.status.is_some() {
        conditions.push(format!("d.status = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.event_type.is_some() {
        conditions.push(format!("d.event_type = ${}", bind_idx));
        bind_idx += 1;
    }
    if params.since.is_some() {
        conditions.push(format!("d.created_at >= ${}", bind_idx));
        bind_idx += 1;
    }

    let where_clause = format!("WHERE {}", conditions.join(" AND "));
    let _ = bind_idx;

    let count_sql = format!("SELECT COUNT(*) FROM deliveries d {}", where_clause);
    let mut count_q = sqlx::query_scalar::<_, i64>(&count_sql).bind(id);
    if let Some(ref s) = params.status {
        count_q = count_q.bind(s);
    }
    if let Some(ref e) = params.event_type {
        count_q = count_q.bind(e);
    }
    if let Some(ref s) = params.since {
        count_q = count_q.bind(s);
    }
    let total = count_q.fetch_one(&pool).await?;

    let data_sql = format!(
        r#"SELECT d.id, d.endpoint_id, d.status, d.event_type, d.created_at, d.attempt_count,
                  d.response_status, d.response_body,
                  (SELECT da.error_message FROM delivery_attempts da
                   WHERE da.delivery_id = d.id ORDER BY da.attempt_number DESC LIMIT 1) as error_message
           FROM deliveries d {} ORDER BY d.created_at DESC LIMIT ${} OFFSET ${}"#,
        where_clause, bind_idx, bind_idx + 1
    );

    let mut data_q = sqlx::query_as::<_, (Uuid, Uuid, String, Option<String>, chrono::DateTime<chrono::Utc>, i32, Option<i32>, Option<String>, Option<String>)>(&data_sql).bind(id);
    if let Some(ref s) = params.status {
        data_q = data_q.bind(s);
    }
    if let Some(ref e) = params.event_type {
        data_q = data_q.bind(e);
    }
    if let Some(ref s) = params.since {
        data_q = data_q.bind(s);
    }
    data_q = data_q.bind(per_page).bind(offset);

    let rows = data_q.fetch_all(&pool).await?;

    let webhooks: Vec<serde_json::Value> = rows
        .into_iter()
        .map(|(did, eid, status, event, created, attempts, resp_status, resp_body, error)| {
            serde_json::json!({
                "id": did,
                "endpoint_id": eid,
                "status": status,
                "event": event,
                "created_at": created,
                "attempt_count": attempts,
                "response_status": resp_status,
                "response_body": resp_body,
                "error_message": error,
            })
        })
        .collect();

    Ok(Json(serde_json::json!({
        "webhooks": webhooks,
        "total": total,
        "page": page,
        "per_page": per_page,
    })))
}

/// GET /v1/admin/users/:id/api-keys — List user's API keys.
pub async fn admin_user_api_keys(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let user = sqlx::query_as::<_, (String, chrono::DateTime<chrono::Utc>)>(
        "SELECT api_key_prefix, created_at FROM customers WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(serde_json::json!({
        "api_keys": [{
            "prefix": user.0,
            "name": "Default API Key",
            "created_at": user.1,
            "is_active": true,
        }]
    })))
}

/// GET /v1/admin/users/:id/applications — List user's applications.
pub async fn admin_user_applications(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let apps = sqlx::query_as::<_, (Uuid, String, Option<String>, chrono::DateTime<chrono::Utc>, Option<i64>)>(
        r#"SELECT a.id, a.name, a.description, a.created_at,
                  (SELECT COUNT(*) FROM endpoints WHERE application_id = a.id) as endpoint_count
           FROM applications a
           WHERE a.customer_id = $1
           ORDER BY a.created_at DESC"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let result: Vec<serde_json::Value> = apps
        .into_iter()
        .map(|(aid, name, desc, created, ep_count)| {
            serde_json::json!({
                "id": aid,
                "name": name,
                "description": desc,
                "created_at": created,
                "endpoint_count": ep_count.unwrap_or(0),
            })
        })
        .collect();

    Ok(Json(serde_json::json!({ "applications": result })))
}

/// GET /v1/admin/users/:id/usage — Detailed usage statistics.
pub async fn admin_user_usage(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin(&customer)?;

    let total: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM deliveries WHERE customer_id = $1")
            .bind(id)
            .fetch_one(&pool)
            .await?;

    let success: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'delivered'",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let failed: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'failed'",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let pending: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND status = 'pending'",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let endpoints: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(id)
            .fetch_one(&pool)
            .await?;

    let active_endpoints: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1 AND is_active = true",
    )
    .bind(id)
    .fetch_one(&pool)
    .await?;

    let last_30d: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at >= NOW() - INTERVAL '30 days'",
    ).bind(id).fetch_one(&pool).await?;

    let last_7d: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM deliveries WHERE customer_id = $1 AND created_at >= NOW() - INTERVAL '7 days'",
    ).bind(id).fetch_one(&pool).await?;

    let top_events = sqlx::query_as::<_, (Option<String>, i64)>(
        r#"SELECT event_type, COUNT(*) as count FROM deliveries
           WHERE customer_id = $1 GROUP BY event_type ORDER BY count DESC LIMIT 10"#,
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    let success_rate = if total.0 > 0 {
        (success.0 as f64 / total.0 as f64) * 100.0
    } else {
        0.0
    };

    Ok(Json(serde_json::json!({
        "total_deliveries": total.0,
        "successful": success.0,
        "failed": failed.0,
        "pending": pending.0,
        "success_rate": (success_rate * 10.0).round() / 10.0,
        "endpoints_count": endpoints.0,
        "active_endpoints": active_endpoints.0,
        "last_30_days": last_30d.0,
        "last_7_days": last_7d.0,
        "top_events": top_events.into_iter().map(|(ev, cnt)| {
            serde_json::json!({ "event": ev, "count": cnt })
        }).collect::<Vec<_>>(),
    })))
}

/// POST /v1/admin/users/:id/test-webhook — Send test webhook to a user's endpoint.
pub async fn admin_user_test_webhook(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<crate::routes::admin::delivery::TestWebhookRequest>,
) -> Result<Json<crate::routes::admin::delivery::TestWebhookResponse>, AppError> {
    require_admin_write(&customer)?;

    if !req.endpoint_url.starts_with("http://") && !req.endpoint_url.starts_with("https://") {
        return Err(AppError::BadRequest(
            "URL must start with http:// or https://".into(),
        ));
    }

    if let Err(e) = crate::ssrf::validate_url(&req.endpoint_url) {
        return Err(AppError::BadRequest(format!("URL not allowed: {}", e)));
    }

    let client = reqwest::Client::new();
    let start = std::time::Instant::now();

    let mut request = client
        .post(&req.endpoint_url)
        .header("Content-Type", "application/json")
        .header("X-HookSniff-Admin", "true");

    if let Some(ref event_type) = req.event_type {
        request = request.header("X-HookSniff-Event", event_type.as_str());
    }

    let response = request
        .json(&req.payload)
        .send()
        .await
        .map_err(|e| AppError::BadRequest(format!("Request failed: {}", e)))?;

    let duration_ms = start.elapsed().as_millis() as u64;
    let status_code = response.status().as_u16();
    let response_body = response
        .text()
        .await
        .unwrap_or_else(|_| "<unreadable>".to_string());
    let response_body = if response_body.len() > 4096 {
        format!("{}...[truncated]", &response_body[..4096])
    } else {
        response_body
    };

    let _ = crate::audit::log_action(
        &pool,
        customer.id,
        "ADMIN_TEST_WEBHOOK",
        "customer",
        Some(&id.to_string()),
        Some(serde_json::json!({ "target_url": req.endpoint_url })),
        None,
        None,
    )
    .await;

    Ok(Json(crate::routes::admin::delivery::TestWebhookResponse {
        status_code,
        response_body,
        duration_ms,
    }))
}

/// POST /v1/admin/users/:id/webhooks/:delivery_id/replay — Replay a specific user's delivery.
pub async fn admin_user_replay_delivery(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path((user_id, delivery_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, AppError> {
    require_admin_write(&customer)?;

    let original = sqlx::query_as::<_, (Uuid, Uuid, serde_json::Value, Option<String>, i32)>(
        "SELECT id, endpoint_id, payload, event_type, replay_count FROM deliveries WHERE id = $1 AND customer_id = $2",
    )
    .bind(delivery_id)
    .bind(user_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let (orig_id, endpoint_id, payload, event_type, replay_count) = original;

    let new_delivery = sqlx::query_as::<_, (Uuid,)>(
        r#"INSERT INTO deliveries (endpoint_id, customer_id, payload, event_type, status, max_attempts, replay_count, is_test)
           VALUES ($1, $2, $3, $4, 'pending', 3, $5, FALSE)
           RETURNING id"#,
    )
    .bind(endpoint_id)
    .bind(user_id)
    .bind(&payload)
    .bind(&event_type)
    .bind(replay_count + 1)
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        "🔁 Admin replayed delivery {} for user {} → new delivery {}",
        orig_id,
        user_id,
        new_delivery.0
    );

    Ok(Json(serde_json::json!({
        "message": "Delivery replayed successfully",
        "original_id": orig_id,
        "new_delivery_id": new_delivery.0,
    })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{TimeZone, Utc};

    #[test]
    fn test_user_analytics_serialization() {
        let analytics = UserAnalytics {
            daily_deliveries: vec![],
            top_event_types: vec![],
            endpoint_health: vec![],
        };
        let json = serde_json::to_value(&analytics).unwrap();
        assert!(json.get("daily_deliveries").is_some());
        assert!(json.get("top_events").is_some());
        assert!(json.get("endpoint_health").is_some());
    }

    #[test]
    fn test_user_detail_response_serialization() {
        let resp = UserDetailResponse {
            user: UserSummary {
                id: Uuid::new_v4(),
                email: "a@b.com".to_string(),
                name: None,
                plan: "developer".to_string(),
                role: "member".to_string(),
                is_active: true,
                is_admin: false,
                created_at: Utc::now(),
            },
            endpoints: vec![],
            recent_deliveries: vec![],
            usage_stats: UsageStats {
                total_deliveries: 0,
                success_rate: 100.0,
                endpoints_count: 0,
            },
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert!(json.get("user").is_some());
        assert!(json.get("usage_stats").is_some());
    }

    #[test]
    fn test_user_detail_serialization() {
        let detail = UserDetail {
            id: Uuid::new_v4(),
            email: "admin@x.com".to_string(),
            name: Some("Admin".to_string()),
            plan: "enterprise".to_string(),
            is_active: true,
            is_admin: true,
            webhook_limit: 500_000,
            webhook_count: 1234,
            created_at: Utc::now(),
            endpoints: vec![],
            recent_deliveries: vec![],
        };
        let json = serde_json::to_value(&detail).unwrap();
        assert_eq!(json["webhook_limit"], 500_000);
        assert_eq!(json["webhook_count"], 1234);
    }
}
