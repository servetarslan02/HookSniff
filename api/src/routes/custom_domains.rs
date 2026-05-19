//! Custom Domains API
//!
//! Allows customers to configure custom domains for their webhook endpoints.
//!
//! ## Endpoints
//!
//! - `GET /custom-domains` — List custom domains
//! - `POST /custom-domains` — Add a custom domain
//! - `DELETE /custom-domains/:id` — Remove a custom domain
//! - `POST /custom-domains/:id/verify` — Verify domain ownership

use axum::{
    extract::{Extension, Path},
    routing::{delete, get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use rand::RngExt;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_domains))
        .route("/", post(add_domain))
        .route("/{id}", delete(delete_domain))
        .route("/{id}/verify", post(verify_domain))
        .route("/lookup/{domain}", get(lookup_domain_internal))
}

/// Custom domain response
#[derive(Debug, Serialize)]
pub struct CustomDomainResponse {
    pub id: Uuid,
    pub domain: String,
    pub verified: bool,
    pub ssl_active: bool,
    pub cname_target: String,
    pub txt_record: String,
    pub verified_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

/// Add custom domain request
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct AddDomainRequest {
    pub domain: String,
}

/// Generate a random verification token
fn generate_verification_token() -> String {
    let mut rng = rand::rng();
    (0..32)
        .map(|_| {
            let idx = rng.random_range(0..36);
            if idx < 10 {
                (b'0' + idx) as char
            } else {
                (b'a' + idx - 10) as char
            }
        })
        .collect()
}

/// GET /custom-domains — List all custom domains for the customer
async fn list_domains(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<CustomDomainResponse>>, AppError> {
    let rows = sqlx::query_as::<
        _,
        (
            Uuid,
            String,
            bool,
            bool,
            String,
            String,
            Option<DateTime<Utc>>,
            DateTime<Utc>,
        ),
    >(
        "SELECT id, domain, verified, ssl_active, cname_target, txt_record, verified_at, created_at
         FROM custom_domains WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let domains = rows
        .into_iter()
        .map(
            |(
                id,
                domain,
                verified,
                ssl_active,
                cname_target,
                txt_record,
                verified_at,
                created_at,
            )| {
                CustomDomainResponse {
                    id,
                    domain,
                    verified,
                    ssl_active,
                    cname_target,
                    txt_record,
                    verified_at,
                    created_at,
                }
            },
        )
        .collect();

    Ok(Json(domains))
}

/// POST /custom-domains — Add a new custom domain
async fn add_domain(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<AddDomainRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let domain = req.domain.trim().to_lowercase();

    // Validate domain format: max 253 chars, valid hostname pattern
    if domain.is_empty() || domain.len() > 253 || !domain.contains('.') {
        return Err(AppError::BadRequest("Invalid domain format".into()));
    }
    // Reject domains with invalid characters (only allow a-z, 0-9, hyphen, dot)
    if !domain
        .chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-' || c == '.')
    {
        return Err(AppError::BadRequest(
            "Domain contains invalid characters".into(),
        ));
    }
    // Reject domains starting/ending with hyphen
    if domain.starts_with('-') || domain.ends_with('-') {
        return Err(AppError::BadRequest(
            "Domain cannot start or end with hyphen".into(),
        ));
    }

    // Reject common domains
    let blocked = [
        "hooksniff.com",
        "hooksniff.vercel.app",
        "localhost",
        "example.com",
    ];
    if blocked
        .iter()
        .any(|b| domain == *b || domain.ends_with(&format!(".{}", b)))
    {
        return Err(AppError::BadRequest("Cannot use this domain".into()));
    }

    // Check if domain already exists
    let existing: Option<(Uuid,)> =
        sqlx::query_as("SELECT id FROM custom_domains WHERE domain = $1")
            .bind(&domain)
            .fetch_optional(&pool)
            .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest("Domain already registered".into()));
    }

    let verification_token = generate_verification_token();
    let cname_target = "cname.vercel-dns.com".to_string();
    let txt_record = format!("hooksniff-verify={}", verification_token);

    let id: (Uuid,) = sqlx::query_as(
        "INSERT INTO custom_domains (customer_id, domain, verification_token, cname_target, txt_record)
         VALUES ($1, $2, $3, $4, $5) RETURNING id"
    )
    .bind(customer.id)
    .bind(&domain)
    .bind(&verification_token)
    .bind(&cname_target)
    .bind(&txt_record)
    .fetch_one(&pool)
    .await?;

    // Add domain to Vercel project for automatic SSL
    let vercel_result = add_domain_to_vercel(&domain).await;
    match &vercel_result {
        Ok(_) => tracing::info!("✅ Domain added to Vercel: {}", domain),
        Err(e) => tracing::warn!("⚠️ Failed to add domain to Vercel (non-fatal): {}", e),
    }

    tracing::info!(
        "🌐 Custom domain added: {} for customer {}",
        domain,
        customer.id
    );

    Ok(Json(serde_json::json!({
        "id": id.0,
        "domain": domain,
        "cname_target": cname_target,
        "txt_record": txt_record,
        "instructions": {
            "step_1": format!("Add a CNAME record: {} → {}", domain, cname_target),
            "step_2": format!("Add a TXT record: _hooksniff.{} → {}", domain, txt_record),
            "step_3": "Click verify after DNS records propagate (usually 5-30 minutes)"
        }
    })))
}

/// DELETE /custom-domains/:id — Remove a custom domain
async fn delete_domain(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(domain_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Get domain name before deleting
    let domain_name: Option<(String,)> = sqlx::query_as(
        "SELECT domain FROM custom_domains WHERE id = $1 AND customer_id = $2"
    )
    .bind(domain_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    let result = sqlx::query("DELETE FROM custom_domains WHERE id = $1 AND customer_id = $2")
        .bind(domain_id)
        .bind(customer.id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    // Remove domain from Vercel (best-effort)
    if let Some(ref domain) = domain_name {
        let _ = remove_domain_from_vercel(domain).await;
    }

    Ok(Json(serde_json::json!({
        "deleted": true,
    })))
}

/// POST /custom-domains/:id/verify — Verify domain ownership via DNS
async fn verify_domain(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(domain_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let domain = sqlx::query_as::<_, (String, String, bool, String)>(
        "SELECT domain, txt_record, verified, cname_target FROM custom_domains WHERE id = $1 AND customer_id = $2"
    )
    .bind(domain_id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let (domain_name, txt_record, already_verified, _cname_target) = domain;

    if already_verified {
        return Ok(Json(serde_json::json!({
            "verified": true,
            "message": "Domain is already verified"
        })));
    }

    // Check DNS TXT record
    let txt_check = verify_dns_txt(&domain_name, &txt_record).await;
    let cname_check = verify_dns_cname(&domain_name).await;

    if txt_check && cname_check {
        sqlx::query(
            "UPDATE custom_domains SET verified = true, ssl_active = true, verified_at = now(), updated_at = now() WHERE id = $1"
        )
        .bind(domain_id)
        .execute(&pool)
        .await?;

        tracing::info!("✅ Domain verified: {}", domain_name);

        Ok(Json(serde_json::json!({
            "verified": true,
            "message": "Domain verified successfully! SSL will be provisioned shortly.",
        })))
    } else {
        let mut missing = Vec::new();
        if !txt_check {
            missing.push("TXT record not found");
        }
        if !cname_check {
            missing.push("CNAME record not found");
        }

        Ok(Json(serde_json::json!({
            "verified": false,
            "issues": missing,
            "hint": "DNS changes can take up to 30 minutes to propagate. Try again later."
        })))
    }
}

/// Verify DNS TXT record exists
async fn verify_dns_txt(domain: &str, expected: &str) -> bool {
    // Use tokio::process to run dig/nslookup
    let output = tokio::process::Command::new("dig")
        .args(["+short", "TXT", &format!("_hooksniff.{}", domain)])
        .output()
        .await;

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            stdout.contains(expected)
        }
        Err(_) => {
            // Fallback: try nslookup
            let output = tokio::process::Command::new("nslookup")
                .args(["-type=TXT", &format!("_hooksniff.{}", domain)])
                .output()
                .await;

            match output {
                Ok(out) => {
                    let stdout = String::from_utf8_lossy(&out.stdout);
                    stdout.contains(expected)
                }
                Err(_) => false,
            }
        }
    }
}

/// Verify DNS CNAME record exists
async fn verify_dns_cname(domain: &str) -> bool {
    let output = tokio::process::Command::new("dig")
        .args(["+short", "CNAME", domain])
        .output()
        .await;

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout).to_lowercase();
            // Accept CNAME pointing to Vercel DNS or HookSniff domains
            stdout.contains("vercel-dns.com")
                || stdout.contains("hooksniff.app")
                || stdout.contains("hooksniff.com")
        }
        Err(_) => {
            // Fallback: try nslookup
            let output = tokio::process::Command::new("nslookup")
                .args(["-type=CNAME", domain])
                .output()
                .await;

            match output {
                Ok(out) => {
                    let stdout = String::from_utf8_lossy(&out.stdout).to_lowercase();
                    stdout.contains("vercel-dns.com")
                        || stdout.contains("hooksniff.app")
                        || stdout.contains("hooksniff.com")
                }
                Err(_) => false,
            }
        }
    }
}

/// Add a custom domain to the Vercel project for automatic SSL provisioning.
async fn add_domain_to_vercel(domain: &str) -> Result<(), String> {
    let vercel_token = std::env::var("VERCEL_API_TOKEN").map_err(|_| "VERCEL_API_TOKEN not set")?;
    let project_id = std::env::var("VERCEL_PROJECT_ID")
        .map_err(|_| "VERCEL_PROJECT_ID not set")?;
    let team_id = std::env::var("VERCEL_TEAM_ID")
        .map_err(|_| "VERCEL_TEAM_ID not set")?;

    let client = crate::http_client::get_client().clone();
    let url = format!(
        "https://api.vercel.com/v10/projects/{}/domains?teamId={}",
        project_id, team_id
    );

    let resp = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", vercel_token))
        .header("Content-Type", "application/json")
        .json(&serde_json::json!({ "name": domain }))
        .send()
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;

    let status = resp.status();
    if status.is_success() {
        Ok(())
    } else {
        let body = resp.text().await.unwrap_or_default();
        Err(format!("Vercel API error ({}): {}", status, body))
    }
}

/// Remove a custom domain from the Vercel project.
async fn remove_domain_from_vercel(domain: &str) -> Result<(), String> {
    let vercel_token = std::env::var("VERCEL_API_TOKEN").map_err(|_| "VERCEL_API_TOKEN not set")?;
    let project_id = std::env::var("VERCEL_PROJECT_ID")
        .map_err(|_| "VERCEL_PROJECT_ID not set")?;
    let team_id = std::env::var("VERCEL_TEAM_ID")
        .map_err(|_| "VERCEL_TEAM_ID not set")?;

    let client = crate::http_client::get_client().clone();
    let url = format!(
        "https://api.vercel.com/v9/projects/{}/domains/{}?teamId={}",
        project_id, domain, team_id
    );

    let resp = client
        .delete(&url)
        .header("Authorization", format!("Bearer {}", vercel_token))
        .send()
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;

    let status = resp.status();
    if status.is_success() || status.as_u16() == 404 {
        Ok(())
    } else {
        let body = resp.text().await.unwrap_or_default();
        Err(format!("Vercel API error ({}): {}", status, body))
    }
}

/// GET /custom-domains/lookup/:domain — Internal: look up customer by custom domain
/// Used by Cloudflare Worker to route custom domain requests to the right customer.
/// Returns customer_id and cname_target if domain is verified.
async fn lookup_domain_internal(
    Extension(pool): Extension<PgPool>,
    Path(domain): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    let domain = domain.trim().to_lowercase();

    let row: Option<(uuid::Uuid, String, bool)> = sqlx::query_as(
        "SELECT customer_id, cname_target, verified FROM custom_domains WHERE domain = $1"
    )
    .bind(&domain)
    .fetch_optional(&pool)
    .await?;

    match row {
        Some((customer_id, cname_target, verified)) => {
            if !verified {
                return Ok(Json(serde_json::json!({
                    "found": false,
                    "reason": "domain_not_verified"
                })));
            }
            Ok(Json(serde_json::json!({
                "found": true,
                "customer_id": customer_id,
                "cname_target": cname_target,
            })))
        }
        None => {
            Ok(Json(serde_json::json!({
                "found": false,
                "reason": "domain_not_found"
            })))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_custom_domains_router_construction() {
        let _router = router();
    }

    #[test]
    fn test_generate_verification_token() {
        let token = generate_verification_token();
        assert_eq!(token.len(), 32);
        assert!(token.chars().all(|c| c.is_ascii_alphanumeric()));
    }

    #[test]
    fn test_generate_verification_token_unique() {
        let t1 = generate_verification_token();
        let t2 = generate_verification_token();
        assert_ne!(t1, t2);
    }

    #[test]
    fn test_add_domain_request_valid() {
        let json = r#"{"domain":"hooks.example.com"}"#;
        let req: AddDomainRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.domain, "hooks.example.com");
    }

    #[test]
    fn test_custom_domain_response_serialization() {
        let resp = CustomDomainResponse {
            id: Uuid::new_v4(),
            domain: "hooks.example.com".to_string(),
            verified: false,
            ssl_active: false,
            cname_target: "abc12345.hooksniff.app".to_string(),
            txt_record: "hooksniff-verify=abc123".to_string(),
            verified_at: None,
            created_at: Utc::now(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["domain"], "hooks.example.com");
        assert!(!json["verified"].as_bool().unwrap());
    }
}
