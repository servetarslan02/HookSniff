use axum::extract::{Extension, Path};
use axum::routing::get;
use axum::{Json, Router};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::models::environment::{
    CreateEnvironmentRequest, Environment, EnvironmentResponse, UpdateEnvironmentRequest,
};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_environments).post(create_environment))
        .route(
            "/{id}",
            get(get_environment)
                .put(update_environment)
                .delete(delete_environment),
        )
        .route("/{id}/variables", get(list_variables).post(create_variable))
        .route(
            "/{id}/variables/{var_id}",
            get(get_variable)
                .put(update_variable)
                .delete(delete_variable),
        )
        .route("/{id}/variables/bulk", get(bulk_upsert_variables))
}

/// List all environments for the authenticated customer.
async fn list_environments(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
) -> Result<Json<Vec<EnvironmentResponse>>, AppError> {
    let rows = sqlx::query_as::<_, Environment>(
        "SELECT id, customer_id, name, slug, description, is_default, color, created_at, updated_at \
         FROM environments WHERE customer_id = $1 ORDER BY is_default DESC, created_at ASC",
    )
    .bind(customer.id)
    .fetch_all(&pool)
    .await?;

    let mut responses = Vec::with_capacity(rows.len());
    for env in rows {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*)::bigint FROM environment_variables WHERE environment_id = $1",
        )
        .bind(env.id)
        .fetch_one(&pool)
        .await?;
        responses.push(env.to_response(count.0));
    }

    Ok(Json(responses))
}

/// Get a single environment by ID.
async fn get_environment(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<EnvironmentResponse>, AppError> {
    let env = sqlx::query_as::<_, Environment>(
        "SELECT id, customer_id, name, slug, description, is_default, color, created_at, updated_at \
         FROM environments WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*)::bigint FROM environment_variables WHERE environment_id = $1",
    )
    .bind(env.id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(env.to_response(count.0)))
}

/// Create a new environment.
async fn create_environment(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Json(req): Json<CreateEnvironmentRequest>,
) -> Result<Json<EnvironmentResponse>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    req.validate().map_err(AppError::BadRequest)?;

    let slug = req.resolve_slug();

    // Unique slug check (per customer)
    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM environments WHERE customer_id = $1 AND slug = $2)",
    )
    .bind(customer.id)
    .bind(&slug)
    .fetch_one(&pool)
    .await?;

    if exists.0 {
        return Err(AppError::Conflict(
            "An environment with this slug already exists".into(),
        ));
    }

    // If marking as default, unset other defaults first
    if req.is_default.unwrap_or(false) {
        sqlx::query("UPDATE environments SET is_default = false WHERE customer_id = $1")
            .bind(customer.id)
            .execute(&pool)
            .await?;
    }

    let env = sqlx::query_as::<_, Environment>(
        "INSERT INTO environments (id, customer_id, name, slug, description, is_default, color) \
         VALUES ($1, $2, $3, $4, $5, $6, $7) \
         RETURNING id, customer_id, name, slug, description, is_default, color, created_at, updated_at",
    )
    .bind(Uuid::new_v4())
    .bind(customer.id)
    .bind(&req.name)
    .bind(&slug)
    .bind(&req.description)
    .bind(req.is_default.unwrap_or(false))
    .bind(&req.color)
    .fetch_one(&pool)
    .await?;

    Ok(Json(env.to_response(0)))
}

/// Update an environment.
async fn update_environment(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateEnvironmentRequest>,
) -> Result<Json<EnvironmentResponse>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    // Check ownership
    let _existing = sqlx::query_as::<_, Environment>(
        "SELECT id, customer_id, name, slug, description, is_default, color, created_at, updated_at \
         FROM environments WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // If marking as default, unset other defaults first
    if req.is_default == Some(true) {
        sqlx::query("UPDATE environments SET is_default = false WHERE customer_id = $1 AND id != $2")
            .bind(customer.id)
            .bind(id)
            .execute(&pool)
            .await?;
    }

    let env = sqlx::query_as::<_, Environment>(
        "UPDATE environments SET \
         name = COALESCE($3, name), \
         description = COALESCE($4, description), \
         is_default = COALESCE($5, is_default), \
         color = COALESCE($6, color), \
         updated_at = now() \
         WHERE id = $1 AND customer_id = $2 \
         RETURNING id, customer_id, name, slug, description, is_default, color, created_at, updated_at",
    )
    .bind(id)
    .bind(customer.id)
    .bind(&req.name)
    .bind(&req.description)
    .bind(req.is_default)
    .bind(&req.color)
    .fetch_one(&pool)
    .await?;

    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*)::bigint FROM environment_variables WHERE environment_id = $1",
    )
    .bind(env.id)
    .fetch_one(&pool)
    .await?;

    Ok(Json(env.to_response(count.0)))
}

/// Delete an environment.
async fn delete_environment(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    // ── Role enforcement: require admin for destructive ops ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_admin(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "admin").await?;
    }

    let result = sqlx::query(
        "DELETE FROM environments WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}

// ── Environment Variables CRUD ─────────────────────────────

/// List all variables for an environment.
async fn list_variables(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<crate::models::environment_variable::VariableResponse>>, AppError> {
    // Verify environment ownership
    let _env = sqlx::query_as::<_, Environment>(
        "SELECT id, customer_id, name, slug, description, is_default, color, created_at, updated_at \
         FROM environments WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let vars = sqlx::query_as::<_, crate::models::environment_variable::EnvironmentVariable>(
        "SELECT id, environment_id, key, value, is_secret, created_at, updated_at \
         FROM environment_variables WHERE environment_id = $1 ORDER BY key ASC",
    )
    .bind(id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(vars.into_iter().map(|v| v.to_response()).collect()))
}

/// Get a single variable.
async fn get_variable(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path((id, var_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<crate::models::environment_variable::VariableResponse>, AppError> {
    // Verify environment ownership
    let _env = sqlx::query_as::<_, Environment>(
        "SELECT id, customer_id, name, slug, description, is_default, color, created_at, updated_at \
         FROM environments WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let var = sqlx::query_as::<_, crate::models::environment_variable::EnvironmentVariable>(
        "SELECT id, environment_id, key, value, is_secret, created_at, updated_at \
         FROM environment_variables WHERE id = $1 AND environment_id = $2",
    )
    .bind(var_id)
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(var.to_response()))
}

/// Create a variable in an environment.
async fn create_variable(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path(id): Path<Uuid>,
    Json(req): Json<crate::models::environment_variable::CreateVariableRequest>,
) -> Result<Json<crate::models::environment_variable::VariableResponse>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    req.validate().map_err(AppError::BadRequest)?;

    // Verify environment ownership
    let _env = sqlx::query_as::<_, Environment>(
        "SELECT id, customer_id, name, slug, description, is_default, color, created_at, updated_at \
         FROM environments WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Unique key check
    let exists: (bool,) = sqlx::query_as(
        "SELECT EXISTS(SELECT 1 FROM environment_variables WHERE environment_id = $1 AND key = $2)",
    )
    .bind(id)
    .bind(&req.key)
    .fetch_one(&pool)
    .await?;

    if exists.0 {
        return Err(AppError::Conflict(
            "A variable with this key already exists in this environment".into(),
        ));
    }

    let var = sqlx::query_as::<_, crate::models::environment_variable::EnvironmentVariable>(
        "INSERT INTO environment_variables (id, environment_id, key, value, is_secret) \
         VALUES ($1, $2, $3, $4, $5) \
         RETURNING id, environment_id, key, value, is_secret, created_at, updated_at",
    )
    .bind(Uuid::new_v4())
    .bind(id)
    .bind(&req.key)
    .bind(&req.value)
    .bind(req.is_secret.unwrap_or(false))
    .fetch_one(&pool)
    .await?;

    Ok(Json(var.to_response()))
}

/// Update a variable.
async fn update_variable(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path((id, var_id)): Path<(Uuid, Uuid)>,
    Json(req): Json<crate::models::environment_variable::CreateVariableRequest>,
) -> Result<Json<crate::models::environment_variable::VariableResponse>, AppError> {
    // ── Role enforcement: require at least developer ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_developer(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "developer").await?;
    }

    req.validate().map_err(AppError::BadRequest)?;

    // Verify environment ownership
    let _env = sqlx::query_as::<_, Environment>(
        "SELECT id, customer_id, name, slug, description, is_default, color, created_at, updated_at \
         FROM environments WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let var = sqlx::query_as::<_, crate::models::environment_variable::EnvironmentVariable>(
        "UPDATE environment_variables SET value = $3, is_secret = $4, updated_at = now() \
         WHERE id = $1 AND environment_id = $2 \
         RETURNING id, environment_id, key, value, is_secret, created_at, updated_at",
    )
    .bind(var_id)
    .bind(id)
    .bind(&req.value)
    .bind(req.is_secret.unwrap_or(false))
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(var.to_response()))
}

/// Delete a variable.
async fn delete_variable(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    service_token: Option<Extension<crate::middleware::ServiceTokenScope>>,
    Path((id, var_id)): Path<(Uuid, Uuid)>,
) -> Result<Json<serde_json::Value>, AppError> {
    // ── Role enforcement: require admin for destructive ops ──
    if let Some(Extension(ref scope)) = service_token {
        super::teams::require_team_admin(&pool, scope.team_id, customer.id).await?;
    } else {
        super::teams::check_user_team_role(&pool, customer.id, "admin").await?;
    }

    // Verify environment ownership
    let _env = sqlx::query_as::<_, Environment>(
        "SELECT id, customer_id, name, slug, description, is_default, color, created_at, updated_at \
         FROM environments WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let result = sqlx::query(
        "DELETE FROM environment_variables WHERE id = $1 AND environment_id = $2",
    )
    .bind(var_id)
    .bind(id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound);
    }

    Ok(Json(serde_json::json!({ "deleted": true })))
}

/// Bulk upsert variables (create or update multiple at once).
async fn bulk_upsert_variables(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<Uuid>,
    Json(req): Json<crate::models::environment_variable::BulkUpsertVariablesRequest>,
) -> Result<Json<Vec<crate::models::environment_variable::VariableResponse>>, AppError> {
    // Verify environment ownership
    let _env = sqlx::query_as::<_, Environment>(
        "SELECT id, customer_id, name, slug, description, is_default, color, created_at, updated_at \
         FROM environments WHERE id = $1 AND customer_id = $2",
    )
    .bind(id)
    .bind(customer.id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let mut responses = Vec::with_capacity(req.variables.len());

    for var_req in &req.variables {
        var_req.validate().map_err(AppError::BadRequest)?;
    }

    // Use a transaction for atomicity
    let mut tx = pool.begin().await?;

    for var_req in req.variables {
        let var = sqlx::query_as::<_, crate::models::environment_variable::EnvironmentVariable>(
            "INSERT INTO environment_variables (id, environment_id, key, value, is_secret) \
             VALUES ($1, $2, $3, $4, $5) \
             ON CONFLICT (environment_id, key) DO UPDATE SET value = EXCLUDED.value, is_secret = EXCLUDED.is_secret, updated_at = now() \
             RETURNING id, environment_id, key, value, is_secret, created_at, updated_at",
        )
        .bind(Uuid::new_v4())
        .bind(id)
        .bind(&var_req.key)
        .bind(&var_req.value)
        .bind(var_req.is_secret.unwrap_or(false))
        .fetch_one(&mut *tx)
        .await?;

        responses.push(var.to_response());
    }

    tx.commit().await?;

    Ok(Json(responses))
}
