use axum::extract::{Extension, Path};
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::middleware::generate_api_key;
use crate::models::customer::Customer;
use crate::models::endpoint::{CreateEndpointRequest, Endpoint, EndpointResponse};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_endpoints).post(create_endpoint))
        .route("/{id}", get(get_endpoint).delete(delete_endpoint))
}

async fn list_endpoints(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<EndpointResponse>>, AppError> {
    let endpoints = sqlx::query_as::<_, Endpoint>(
        "SELECT * FROM endpoints WHERE customer_id = $1 ORDER BY created_at DESC"
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
        return Err(AppError::BadRequest("URL must start with http:// or https://".into()));
    }

    // SSRF protection: block internal IPs
    if is_internal_url(&req.url) {
        return Err(AppError::Forbidden("Internal URLs are not allowed".into()));
    }

    let signing_secret = format!("whsec_{}", Uuid::new_v4().to_string().replace('-', ""));

    let endpoint = sqlx::query_as::<_, Endpoint>(
        "INSERT INTO endpoints (customer_id, url, description, signing_secret) VALUES ($1, $2, $3, $4) RETURNING *"
    )
    .bind(customer.id)
    .bind(&req.url)
    .bind(&req.description)
    .bind(&signing_secret)
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
        "SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2"
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
    let result = sqlx::query(
        "DELETE FROM endpoints WHERE id = $1 AND customer_id = $2"
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({"deleted": true})))
}

fn is_internal_url(url: &str) -> bool {
    let parsed = match url::Url::parse(url) {
        Ok(u) => u,
        Err(_) => return true, // Invalid URL = block
    };

    let host = match parsed.host_str() {
        Some(h) => h,
        None => return true,
    };

    // Block common internal hostnames
    let blocked_hosts = ["localhost", "localhost.localdomain", "ip6-localhost"];
    if blocked_hosts.iter().any(|&b| host.eq_ignore_ascii_case(b)) {
        return true;
    }

    // Block .local, .internal, .localhost TLDs
    if host.ends_with(".local") || host.ends_with(".internal") || host.ends_with(".localhost") {
        return true;
    }

    // Try to parse as IP
    if let Ok(ip) = host.parse::<std::net::IpAddr>() {
        return is_private_ip(ip);
    }

    // Block IP-like patterns in hostname (hex, octal, decimal)
    if host.starts_with("0x") || host.starts_with("0X") {
        return true;
    }

    // Check for numeric patterns like 127.0.0.1.nip.io
    let parts: Vec<&str> = host.split('.').collect();
    if parts.len() >= 4 {
        if parts[0].parse::<u8>().is_ok() && parts[1].parse::<u8>().is_ok() {
            return true; // Looks like an IP in a hostname
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
                || v4.octets()[0] == 100 && (v4.octets()[1] & 0xC0) == 64 // 100.64.0.0/10
                || v4.octets()[0] == 169 && v4.octets()[1] == 254 // 169.254.0.0/16
                || v4.octets()[0] == 192 && v4.octets()[1] == 168 // 192.168.0.0/16
                || v4.octets()[0] == 172 && (v4.octets()[1] & 0xF0) == 16 // 172.16.0.0/12
        }
        std::net::IpAddr::V6(v6) => {
            v6.is_loopback()
                || v6.is_unspecified()
                || {
                    let segments = v6.segments();
                    segments[0] == 0xfe80 // link-local
                        || segments[0] == 0xfc00 || segments[0] == 0xfd00 // unique local
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
