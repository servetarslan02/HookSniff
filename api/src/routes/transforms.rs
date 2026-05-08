use axum::extract::{Extension, Path};
use axum::routing::{delete, get, post, put};
use axum::{Json, Router};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::endpoint::Endpoint;
use crate::transform::{self, CreateTransformRuleRequest, TransformRule, TransformRuleConfig};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_rules).post(create_rule))
        .route("/{id}", put(update_rule).delete(delete_rule))
        .route("/test", post(test_transform))
}

async fn list_rules(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(endpoint_id): Path<Uuid>,
) -> Result<Json<Vec<TransformRule>>, AppError> {
    // Verify endpoint ownership
    let _ =
        sqlx::query_as::<_, Endpoint>("SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(endpoint_id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let rules = transform::list_rules(&pool, endpoint_id).await?;
    Ok(Json(rules))
}

async fn create_rule(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(endpoint_id): Path<Uuid>,
    Json(req): Json<CreateTransformRuleRequest>,
) -> Result<Json<TransformRule>, AppError> {
    // Verify endpoint ownership
    let _ =
        sqlx::query_as::<_, Endpoint>("SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(endpoint_id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let rule = transform::create_rule(&pool, endpoint_id, &req.rule).await?;
    Ok(Json(rule))
}

async fn update_rule(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path((endpoint_id, rule_id)): Path<(Uuid, Uuid)>,
    Json(config): Json<TransformRuleConfig>,
) -> Result<Json<TransformRule>, AppError> {
    // Verify endpoint ownership
    let _ =
        sqlx::query_as::<_, Endpoint>("SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(endpoint_id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let rule = transform::update_rule(&pool, rule_id, &config).await?;
    Ok(Json(rule))
}

async fn delete_rule(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path((endpoint_id, rule_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, AppError> {
    // Verify endpoint ownership
    let _ =
        sqlx::query_as::<_, Endpoint>("SELECT * FROM endpoints WHERE id = $1 AND customer_id = $2")
            .bind(endpoint_id)
            .bind(customer.id)
            .fetch_optional(&pool)
            .await?
            .ok_or(AppError::NotFound)?;

    let deleted = transform::delete_rule(&pool, rule_id).await?;
    Ok(Json(serde_json::json!({ "deleted": deleted })))
}

#[derive(Deserialize)]
struct TestTransformRequest {
    payload: serde_json::Value,
    config: TransformRuleConfig,
}

async fn test_transform(
    Json(req): Json<TestTransformRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = transform::TransformEngine::apply(&req.payload, &req.config)
        .map_err(|e| AppError::BadRequest(e.to_string()))?;
    Ok(Json(result))
}
