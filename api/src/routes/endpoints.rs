use axum::extract::{Extension, Path};
use axum::routing::{delete, get, post};
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::billing::Plan;
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
    // Check endpoint limit based on plan
    let plan = Plan::from_str(&customer.plan);
    let endpoint_count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM endpoints WHERE customer_id = $1"
    )
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    if endpoint_count.0 as u32 >= plan.max_endpoints() {
        return Err(AppError::BadRequest(format!(
            "Endpoint limit reached ({}/{}). Upgrade your plan for more endpoints.",
            endpoint_count.0,
            plan.max_endpoints()
        )));
    }

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

#[cfg(test)]
mod tests {
    // Tests moved to ssrf.rs — endpoint creation uses crate::ssrf::validate_url
}
