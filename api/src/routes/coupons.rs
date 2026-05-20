use axum::extract::Extension;
use axum::{Json, Router};
use axum::routing::post;
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::coupon::CouponValidationResult;
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/validate", post(validate_coupon))
}

/// POST /v1/coupons/validate — Validate a coupon code
/// Returns validation result with discount details
async fn validate_coupon(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(body): Json<serde_json::Value>,
) -> Result<Json<CouponValidationResult>, AppError> {
    let code = body.get("code")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("Missing 'code' field".into()))?
        .to_uppercase();

    let target_plan = body.get("plan")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    // Look up coupon
    let coupon = sqlx::query_as::<_, crate::models::coupon::CouponCode>(
        "SELECT * FROM coupon_codes WHERE UPPER(code) = $1"
    )
    .bind(&code)
    .fetch_optional(&pool)
    .await?;

    let coupon = match coupon {
        Some(c) => c,
        None => {
            // Also check Polar codes
            return Ok(Json(CouponValidationResult {
                valid: false,
                coupon_id: None,
                code: Some(code),
                discount_type: None,
                discount_value: None,
                target_plan: None,
                message: "Coupon code not found".into(),
            }));
        }
    };

    // Check active
    if !coupon.is_active {
        return Ok(Json(CouponValidationResult {
            valid: false,
            coupon_id: Some(coupon.id),
            code: Some(coupon.code),
            discount_type: None,
            discount_value: None,
            target_plan: None,
            message: "This coupon is no longer active".into(),
        }));
    }

    // Check expiry
    if let Some(expires_at) = coupon.expires_at {
        if chrono::Utc::now() > expires_at {
            return Ok(Json(CouponValidationResult {
                valid: false,
                coupon_id: Some(coupon.id),
                code: Some(coupon.code),
                discount_type: None,
                discount_value: None,
                target_plan: None,
                message: "This coupon has expired".into(),
            }));
        }
    }

    // Check max redemptions
    if let Some(max) = coupon.max_redemptions {
        if coupon.redemption_count >= max {
            return Ok(Json(CouponValidationResult {
                valid: false,
                coupon_id: Some(coupon.id),
                code: Some(coupon.code),
                discount_type: None,
                discount_value: None,
                target_plan: None,
                message: "This coupon has reached its maximum usage".into(),
            }));
        }
    }

    // Check if customer already used this coupon
    let already_used = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_id = $1 AND customer_id = $2"
    )
    .bind(coupon.id)
    .bind(customer.id)
    .fetch_one(&pool)
    .await?;

    if already_used > 0 {
        return Ok(Json(CouponValidationResult {
            valid: false,
            coupon_id: Some(coupon.id),
            code: Some(coupon.code),
            discount_type: None,
            discount_value: None,
            target_plan: None,
            message: "You have already used this coupon".into(),
        }));
    }

    // Check plan match
    if let Some(ref target) = coupon.target_plan {
        if let Some(ref req_plan) = target_plan {
            if target != req_plan {
                return Ok(Json(CouponValidationResult {
                    valid: false,
                    coupon_id: Some(coupon.id),
                    code: Some(coupon.code),
                    discount_type: None,
                    discount_value: None,
                    target_plan: Some(target.clone()),
                    message: format!("This coupon is only valid for the {} plan", target),
                }));
            }
        }
    }

    Ok(Json(CouponValidationResult {
        valid: true,
        coupon_id: Some(coupon.id),
        code: Some(coupon.code),
        discount_type: Some(coupon.discount_type.clone()),
        discount_value: Some(coupon.discount_value),
        target_plan: coupon.target_plan.clone(),
        message: "Coupon is valid".into(),
    }))
}
