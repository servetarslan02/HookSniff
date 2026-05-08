use axum::extract::{Extension, Path, Query};
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::Deserialize;
use sqlx::PgPool;

use crate::error::AppError;
use crate::models::customer::Customer;
use crate::templates::{
    ApplyTemplateRequest, ApplyTemplateResponse, TemplateListResponse, WebhookTemplate,
};

pub fn router() -> Router {
    Router::new()
        .route("/", get(list_templates))
        .route("/{id}", get(get_template))
        .route("/{id}/apply", post(apply_template))
}

#[derive(Debug, Deserialize)]
struct TemplateListParams {
    industry: Option<String>,
    tag: Option<String>,
}

/// GET /v1/templates — List available templates
async fn list_templates(
    Query(params): Query<TemplateListParams>,
) -> Result<Json<TemplateListResponse>, AppError> {
    let templates = if let Some(industry) = &params.industry {
        WebhookTemplate::by_industry(industry)
    } else if let Some(tag) = &params.tag {
        WebhookTemplate::by_tag(tag)
    } else {
        WebhookTemplate::all()
    };

    let total = templates.len();
    Ok(Json(TemplateListResponse { templates, total }))
}

/// GET /v1/templates/{id} — Get template details
async fn get_template(Path(id): Path<String>) -> Result<Json<WebhookTemplate>, AppError> {
    WebhookTemplate::find_by_id(&id)
        .map(Json)
        .ok_or(AppError::NotFound)
}

/// POST /v1/templates/{id}/apply — Apply a template to the customer's account
async fn apply_template(
    Extension(pool): Extension<PgPool>,
    Extension(customer): Extension<Customer>,
    Path(id): Path<String>,
    Json(req): Json<ApplyTemplateRequest>,
) -> Result<Json<ApplyTemplateResponse>, AppError> {
    let template = WebhookTemplate::find_by_id(&id).ok_or(AppError::NotFound)?;

    // Create endpoint from template
    let custom_headers = req
        .custom_headers
        .or(Some(template.endpoint_config.custom_headers.clone()));

    let event_filter: Option<Vec<String>> = Some(template.endpoint_config.event_filter.clone());

    let endpoint = sqlx::query_as::<_, crate::models::endpoint::Endpoint>(
        "INSERT INTO endpoints (customer_id, url, description, event_filter, custom_headers) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    )
    .bind(customer.id)
    .bind(&req.endpoint_url)
    .bind(format!("[{}] {}", template.name, template.description))
    .bind(&event_filter)
    .bind(&custom_headers)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create endpoint from template: {:?}", e);
        AppError::Internal(e.into())
    })?;

    let agents_enabled: Vec<String> = template
        .agents
        .iter()
        .filter(|a| {
            req.enabled_agents
                .as_ref()
                .map(|enabled| enabled.contains(&a.agent_name))
                .unwrap_or(a.enabled_by_default)
        })
        .map(|a| a.agent_name.clone())
        .collect();

    tracing::info!(
        "📋 Applied template '{}' to customer {} — endpoint {} created",
        template.name,
        customer.id,
        endpoint.id
    );

    Ok(Json(ApplyTemplateResponse {
        template_id: template.id,
        endpoint_id: endpoint.id,
        event_subscriptions: template.event_types.clone(),
        agents_enabled: agents_enabled.clone(),
        message: format!(
            "Template '{}' applied successfully. Endpoint created with {} event subscriptions and {} agents enabled.",
            template.name,
            template.event_types.len(),
            agents_enabled.len()
        ),
    }))
}
