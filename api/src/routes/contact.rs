use axum::{http::StatusCode, Json, Router};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct ContactRequest {
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
}

#[derive(Serialize)]
pub struct ContactResponse {
    pub success: bool,
    pub message: String,
}

/// POST /v1/contact — Send a contact form message
pub async fn handle_contact(
    Json(body): Json<ContactRequest>,
) -> Result<Json<ContactResponse>, StatusCode> {
    // Validate input
    if body.name.trim().is_empty() || body.email.trim().is_empty() || body.message.trim().is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Basic email validation
    if !body.email.contains('@') || !body.email.contains('.') {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Rate limit: max 500 chars for message
    if body.message.len() > 5000 {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Log the contact form submission
    tracing::info!(
        name = %body.name,
        email = %body.email,
        subject = %body.subject,
        "Contact form submission"
    );

    // TODO: Send email via Resend when RESEND_API_KEY is configured
    // For now, just log it

    Ok(Json(ContactResponse {
        success: true,
        message: "Message received. We'll get back to you soon!".to_string(),
    }))
}

/// Contact form routes (public — no auth required)
pub fn router() -> Router {
    Router::new().route("/", axum::routing::post(handle_contact))
}
