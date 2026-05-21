use axum::extract::{Extension, Path};
use axum::http::StatusCode;
use axum::{Json, Router};
use axum::routing::{get, post, put, delete};
use chrono::Utc;
use sqlx::PgPool;
use uuid::Uuid;

use crate::billing::polar::PolarConfig;
use crate::error::ErrorCode;
use crate::error::AppError;
use crate::models::coupon::*;

use super::require_admin;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_coupons).post(create_coupon))
        .route("/{id}", get(get_coupon).put(update_coupon).delete(delete_coupon))
        .route("/{id}/sync", post(sync_to_polar))
}

// ──────────────────────────────────────────────────────────────
// GET /admin/coupons — List all coupons
// ──────────────────────────────────────────────────────────────

pub async fn list_coupons(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
) -> Result<Json<Vec<CouponCode>>, AppError> {
    require_admin(&customer)?;

    let coupons = sqlx::query_as::<_, CouponCode>(
        "SELECT * FROM coupon_codes ORDER BY created_at DESC"
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(coupons))
}

// ──────────────────────────────────────────────────────────────
// GET /admin/coupons/:id — Get single coupon
// ──────────────────────────────────────────────────────────────

pub async fn get_coupon(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<CouponCode>, AppError> {
    require_admin(&customer)?;

    let coupon = sqlx::query_as::<_, CouponCode>(
        "SELECT * FROM coupon_codes WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(coupon))
}

// ──────────────────────────────────────────────────────────────
// POST /admin/coupons — Create a new coupon
// ──────────────────────────────────────────────────────────────

pub async fn create_coupon(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Json(req): Json<CreateCouponRequest>,
) -> Result<(StatusCode, Json<CouponCode>), AppError> {
    require_admin(&customer)?;

    // Validate type
    if req.coupon_type != "polar" && req.coupon_type != "internal" {
        return Err(AppError::coded(ErrorCode::InvalidPaymentType));
    }

    // Validate discount_type
    if req.discount_type != "percentage" && req.discount_type != "free_month" {
        return Err(AppError::coded(ErrorCode::InvalidDiscountType));
    }

    // Validate discount_value
    if req.discount_type == "percentage" && (req.discount_value < 0 || req.discount_value > 100) {
        return Err(AppError::coded(ErrorCode::InvalidPercentage));
    }
    if req.discount_type == "free_month" && req.discount_value < 1 {
        return Err(AppError::coded(ErrorCode::InvalidFreeMonths));
    }

    // Check code uniqueness
    let existing = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM coupon_codes WHERE UPPER(code) = UPPER($1)"
    )
    .bind(&req.code)
    .fetch_one(&pool)
    .await?;

    if existing > 0 {
        return Err(AppError::coded(ErrorCode::CouponDuplicate));
    }

    // Parse expires_at if provided
    let expires_at = req.expires_at.as_deref().map(|s| {
        chrono::DateTime::parse_from_rfc3339(s)
            .map(|dt| dt.with_timezone(&Utc))
            .or_else(|_| chrono::NaiveDate::parse_from_str(s, "%Y-%m-%d")
                .map(|d| d.and_hms_opt(0, 0, 0).unwrap().and_utc()))
            .map_err(|_| AppError::BadRequest("Invalid expires_at format".into()))
    }).transpose()?;

    let coupon = sqlx::query_as::<_, CouponCode>(
        "INSERT INTO coupon_codes (code, type, discount_type, discount_value, target_plan, max_redemptions, expires_at, created_by) \
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) \
         RETURNING *"
    )
    .bind(req.code.to_uppercase())
    .bind(&req.coupon_type)
    .bind(&req.discount_type)
    .bind(req.discount_value)
    .bind(&req.target_plan)
    .bind(req.max_redemptions)
    .bind(expires_at)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    // Audit log
    let _ = crate::audit::log_action(
        &pool, customer.id, "COUPON_CREATE", "coupon",
        Some(&coupon.id.to_string()),
        Some(serde_json::json!({
            "code": coupon.code,
            "type": coupon.coupon_type,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value
        })),
        None, None,
    ).await;

    Ok((StatusCode::CREATED, Json(coupon)))
}

// ──────────────────────────────────────────────────────────────
// PUT /admin/coupons/:id — Update coupon (toggle active, limits)
// ──────────────────────────────────────────────────────────────

pub async fn update_coupon(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateCouponRequest>,
) -> Result<Json<CouponCode>, AppError> {
    require_admin(&customer)?;

    // Validate type if provided
    if let Some(ref coupon_type) = req.coupon_type {
        if coupon_type != "polar" && coupon_type != "internal" {
            return Err(AppError::coded(ErrorCode::InvalidPaymentType));
        }
    }

    // Validate discount_type if provided
    if let Some(ref discount_type) = req.discount_type {
        if discount_type != "percentage" && discount_type != "free_month" {
            return Err(AppError::coded(ErrorCode::InvalidDiscountType));
        }
    }

    // Validate discount_value if provided
    if let Some(discount_value) = req.discount_value {
        if discount_value < 0 || discount_value > 100 {
            return Err(AppError::coded(ErrorCode::InvalidDiscountValue));
        }
    }

    // Check code uniqueness if code is being changed
    if let Some(ref code) = req.code {
        let existing = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM coupon_codes WHERE UPPER(code) = UPPER($1) AND id != $2"
        )
        .bind(code)
        .bind(id)
        .fetch_one(&pool)
        .await?;

        if existing > 0 {
            return Err(AppError::coded(ErrorCode::CouponDuplicate));
        }
    }

    let expires_at = req.expires_at.as_deref().map(|s| {
        chrono::DateTime::parse_from_rfc3339(s)
            .map(|dt| dt.with_timezone(&Utc))
            .or_else(|_| chrono::NaiveDate::parse_from_str(s, "%Y-%m-%d")
                .map(|d| d.and_hms_opt(0, 0, 0).unwrap().and_utc()))
            .map_err(|_| AppError::BadRequest("Invalid expires_at format".into()))
    }).transpose()?;

    let coupon = sqlx::query_as::<_, CouponCode>(
        "UPDATE coupon_codes SET \
         code = COALESCE($2, code), \
         type = COALESCE($3, type), \
         discount_type = COALESCE($4, discount_type), \
         discount_value = COALESCE($5, discount_value), \
         target_plan = COALESCE($6, target_plan), \
         is_active = COALESCE($7, is_active), \
         max_redemptions = COALESCE($8, max_redemptions), \
         expires_at = COALESCE($9, expires_at), \
         updated_at = NOW() \
         WHERE id = $1 RETURNING *"
    )
    .bind(id)
    .bind(req.code.map(|c| c.to_uppercase()))
    .bind(req.coupon_type)
    .bind(req.discount_type)
    .bind(req.discount_value)
    .bind(req.target_plan)
    .bind(req.is_active)
    .bind(req.max_redemptions)
    .bind(expires_at)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(coupon))
}

// ──────────────────────────────────────────────────────────────
// DELETE /admin/coupons/:id — Delete coupon
// ──────────────────────────────────────────────────────────────

pub async fn delete_coupon(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    require_admin(&customer)?;

    let result = sqlx::query("DELETE FROM coupon_codes WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(StatusCode::NO_CONTENT)
}

// ──────────────────────────────────────────────────────────────
// POST /admin/coupons/:id/sync — Sync polar coupon to Polar.sh
// ──────────────────────────────────────────────────────────────

pub async fn sync_to_polar(
    Extension(pool): Extension<PgPool>,
    Extension(cfg): Extension<crate::config::Config>,
    Extension(customer): Extension<crate::models::customer::Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<CouponCode>, AppError> {
    require_admin(&customer)?;

    let coupon = sqlx::query_as::<_, CouponCode>(
        "SELECT * FROM coupon_codes WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    if coupon.coupon_type != "polar" {
        return Err(AppError::coded(ErrorCode::PolarSyncOnly));
    }

    // Create discount in Polar
    let polar_cfg = PolarConfig::from_env()
        .ok_or(AppError::Internal(anyhow::anyhow!("Polar not configured")))?;
    let client = crate::http_client::get_client();

    let basis_points = (coupon.discount_value as u64) * 100; // e.g., 50% = 5000 basis points

    let mut polar_body = serde_json::json!({
        "name": coupon.code,
        "code": coupon.code,
        "type": if coupon.discount_type == "free_month" { "percentage" } else { "percentage" },
        "basis_points": if coupon.discount_type == "free_month" { 10000 } else { basis_points },
        "duration": "once"
    });

    if let Some(ref expires_at) = coupon.expires_at {
        polar_body["ends_at"] = serde_json::json!(expires_at.to_rfc3339());
    }

    let resp = client
        .post(format!("{}/v1/discounts/", polar_cfg.base_url))
        .header("Authorization", format!("Bearer {}", polar_cfg.access_token))
        .header("Content-Type", "application/json")
        .json(&polar_body)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Polar API error: {}", e)))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        tracing::error!("Polar discount creation failed: {} {}", status, body);
        return Err(AppError::Internal(anyhow::anyhow!(
            "Failed to create discount in Polar.sh ({}): {}", status, body
        )));
    }

    #[derive(serde::Deserialize)]
    struct PolarDiscount {
        id: String,
    }

    let discount: PolarDiscount = resp.json().await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to parse Polar response: {}", e)))?;

    // Update coupon with Polar discount ID
    let updated = sqlx::query_as::<_, CouponCode>(
        "UPDATE coupon_codes SET polar_discount_id = $2, updated_at = NOW() WHERE id = $1 RETURNING *"
    )
    .bind(id)
    .bind(&discount.id)
    .fetch_one(&pool)
    .await?;

    // Audit log
    let _ = crate::audit::log_action(
        &pool, customer.id, "COUPON_SYNC_POLAR", "coupon",
        Some(&id.to_string()),
        Some(serde_json::json!({ "polar_discount_id": discount.id })),
        None, None,
    ).await;

    Ok(Json(updated))
}
