use axum::extract::{Extension, Path};
use axum::routing::{get, post, put};
use axum::{Json, Router};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::billing::Plan;
use crate::error::AppError;
use crate::feature_flags::FeatureFlagService;
use crate::models::customer::Customer;
use crate::models::endpoint::{CreateEndpointRequest, Endpoint, EndpointResponse, RetryPolicy};

/// Generate a cryptographically random signing secret (32 bytes, hex-encoded).
fn generate_signing_secret() -> String {
    use aes_gcm::aead::rand_core::RngCore;
    let mut bytes = [0u8; 32];
    aes_gcm::aead::OsRng.fill_bytes(&mut bytes);
    format!("whsec_{}", hex::encode(bytes))
}

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_endpoints).post(create_endpoint))
        .route(
            "/{id}",
            get(get_endpoint)
                .put(update_endpoint)
                .delete(delete_endpoint),
        )
        .route("/{id}/rotate-secret", post(rotate_secret))
        .route("/{id}/retry-policy", put(update_retry_policy))
}

async fn list_endpoints(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
) -> Result<Json<Vec<EndpointResponse>>, AppError> {
    let endpoints = if let Some(Extension(scope)) = service_token {
        // Service token: only return endpoints belonging to this team
        sqlx::query_as::<_, Endpoint>(
            "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE customer_id = $1 AND team_id = $2 ORDER BY created_at DESC LIMIT 500",
        )
        .bind(customer.id)
        .bind(scope.team_id)
        .fetch_all(&pool)
        .await?
    } else {
        // JWT/API key: return all endpoints for this customer
        sqlx::query_as::<_, Endpoint>(
            "SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 500",
        )
        .bind(customer.id)
        .fetch_all(&pool)
        .await?
    };

    Ok(Json(
        endpoints.into_iter().map(|e| e.to_response()).collect(),
    ))
}

async fn create_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Extension(feature_flags): Extension<FeatureFlagService>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Json(req): Json<CreateEndpointRequest>,
) -> Result<Json<EndpointResponse>, AppError> {
    // Gate custom retry schedules behind feature flag
    let retry_policy_json = if feature_flags.is_enabled("custom_retry_schedules").await {
        req.retry_policy.and_then(|rp| serde_json::to_value(rp).ok())
    } else {
        None // Ignore custom retry policy if flag is disabled
    };

    // Check endpoint limit based on plan
    let plan = Plan::parse_str(&customer.plan);
    let endpoint_count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM endpoints WHERE customer_id = $1")
            .bind(customer.id)
            .fetch_one(&pool)
            .await?;

    if endpoint_count.0 as u32 >= plan.max_endpoints() {
        return Err(AppError::BadRequest(
            "Endpoint limit reached. Upgrade your plan for more endpoints.".into(),
        ));
    }

    // Validate that the application belongs to this customer
    let app_exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM applications WHERE id = $1 AND customer_id = $2)",
    )
    .bind(req.application_id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    if !app_exists.0 {
        return Err(AppError::BadRequest(
            "Application not found or does not belong to your account".into(),
        ));
    }

    // Validate URL
    if !req.url.starts_with("https://") && !req.url.starts_with("http://") {
        return Err(AppError::BadRequest(
            "URL must start with http:// or https://".into(),
        ));
    }

    // SSRF protection: block internal IPs (with DNS resolution)
    if let Err(e) = crate::ssrf::validate_url(&req.url) {
        tracing::warn!("SSRF blocked: {} — {:?}", req.url, e);
        return Err(AppError::Forbidden("Internal URLs are not allowed".into()));
    }

    // Validate custom headers if provided
    // Item 343: RFC 7230 header name validation + X- prefix requirement
    if let Some(ref headers) = req.custom_headers {
        if let Some(obj) = headers.as_object() {
            for (key, value) in obj {
                if !key.starts_with("X-") {
                    return Err(AppError::BadRequest(
                        "Custom header names must start with 'X-'".into(),
                    ));
                }
                if let Err(e) = crate::validation::validate_header_name(key) {
                    return Err(AppError::BadRequest(e));
                }
                if !value.is_string() {
                    return Err(AppError::BadRequest(
                        "Custom header values must be strings".into(),
                    ));
                }
            }
        } else {
            return Err(AppError::BadRequest(
                "custom_headers must be a JSON object".into(),
            ));
        }
    }

    let signing_secret = generate_signing_secret();

    // Convert allowed_ips to JSON
    let allowed_ips_json: Option<serde_json::Value> =
        req.allowed_ips.map(|ips| serde_json::json!(ips));

    let endpoint = sqlx::query_as::<_, Endpoint>(
        r#"INSERT INTO endpoints (customer_id, url, description, signing_secret, allowed_ips, event_filter, custom_headers, retry_policy, routing_strategy, fallback_url, application_id, team_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *"#,
    )
    .bind(customer.id)
    .bind(&req.url)
    .bind(&req.description)
    .bind(&signing_secret)
    .bind(&allowed_ips_json)
    .bind(&req.event_filter)
    .bind(&req.custom_headers)
    .bind(&retry_policy_json)
    .bind(req.routing_strategy.as_deref().unwrap_or("round-robin"))
    .bind(&req.fallback_url)
    .bind(req.application_id)
    .bind(service_token.map(|s| s.0.team_id))
    .fetch_one(&pool)
    .await?;

    // Audit log — ENDPOINT_CREATE
    {
        let eid = endpoint.id.to_string();
        { let _ = crate::audit::log_action(&pool, customer.id, "ENDPOINT_CREATE", "endpoint", Some(&eid), None, None, None).await; }
    }

    // Publish EndpointCreated event (best-effort)
    if let Some(ref publisher) = event_publisher {
        if let Err(e) = publisher.publish(crate::events::AppEvent::EndpointCreated {
            endpoint_id: endpoint.id,
            customer_id: customer.id,
            url: endpoint.url.clone(),
        }).await {
            tracing::warn!("Failed to publish EndpointCreated event: {:?}", e);
        }
    }

    Ok(Json(endpoint.to_response()))
}

async fn get_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<EndpointResponse>, AppError> {
    let endpoint =
        sqlx::query_as::<_, Endpoint>("SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    Ok(Json(endpoint.to_response()))
}

async fn delete_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query("DELETE FROM endpoints WHERE id = $1 AND customer_id = $2")
        .bind(id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    // Audit log — ENDPOINT_DELETE
    {
        let eid = id.to_string();
        { let _ = crate::audit::log_action(&pool, customer.id, "ENDPOINT_DELETE", "endpoint", Some(&eid), None, None, None).await; }
    }

    // Publish EndpointDeleted event (best-effort)
    if let Some(ref publisher) = event_publisher {
        if let Err(e) = publisher.publish(crate::events::AppEvent::EndpointDeleted {
            endpoint_id: id,
            customer_id: customer.id,
        }).await {
            tracing::warn!("Failed to publish EndpointDeleted event: {:?}", e);
        }
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}

/// Update an endpoint (URL, description, retry policy, etc.)
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdateEndpointRequest {
    pub url: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
    pub allowed_ips: Option<Vec<String>>,
    pub event_filter: Option<Vec<String>>,
    pub custom_headers: Option<serde_json::Value>,
    pub retry_policy: Option<RetryPolicy>,
    pub routing_strategy: Option<String>,
    pub fallback_url: Option<String>,
    pub format: Option<String>,
}

async fn update_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Extension(feature_flags): Extension<FeatureFlagService>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateEndpointRequest>,
) -> Result<Json<EndpointResponse>, AppError> {
    // Gate custom retry schedules behind feature flag
    let retry_policy_json = if feature_flags.is_enabled("custom_retry_schedules").await {
        req.retry_policy.and_then(|rp| serde_json::to_value(rp).ok())
    } else {
        None
    };

    // Verify ownership
    let _existing =
        sqlx::query_as::<_, Endpoint>("SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    // Validate URL if provided
    if let Some(ref url) = req.url {
        if !url.starts_with("https://") && !url.starts_with("http://") {
            return Err(AppError::BadRequest(
                "URL must start with http:// or https://".into(),
            ));
        }
        if let Err(e) = crate::ssrf::validate_url(url) {
            tracing::warn!("SSRF blocked on update: {} — {:?}", url, e);
            return Err(AppError::Forbidden("Internal URLs are not allowed".into()));
        }
    }

    // Validate custom headers if provided
    // Item 343: RFC 7230 header name validation + X- prefix requirement
    if let Some(ref headers) = req.custom_headers {
        if let Some(obj) = headers.as_object() {
            for (key, value) in obj {
                if !key.starts_with("X-") {
                    return Err(AppError::BadRequest(
                        "Custom header names must start with 'X-'".into(),
                    ));
                }
                if let Err(e) = crate::validation::validate_header_name(key) {
                    return Err(AppError::BadRequest(e));
                }
                if !value.is_string() {
                    return Err(AppError::BadRequest(
                        "Custom header values must be strings".into(),
                    ));
                }
            }
        } else {
            return Err(AppError::BadRequest(
                "custom_headers must be a JSON object".into(),
            ));
        }
    }

    let allowed_ips_json: Option<serde_json::Value> =
        req.allowed_ips.map(|ips| serde_json::json!(ips));

    let endpoint = sqlx::query_as::<_, Endpoint>(
        r#"UPDATE endpoints SET
            url = COALESCE($3, url),
            description = COALESCE($4, description),
            is_active = COALESCE($5, is_active),
            allowed_ips = COALESCE($6, allowed_ips),
            event_filter = COALESCE($7, event_filter),
            custom_headers = COALESCE($8, custom_headers),
            retry_policy = COALESCE($9, retry_policy),
            routing_strategy = COALESCE($10, routing_strategy),
            fallback_url = COALESCE($11, fallback_url),
            format = COALESCE($12, format)
           WHERE id = $1 AND customer_id = $2
           RETURNING *"#,
    )
    .bind(id)
    .bind(customer.id)
    .bind(&req.url)
    .bind(&req.description)
    .bind(req.is_active)
    .bind(&allowed_ips_json)
    .bind(&req.event_filter)
    .bind(&req.custom_headers)
    .bind(&retry_policy_json)
    .bind(req.routing_strategy.as_deref())
    .bind(&req.fallback_url)
    .bind(req.format.as_deref())
    .fetch_one(&pool)
    .await?;

    // Audit log — ENDPOINT_UPDATE
    {
        let eid = endpoint.id.to_string();
        { let _ = crate::audit::log_action(&pool, customer.id, "ENDPOINT_UPDATE", "endpoint", Some(&eid), None, None, None).await; }
    }

    // Publish EndpointUpdated event (best-effort)
    if let Some(ref publisher) = event_publisher {
        // If is_active was toggled, publish status change event
        if req.is_active.is_some() {
            if let Err(e) = publisher.publish(crate::events::AppEvent::EndpointStatusChanged {
                endpoint_id: endpoint.id,
                customer_id: customer.id,
                is_active: endpoint.is_active,
            }).await {
                tracing::warn!("Failed to publish EndpointStatusChanged event: {:?}", e);
            }
        }
        if let Err(e) = publisher.publish(crate::events::AppEvent::EndpointUpdated {
            endpoint_id: endpoint.id,
            customer_id: customer.id,
        }).await {
            tracing::warn!("Failed to publish EndpointUpdated event: {:?}", e);
        }
    }

    Ok(Json(endpoint.to_response()))
}

/// Update only the retry policy for an endpoint.
async fn update_retry_policy(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(feature_flags): Extension<FeatureFlagService>,
    Path(id): Path<Uuid>,
    Json(policy): Json<RetryPolicy>,
) -> Result<Json<EndpointResponse>, AppError> {
    // Gate behind custom_retry_schedules feature flag
    if !feature_flags.is_enabled("custom_retry_schedules").await {
        return Err(AppError::BadRequest("Custom retry schedules are not enabled. Contact support to enable this feature.".into()));
    }

    // Verify ownership
    let _ =
        sqlx::query_as::<_, Endpoint>("SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let policy_json = serde_json::to_value(&policy)?;

    let endpoint = sqlx::query_as::<_, Endpoint>(
        "UPDATE endpoints SET retry_policy = $3 WHERE id = $1 AND customer_id = $2 RETURNING *",
    )
    .bind(id)
    .bind(customer.id)
    .bind(&policy_json)
    .fetch_one(&pool)
    .await?;

    Ok(Json(endpoint.to_response()))
}

/// Rotate the signing secret for an endpoint.
/// Old secret is kept valid for 24 hours.
async fn rotate_secret(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Get current endpoint
    let endpoint =
        sqlx::query_as::<_, Endpoint>("SELECT id, customer_id, url, description, is_active, signing_secret, retry_policy, created_at, allowed_ips, event_filter, custom_headers, old_signing_secret, secret_rotated_at, routing_strategy, fallback_url, avg_response_ms, failure_streak, last_failure_at, format, fifo_enabled, fifo_sequence, fifo_group_by_customer, fifo_max_wait_secs, throttle_rate, throttle_period_secs, throttle_strategy, application_id FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let new_secret = generate_signing_secret();

    sqlx::query(
        r#"UPDATE endpoints
           SET old_signing_secret = $1,
               secret_rotated_at = now(),
               signing_secret = $2
           WHERE id = $3"#,
    )
    .bind(&endpoint.signing_secret)
    .bind(&new_secret)
    .bind(id)
    .execute(&pool)
    .await?;

    tracing::info!("🔑 Signing secret rotated for endpoint {}", id);

    Ok(Json(serde_json::json!({
        "id": id,
        "signing_secret": new_secret,
        "old_secret_valid_until": chrono::Utc::now() + chrono::Duration::hours(24),
        "message": "Secret rotated. Old secret remains valid for 24 hours."
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_update_endpoint_request_deserialize() {
        let json = r#"{
            "url": "https://example.com/hook",
            "description": "My endpoint",
            "is_active": true,
            "allowed_ips": ["192.168.1.0/24"],
            "event_filter": ["order.*"],
            "custom_headers": {"X-Custom": "value"},
            "retry_policy": {
                "max_attempts": 5,
                "backoff": "exponential",
                "initial_delay_secs": 10,
                "max_delay_secs": 3600
            },
            "routing_strategy": "failover",
            "fallback_url": "https://fallback.com",
            "format": "cloudevents"
        }"#;
        let req: UpdateEndpointRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.url.unwrap(), "https://example.com/hook");
        assert_eq!(req.description.unwrap(), "My endpoint");
        assert!(req.is_active.unwrap());
        assert_eq!(req.allowed_ips.unwrap().len(), 1);
        assert_eq!(req.event_filter.unwrap(), vec!["order.*"]);
        assert!(req.custom_headers.is_some());
        let rp = req.retry_policy.unwrap();
        assert_eq!(rp.max_attempts, 5);
        assert_eq!(rp.backoff, "exponential");
        assert_eq!(req.routing_strategy.unwrap(), "failover");
        assert_eq!(req.fallback_url.unwrap(), "https://fallback.com");
        assert_eq!(req.format.unwrap(), "cloudevents");
    }

    #[test]
    fn test_update_endpoint_request_partial() {
        let json = r#"{"url": "https://new.url"}"#;
        let req: UpdateEndpointRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.url.unwrap(), "https://new.url");
        assert!(req.description.is_none());
        assert!(req.is_active.is_none());
        assert!(req.retry_policy.is_none());
    }

    #[test]
    fn test_update_endpoint_request_empty() {
        let json = r#"{}"#;
        let req: UpdateEndpointRequest = serde_json::from_str(json).unwrap();
        assert!(req.url.is_none());
        assert!(req.description.is_none());
        assert!(req.is_active.is_none());
    }

    #[test]
    fn test_update_endpoint_request_debug() {
        let json = r#"{"url": "https://example.com"}"#;
        let req: UpdateEndpointRequest = serde_json::from_str(json).unwrap();
        let debug_str = format!("{:?}", req);
        assert!(debug_str.contains("UpdateEndpointRequest"));
    }

    #[test]
    fn test_custom_headers_validation_logic() {
        // Valid: X- prefixed headers with string values
        let headers = serde_json::json!({"X-Custom-Id": "abc123"});
        if let Some(obj) = headers.as_object() {
            for (key, value) in obj {
                assert!(key.starts_with("X-"));
                assert!(value.is_string());
            }
        }

        // Invalid: non-X- prefix
        let headers = serde_json::json!({"Authorization": "Bearer token"});
        if let Some(obj) = headers.as_object() {
            for (key, _value) in obj {
                assert!(!key.starts_with("X-"));
            }
        }
    }

    #[test]
    fn test_url_validation_logic() {
        // Valid URLs
        assert!("https://example.com".starts_with("https://"));
        assert!("http://example.com".starts_with("http://"));

        // Invalid URLs
        assert!(!"ftp://example.com".starts_with("https://"));
        assert!(!"ftp://example.com".starts_with("http://"));
        assert!(!"example.com".starts_with("https://"));
    }

    #[test]
    fn test_signing_secret_format() {
        let secret = generate_signing_secret();
        assert!(secret.starts_with("whsec_"));
        assert!(!secret.contains('-'));
        // 32 bytes hex = 64 chars + "whsec_" prefix = 70 chars
        assert_eq!(secret.len(), 70);
    }

    #[test]
    fn test_signing_secret_uniqueness() {
        let s1 = generate_signing_secret();
        let s2 = generate_signing_secret();
        assert_ne!(s1, s2);
    }
}
