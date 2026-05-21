use axum::extract::{Extension, Path};
use axum::routing::get;
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::background_task::{BackgroundTask, BackgroundTaskResponse};
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_tasks))
        .route("/{id}", get(get_task).put(cancel_task))
}

/// List all background tasks for the authenticated customer.
async fn list_tasks(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<BackgroundTaskResponse>>, AppError> {
    let tasks = sqlx::query_as::<_, BackgroundTask>(
        "SELECT id, customer_id, task_type, status, data, result, error, progress, created_at, started_at, finished_at \
         FROM background_tasks WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 100",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(tasks.into_iter().map(|t| t.to_response()).collect()))
}

/// Get a single background task by ID.
async fn get_task(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<BackgroundTaskResponse>, AppError> {
    let task = sqlx::query_as::<_, BackgroundTask>(
        "SELECT id, customer_id, task_type, status, data, result, error, progress, created_at, started_at, finished_at \
         FROM background_tasks WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(task.to_response()))
}

/// Cancel a pending or running background task.
async fn cancel_task(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
) -> Result<Json<BackgroundTaskResponse>, AppError> {
    // ── Role enforcement: require admin for task cancellation ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_admin(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "admin").await?;
    }

    let task = sqlx::query_as::<_, BackgroundTask>(
        "UPDATE background_tasks SET status = 'cancelled', finished_at = now() \
         WHERE id = $1 AND customer_id = $2 AND status IN ('pending', 'running') \
         RETURNING id, customer_id, task_type, status, data, result, error, progress, created_at, started_at, finished_at",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(task.to_response()))
}
