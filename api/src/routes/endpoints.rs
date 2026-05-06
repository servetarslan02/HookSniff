use axum::extract::{Extension, Path};
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::endpoint::{CreateEndpointRequest, Endpoint, EndpointResponse};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_endpoints).post(create_endpoint))
        .route("/{id}", get(get_endpoint).delete(delete_endpoint))
        .route("/{id}/rotate-secret", post(rotate_secret))
}

async fn list_endpoints(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<EndpointResponse>>, AppError> {
    let endpoints = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(endpoints.into_iter().map(|e| e.to_response()).collect()))
}

async fn create_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<CreateEndpointRequest>,
) -> Result<Json<EndpointResponse>, AppError> {
    // Validate URL
    if !req.url.starts_with("https://") && !req.url.starts_with("http://") {
        return Err(AppError::BadRequest(
            "URL must start with http:// or https://".into(),
        ));
    }

    // SSRF protection: block internal IPs (with DNS resolution)
    if let Err(e) = crate::ssrf::validate_url(&req.url) {
        return Err(AppError::Forbidden(format!("Internal URLs are not allowed: {}", e)));
    }

    // Validate custom headers if provided
    if let Some(ref headers) = req.custom_headers {
        if let Some(obj) = headers.as_object() {
            for (key, value) in obj {
                if !key.starts_with("X-") {
                    return Err(AppError::BadRequest(
                        "Custom header names must start with 'X-'".into(),
                    ));
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

    let signing_secret = format!("whsec_{}", Uuid::new_v4().to_string().replace('-', ""));

    // Convert allowed_ips to JSON
    let allowed_ips_json: Option<serde_json::Value> =
        req.allowed_ips.map(|ips| serde_json::json!(ips));

    // Convert retry_policy to JSON
    let retry_policy_json: Option<serde_json::Value> =
        req.retry_policy.and_then(|rp| serde_json::to_value(rp).ok());

    let endpoint = sqlx::query_as::<_, Endpoint>(
        r#"INSERT INTO endpoints (customer_id, url, description, signing_secret, allowed_ips, event_filter, custom_headers, retry_policy, routing_strategy, fallback_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"#,
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
    .fetch_one(&pool)
    .await?;

    Ok(Json(endpoint.to_response()))
}

async fn get_endpoint(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<EndpointResponse>, AppError> {
    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2",
    )
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

    Ok(Json(serde_json::json!({"deleted": true})))
}

/// Rotate the signing secret for an endpoint.
/// Old secret is kept valid for 24 hours.
async fn rotate_secret(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Get current endpoint
    let endpoint = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let new_secret = format!("whsec_{}", Uuid::new_v4().to_string().replace('-', ""));

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

fn is_internal_url(url: &str) -> bool {
    let parsed = match url::Url::parse(url) {
        Ok(u) => u,
        Err(_) => return true,
    };

    let host = match parsed.host_str() {
        Some(h) => h,
        None => return true,
    };

    let blocked_hosts = ["localhost", "localhost.localdomain", "ip6-localhost"];
    if blocked_hosts
        .iter()
        .any(|&b| host.eq_ignore_ascii_case(b))
    {
        return true;
    }

    if host.ends_with(".local")
        || host.ends_with(".internal")
        || host.ends_with(".localhost")
    {
        return true;
    }

    if let Ok(ip) = host.parse::<std::net::IpAddr>() {
        return is_private_ip(ip);
    }

    if host.starts_with("0x") || host.starts_with("0X") {
        return true;
    }

    let parts: Vec<&str> = host.split('.').collect();
    if parts.len() >= 4 {
        if parts[0].parse::<u8>().is_ok() && parts[1].parse::<u8>().is_ok() {
            return true;
        }
    }

    false
}

fn is_private_ip(ip: std::net::IpAddr) -> bool {
    match ip {
        std::net::IpAddr::V4(v4) => {
            v4.is_loopback()
                || v4.is_private()
                || v4.is_link_local()
                || v4.is_broadcast()
                || v4.is_unspecified()
                || v4.octets()[0] == 100 && (v4.octets()[1] & 0xC0) == 64
                || v4.octets()[0] == 169 && v4.octets()[1] == 254
                || v4.octets()[0] == 192 && v4.octets()[1] == 168
                || v4.octets()[0] == 172 && (v4.octets()[1] & 0xF0) == 16
        }
        std::net::IpAddr::V6(v6) => {
            v6.is_loopback()
                || v6.is_unspecified()
                || {
                    let segments = v6.segments();
                    segments[0] == 0xfe80
                        || segments[0] == 0xfc00
                        || segments[0] == 0xfd00
                }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_internal_url_detection() {
        assert!(is_internal_url("http://localhost:3000"));
        assert!(is_internal_url("http://127.0.0.1/"));
        assert!(is_internal_url("http://192.168.1.1/"));
        assert!(is_internal_url("http://10.0.0.1/"));
        assert!(is_internal_url("http://172.16.0.1/"));
        assert!(is_internal_url("http://0.0.0.0/"));
        assert!(is_internal_url("http://169.254.1.1/"));
        assert!(is_internal_url("http://[::1]/"));
        assert!(!is_internal_url("https://example.com"));
        assert!(!is_internal_url("https://myapp.com/webhook"));
    }
}
