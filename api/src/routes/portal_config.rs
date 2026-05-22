//! Portal Configuration API
//!
//! Allows customers to customize their embedded webhook portal.
//!
//! ## Endpoints
//!
//! - `GET /portal/config` — Get portal configuration
//! - `POST /portal/config` — Create/update portal configuration
//! - `GET /portal/embed-code` — Get embed code snippet

use axum::{
    extract::Extension,
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::error::ErrorCode;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/config", get(get_portal_config))
        .route("/config", post(upsert_portal_config))
        .route("/embed-code", get(get_embed_code))
}

/// Portal configuration response
#[derive(Debug, Serialize)]
pub struct PortalConfigResponse {
    pub id: Option<Uuid>,
    pub company_name: Option<String>,
    pub logo_url: Option<String>,
    pub primary_color: String,
    pub font_family: String,
    pub dark_mode: bool,
    pub show_events: bool,
    pub show_deliveries: bool,
    pub allowed_events: Vec<String>,
    pub custom_css: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

/// Portal configuration update request
#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct UpdatePortalRequest {
    pub company_name: Option<String>,
    pub logo_url: Option<String>,
    pub primary_color: Option<String>,
    pub font_family: Option<String>,
    pub dark_mode: Option<bool>,
    pub show_events: Option<bool>,
    pub show_deliveries: Option<bool>,
    pub allowed_events: Option<Vec<String>>,
    pub custom_css: Option<String>,
}

/// GET /portal/config — Get portal configuration for the authenticated customer
async fn get_portal_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<PortalConfigResponse>, AppError> {
    // RBAC: developer or higher to view portal config
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

    let config = sqlx::query_as::<_, (Uuid, Option<String>, Option<String>, Option<String>, Option<String>, Option<bool>, Option<bool>, Option<bool>, Option<Vec<String>>, Option<String>, Option<DateTime<Utc>>, Option<DateTime<Utc>>)>(
        "SELECT id, company_name, logo_url, primary_color, font_family, dark_mode, show_events, show_deliveries, allowed_events, custom_css, created_at, updated_at
         FROM portal_configs WHERE customer_id = $1"
    )
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?;

    match config {
        Some((
            id,
            company_name,
            logo_url,
            primary_color,
            font_family,
            dark_mode,
            show_events,
            show_deliveries,
            allowed_events,
            custom_css,
            created_at,
            updated_at,
        )) => Ok(Json(PortalConfigResponse {
            id: Some(id),
            company_name,
            logo_url,
            primary_color: primary_color.unwrap_or_else(|| "#6366f1".to_string()),
            font_family: font_family.unwrap_or_else(|| "Inter".to_string()),
            dark_mode: dark_mode.unwrap_or(true),
            show_events: show_events.unwrap_or(true),
            show_deliveries: show_deliveries.unwrap_or(true),
            allowed_events: allowed_events.unwrap_or_default(),
            custom_css,
            created_at,
            updated_at,
        })),
        None => Ok(Json(PortalConfigResponse {
            id: None,
            company_name: None,
            logo_url: None,
            primary_color: "#6366f1".to_string(),
            font_family: "Inter".to_string(),
            dark_mode: true,
            show_events: true,
            show_deliveries: true,
            allowed_events: vec![],
            custom_css: None,
            created_at: None,
            updated_at: None,
        })),
    }
}

/// POST /portal/config — Create or update portal configuration
async fn upsert_portal_config(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<UpdatePortalRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    // RBAC: developer or higher to update portal config
    super::teams::check_user_team_role(&pool, customer.id, "developer").await?;

    // Validate color format
    if let Some(ref color) = req.primary_color {
        if !color.starts_with('#') || color.len() != 7 {
            return Err(AppError::BadRequest(
                "primary_color must be a hex color (e.g. #6366f1)".into(),
            ));
        }
        // Validate hex characters
        if !color[1..].chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(AppError::BadRequest(
                "primary_color contains invalid hex characters".into(),
            ));
        }
    }

    // Validate custom CSS length and sanitize
    if let Some(ref css) = req.custom_css {
        if css.len() > 10_000 {
            return Err(AppError::coded(ErrorCode::CssTooLarge));
        }
        // Reject CSS containing dangerous patterns (XSS prevention)
        let lower = css.to_lowercase();
        let dangerous = [
            "<script",
            "</script",
            "javascript:",
            "expression(",
            "url(data:",
            "behavior:",
            "-moz-binding",
            "vbscript:",
            "<iframe",
            "</iframe",
            "<object",
            "<embed",
            "onerror",
            "onload",
            "onclick",
            "onmouseover",
        ];
        for pattern in &dangerous {
            if lower.contains(pattern) {
                return Err(AppError::BadRequest(format!(
                    "custom_css contains forbidden pattern: {}",
                    pattern
                )));
            }
        }
    }

    sqlx::query(
        r#"INSERT INTO portal_configs (customer_id, company_name, logo_url, primary_color, font_family, dark_mode, show_events, show_deliveries, allowed_events, custom_css)
           VALUES ($1, $2, $3, COALESCE($4, '#6366f1'), COALESCE($5, 'Inter'), COALESCE($6, true), COALESCE($7, true), COALESCE($8, true), $9, $10)
           ON CONFLICT (customer_id) DO UPDATE SET
               company_name = COALESCE(EXCLUDED.company_name, portal_configs.company_name),
               logo_url = COALESCE(EXCLUDED.logo_url, portal_configs.logo_url),
               primary_color = COALESCE(EXCLUDED.primary_color, portal_configs.primary_color),
               font_family = COALESCE(EXCLUDED.font_family, portal_configs.font_family),
               dark_mode = COALESCE(EXCLUDED.dark_mode, portal_configs.dark_mode),
               show_events = COALESCE(EXCLUDED.show_events, portal_configs.show_events),
               show_deliveries = COALESCE(EXCLUDED.show_deliveries, portal_configs.show_deliveries),
               allowed_events = COALESCE(EXCLUDED.allowed_events, portal_configs.allowed_events),
               custom_css = COALESCE(EXCLUDED.custom_css, portal_configs.custom_css),
               updated_at = now()"#
    )
    .bind(customer.id)
    .bind(&req.company_name)
    .bind(&req.logo_url)
    .bind(&req.primary_color)
    .bind(&req.font_family)
    .bind(req.dark_mode)
    .bind(req.show_events)
    .bind(req.show_deliveries)
    .bind(&req.allowed_events)
    .bind(&req.custom_css)
    .execute(&pool)
    .await?;

    tracing::info!("🎨 Portal config updated for customer {}", customer.id);

    Ok(Json(serde_json::json!({
        "updated": true,
    })))
}

/// GET /portal/embed-code — Get the embed code snippet
async fn get_embed_code(Extension(customer): Extension<Customer>) -> Json<serde_json::Value> {
    let _portal_id = customer.id.to_string();
    let api_base = "https://hooksniff-api-1046140057667.europe-west1.run.app";
    let dashboard_base = "https://hooksniff.vercel.app";

    let iframe_code = format!(
        r#"<iframe
  src="{}/v1/embed/portal"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);"
></iframe>"#,
        api_base
    );

    let script_code = format!(
        r##"<script
  src="{}/portal/embed.js"
  data-api-key="YOUR_API_KEY"
  data-api-url="{}/v1"
  data-theme="dark"
  data-height="600px"
></script>"##,
        dashboard_base, api_base
    );

    Json(serde_json::json!({
        "iframe": iframe_code,
        "script": script_code,
        "portal_url": format!("{}/v1/embed/portal", api_base),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_portal_config_router_construction() {
        let _router = router();
    }

    #[test]
    fn test_update_portal_request_defaults() {
        let json = r#"{}"#;
        let req: UpdatePortalRequest = serde_json::from_str(json).unwrap();
        assert!(req.company_name.is_none());
        assert!(req.primary_color.is_none());
    }

    #[test]
    fn test_update_portal_request_full() {
        let json = r##"{"company_name":"Acme","primary_color":"#ff0000","dark_mode":false}"##;
        let req: UpdatePortalRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.company_name.unwrap(), "Acme");
        assert_eq!(req.primary_color.unwrap(), "#ff0000");
        assert!(!req.dark_mode.unwrap());
    }

    #[test]
    fn test_portal_config_response_defaults() {
        let resp = PortalConfigResponse {
            id: None,
            company_name: None,
            logo_url: None,
            primary_color: "#6366f1".to_string(),
            font_family: "Inter".to_string(),
            dark_mode: true,
            show_events: true,
            show_deliveries: true,
            allowed_events: vec![],
            custom_css: None,
            created_at: None,
            updated_at: None,
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["primary_color"], "#6366f1");
        assert!(json["dark_mode"].as_bool().unwrap());
    }
}
