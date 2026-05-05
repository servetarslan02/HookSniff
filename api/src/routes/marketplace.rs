use axum::extract::{Extension, Path, Query};
use axum::routing::{get, post, put};
use axum::{Json, Router};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::customer::Customer;

// We re-export from ai-center's marketplace types for the API routes
// The actual database operations happen in ai-center, but we expose HTTP endpoints here
use serde::Serialize;

/// Marketplace agent summary for API responses
#[derive(Debug, Serialize)]
pub struct AgentSummaryResponse {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub author: String,
    pub version: String,
    pub downloads: i32,
    pub rating: f64,
}

/// Marketplace agent detail
#[derive(Debug, Serialize)]
pub struct AgentDetailResponse {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub author: String,
    pub version: String,
    pub config: serde_json::Value,
    pub downloads: i32,
    pub rating: f64,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// List response
#[derive(Debug, Serialize)]
pub struct AgentListResponse {
    pub agents: Vec<AgentSummaryResponse>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}

/// Install response
#[derive(Debug, Serialize)]
pub struct InstallResponse {
    pub installation_id: Uuid,
    pub agent_id: Uuid,
    pub agent_name: String,
    pub enabled: bool,
    pub message: String,
}

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_agents).post(publish_agent))
        .route("/{id}", get(get_agent))
        .route("/{id}/install", post(install_agent))
        .route("/{id}/config", put(configure_agent))
}

#[derive(Debug, Deserialize)]
struct ListParams {
    page: Option<i64>,
    per_page: Option<i64>,
    search: Option<String>,
    author: Option<String>,
}

#[derive(Debug, Deserialize)]
struct PublishRequest {
    pub name: String,
    pub description: String,
    pub author: Option<String>,
    pub version: Option<String>,
    pub config: serde_json::Value,
}

#[derive(Debug, Deserialize)]
struct InstallRequest {
    pub config: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct ConfigureRequest {
    pub enabled: Option<bool>,
    pub config: Option<serde_json::Value>,
}

/// GET /v1/marketplace/agents — List available agents
async fn list_agents(
    Extension(pool): Extension<PgPool>,
    Query(params): Query<ListParams>,
) -> Result<Json<AgentListResponse>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let (agents, total) = if let Some(q) = &params.search {
        let pattern = format!("%{}%", q);
        let agents = sqlx::query_as::<_, (Uuid, String, String, String, String, i32, f64)>(
            "SELECT id, name, description, author, version, downloads, rating FROM marketplace_agents WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY downloads DESC LIMIT $2 OFFSET $3",
        )
        .bind(&pattern)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

        let total: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM marketplace_agents WHERE name ILIKE $1 OR description ILIKE $1",
        )
        .bind(&pattern)
        .fetch_one(&pool)
        .await?;

        (agents, total.0)
    } else if let Some(a) = &params.author {
        let agents = sqlx::query_as::<_, (Uuid, String, String, String, String, i32, f64)>(
            "SELECT id, name, description, author, version, downloads, rating FROM marketplace_agents WHERE author = $1 ORDER BY downloads DESC LIMIT $2 OFFSET $3",
        )
        .bind(a)
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

        let total: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM marketplace_agents WHERE author = $1",
        )
        .bind(a)
        .fetch_one(&pool)
        .await?;

        (agents, total.0)
    } else {
        let agents = sqlx::query_as::<_, (Uuid, String, String, String, String, i32, f64)>(
            "SELECT id, name, description, author, version, downloads, rating FROM marketplace_agents ORDER BY downloads DESC LIMIT $1 OFFSET $2",
        )
        .bind(per_page)
        .bind(offset)
        .fetch_all(&pool)
        .await?;

        let total: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM marketplace_agents")
                .fetch_one(&pool)
                .await?;

        (agents, total.0)
    };

    let agent_summaries: Vec<AgentSummaryResponse> = agents
        .into_iter()
        .map(|(id, name, description, author, version, downloads, rating)| {
            AgentSummaryResponse {
                id,
                name,
                description,
                author,
                version,
                downloads,
                rating,
            }
        })
        .collect();

    Ok(Json(AgentListResponse {
        agents: agent_summaries,
        total,
        page,
        per_page,
    }))
}

/// GET /v1/marketplace/agents/{id} — Get agent details
async fn get_agent(
    Extension(pool): Extension<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<AgentDetailResponse>, AppError> {
    let agent = sqlx::query_as::<_, (Uuid, String, String, String, String, serde_json::Value, i32, f64, chrono::DateTime<chrono::Utc>)>(
        "SELECT id, name, description, author, version, config, downloads, rating, created_at FROM marketplace_agents WHERE id = $1",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    Ok(Json(AgentDetailResponse {
        id: agent.0,
        name: agent.1,
        description: agent.2,
        author: agent.3,
        version: agent.4,
        config: agent.5,
        downloads: agent.6,
        rating: agent.7,
        created_at: agent.8,
    }))
}

/// POST /v1/marketplace/agents — Publish a new agent
async fn publish_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Json(req): Json<PublishRequest>,
) -> Result<Json<AgentDetailResponse>, AppError> {
    let author = req.author.unwrap_or_else(|| customer.email.clone());
    let version = req.version.unwrap_or_else(|| "1.0.0".to_string());

    let agent = sqlx::query_as::<_, (Uuid, String, String, String, String, serde_json::Value, i32, f64, chrono::DateTime<chrono::Utc>)>(
        "INSERT INTO marketplace_agents (name, description, author, version, config) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, author, version, config, downloads, rating, created_at",
    )
    .bind(&req.name)
    .bind(&req.description)
    .bind(&author)
    .bind(&version)
    .bind(&req.config)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to publish agent: {:?}", e);
        AppError::Internal(e.into())
    })?;

    tracing::info!("📦 Published marketplace agent: {} v{} by {}", agent.1, agent.4, author);

    Ok(Json(AgentDetailResponse {
        id: agent.0,
        name: agent.1,
        description: agent.2,
        author: agent.3,
        version: agent.4,
        config: agent.5,
        downloads: agent.6,
        rating: agent.7,
        created_at: agent.8,
    }))
}

/// POST /v1/marketplace/agents/{id}/install — Install agent to account
async fn install_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(agent_id): Path<Uuid>,
    Json(req): Json<InstallRequest>,
) -> Result<Json<InstallResponse>, AppError> {
    // Verify agent exists
    let agent_name: (String,) = sqlx::query_as(
        "SELECT name FROM marketplace_agents WHERE id = $1",
    )
    .bind(agent_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Check if already installed
    let existing = sqlx::query_as::<_, (Uuid,)>(
        "SELECT id FROM installed_agents WHERE customer_id = $1 AND agent_id = $2",
    )
    .bind(customer.id)
    .bind(agent_id)
    .fetch_optional(&pool)
    .await?;

    if let Some((installation_id,)) = existing {
        return Ok(Json(InstallResponse {
            installation_id,
            agent_id,
            agent_name: agent_name.0,
            enabled: true,
            message: "Agent already installed".to_string(),
        }));
    }

    let installed = sqlx::query_as::<_, (Uuid,)>(
        "INSERT INTO installed_agents (customer_id, agent_id, config) VALUES ($1, $2, $3) RETURNING id",
    )
    .bind(customer.id)
    .bind(agent_id)
    .bind(&req.config)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to install agent: {:?}", e);
        AppError::Internal(e.into())
    })?;

    // Increment download count
    let _ = sqlx::query("UPDATE marketplace_agents SET downloads = downloads + 1 WHERE id = $1")
        .bind(agent_id)
        .execute(&pool)
        .await;

    tracing::info!("📥 Installed agent {} for customer {}", agent_id, customer.id);

    Ok(Json(InstallResponse {
        installation_id: installed.0,
        agent_id,
        agent_name: agent_name.0,
        enabled: true,
        message: "Agent installed successfully".to_string(),
    }))
}

/// PUT /v1/marketplace/agents/{id}/config — Configure an installed agent
async fn configure_agent(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(agent_id): Path<Uuid>,
    Json(req): Json<ConfigureRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    let installation = sqlx::query_as::<_, (Uuid,)>(
        "SELECT id FROM installed_agents WHERE customer_id = $1 AND agent_id = $2",
    )
    .bind(customer.id)
    .bind(agent_id)
    .fetch_optional(&pool)
    .await?
    .ok_or(AppError::NotFound)?;

    if let Some(enabled) = req.enabled {
        sqlx::query("UPDATE installed_agents SET enabled = $1 WHERE id = $2")
            .bind(enabled)
            .bind(installation.0)
            .execute(&pool)
            .await?;
    }

    if let Some(config) = req.config {
        sqlx::query("UPDATE installed_agents SET config = $1 WHERE id = $2")
            .bind(&config)
            .bind(installation.0)
            .execute(&pool)
            .await?;
    }

    tracing::info!("⚙️ Configured agent {} for customer {}", agent_id, customer.id);

    Ok(Json(serde_json::json!({
        "installation_id": installation.0,
        "agent_id": agent_id,
        "message": "Agent configuration updated"
    })))
}
