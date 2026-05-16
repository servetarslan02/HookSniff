use axum::extract::{Extension, Path};
use axum::routing::get;
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::billing::Plan;
use crate::error::AppError;
use crate::models::application::{
    Application, ApplicationResponse, CreateApplicationRequest, UpdateApplicationRequest,
};
use crate::models::customer::Customer;

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_applications).post(create_application))
        .route(
            "/{id}",
            get(get_application)
                .put(update_application)
                .delete(delete_application),
        )
}

/// List all applications for the authenticated customer.
async fn list_applications(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<ApplicationResponse>>, AppError> {
    let apps = sqlx::query_as::<_, Application>(
        "SELECT id, customer_id, name, description, is_active, created_at, updated_at \
         FROM applications WHERE customer_id = $1 ORDER BY created_at DESC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let mut responses = Vec::with_capacity(apps.len());
    for app in apps {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM endpoints WHERE application_id = $1",
        )
        .bind(app.id)
        .fetch_one(&pool)
        .await?;
        responses.push(app.to_response(count.0));
    }

    Ok(Json(responses))
}

/// Get a single application by ID.
async fn get_application(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApplicationResponse>, AppError> {
    let app = sqlx::query_as::<_, Application>(
        "SELECT id, customer_id, name, description, is_active, created_at, updated_at \
         FROM applications WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM endpoints WHERE application_id = $1",
    )
    .bind(app.id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(app.to_response(count.0)))
}

/// Create a new application.
async fn create_application(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Json(req): Json<CreateApplicationRequest>,
) -> Result<Json<ApplicationResponse>, AppError> {
    // Validate input
    req.validate()
        .map_err(AppError::BadRequest)?;

    // Plan-based limit check
    let plan = Plan::parse_str(&customer.plan);
    let app_count: (i64,) =
        sqlx::query_as("SELECT COUNT(*) FROM applications WHERE customer_id = $1")
            .bind(customer.id)
            .fetch_one(&pool)
            .await?;

    let max_apps = plan.max_applications();
    if app_count.0 as u32 >= max_apps {
        return Err(AppError::BadRequest(format!(
            "Application limit reached ({max_apps}). Upgrade your plan for more applications."
        )));
    }

    // Unique name check (per customer)
    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM applications WHERE customer_id = $1 AND name = $2)",
    )
    .bind(customer.id)
    .bind(&req.name)
    .fetch_one(&pool)
    .await?;

    if exists.0 {
        return Err(AppError::Conflict(
            "An application with this name already exists".into(),
        ));
    }

    let app = sqlx::query_as::<_, Application>(
        "INSERT INTO applications (id, customer_id, name, description) \
         VALUES ($1, $2, $3, $4) \
         RETURNING id, customer_id, name, description, is_active, created_at, updated_at",
    )
    .bind(Uuid::new_v4())
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .fetch_one(&pool)
    .await?;

    // Publish ApplicationCreated event (best-effort)
    if let Some(ref publisher) = event_publisher {
        if let Err(e) = publisher.publish(crate::events::AppEvent::ApplicationCreated {
            application_id: app.id,
            customer_id: customer.id,
            name: app.name.clone(),
        }).await {
            tracing::warn!("Failed to publish ApplicationCreated event: {:?}", e);
        }
    }

    Ok(Json(app.to_response(0)))
}

/// Update an application.
async fn update_application(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateApplicationRequest>,
) -> Result<Json<ApplicationResponse>, AppError> {
    // Validate input
    req.validate()
        .map_err(AppError::BadRequest)?;

    // Check ownership
    let existing = sqlx::query_as::<_, Application>(
        "SELECT id, customer_id, name, description, is_active, created_at, updated_at \
         FROM applications WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // If name is being changed, check uniqueness
    if let Some(ref new_name) = req.name {
        if new_name != &existing.name {
            let exists: (bool,) = sqlx::query_as(
                "SELECT EXISTS(SELECT 1 FROM applications WHERE customer_id = $1 AND name = $2 AND id != $3)",
            )
            .bind(customer.id)
            .bind(new_name)
            .bind(id)
            .fetch_one(&pool)
            .await?;

            if exists.0 {
                return Err(AppError::Conflict(
                    "An application with this name already exists".into(),
                ));
            }
        }
    }

    let updated = sqlx::query_as::<_, Application>(
        "UPDATE applications SET \
         name = COALESCE($3, name), \
         description = COALESCE($4, description), \
         is_active = COALESCE($5, is_active) \
         WHERE id = $1 AND customer_id = $2 \
         RETURNING id, customer_id, name, description, is_active, created_at, updated_at",
    )
    .bind(id)
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(req.is_active)
    .fetch_one(&pool)
    .await?;

    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM endpoints WHERE application_id = $1",
    )
    .bind(updated.id)
    .fetch_one(&pool)
    .await?;

    // Publish ApplicationUpdated event (best-effort)
    if let Some(ref publisher) = event_publisher {
        if let Err(e) = publisher.publish(crate::events::AppEvent::ApplicationUpdated {
            application_id: updated.id,
            customer_id: customer.id,
        }).await {
            tracing::warn!("Failed to publish ApplicationUpdated event: {:?}", e);
        }
    }

    Ok(Json(updated.to_response(count.0)))
}

/// Delete an application.
/// Endpoints belonging to this application will have their application_id set to NULL.
async fn delete_application(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Extension(event_publisher): Extension<Option<crate::events::EventPublisher>>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    let result = sqlx::query(
        "DELETE FROM applications WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    // Publish ApplicationDeleted event (best-effort)
    if let Some(ref publisher) = event_publisher {
        if let Err(e) = publisher.publish(crate::events::AppEvent::ApplicationDeleted {
            application_id: id,
            customer_id: customer.id,
        }).await {
            tracing::warn!("Failed to publish ApplicationDeleted event: {:?}", e);
        }
    }

    Ok(Json(serde_json::json!({
        "message": "Application deleted successfully"
    })))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        // Verify the router can be constructed without panicking
        let _router = router();
    }
}
