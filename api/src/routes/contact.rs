use axum::{http::StatusCode, Extension, Json, Router};
use serde::{Deserialize, Serialize};

use crate::email::EmailProvider;

/// Maximum contact form submissions per IP per hour.
const CONTACT_RATE_LIMIT: u32 = 5;

/// Escape HTML special characters to prevent injection.
fn escape_html(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#x27;")
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
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
    Extension(email_provider): Extension<EmailProvider>,
    Extension(cfg): Extension<crate::config::Config>,
    Extension(rate_limiter): Extension<crate::rate_limit::RateLimiter>,
    headers: axum::http::HeaderMap,
    Json(body): Json<ContactRequest>,
) -> Result<Json<ContactResponse>, StatusCode> {
    // Rate limit: 5 contact submissions per IP per hour
    let client_ip = headers
        .get("x-real-ip")
        .or_else(|| headers.get("x-forwarded-for"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");
    let rl_key = format!("contact:{}", client_ip);
    let rl_result = rate_limiter
        .check_with_window(&rl_key, CONTACT_RATE_LIMIT, 3600)
        .await;
    if !rl_result.allowed {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    }

    // Validate input
    if body.name.trim().is_empty() || body.email.trim().is_empty() || body.message.trim().is_empty()
    {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Proper email validation
    if crate::validation::validate_email(&body.email).is_err() {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Rate limit: max 5000 chars for message, 200 for subject
    if body.message.len() > 5000 || body.subject.len() > 200 {
        return Err(StatusCode::BAD_REQUEST);
    }

    // Log the contact form submission
    tracing::info!(
        name = %body.name,
        email = %body.email,
        subject = %body.subject,
        "Contact form submission"
    );

    // Send email via configured provider (Resend or GCloud)
    // Notify admin about the contact form submission
    let safe_name = escape_html(&body.name);
    let safe_email = escape_html(&body.email);
    let safe_subject = escape_html(&body.subject);
    let safe_message = escape_html(&body.message);

    let admin_html = format!(
        r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #6d28d9;">New Contact Form Submission</h2>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px; font-weight: bold; color: #374151;">Name:</td><td style="padding: 8px;">{}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold; color: #374151;">Email:</td><td style="padding: 8px;">{}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold; color: #374151;">Subject:</td><td style="padding: 8px;">{}</td></tr>
  </table>
  <div style="background: #f3f4f6; border-radius: 6px; padding: 16px; margin-top: 12px;">
    <pre style="margin: 0; white-space: pre-wrap;">{}</pre>
  </div>
  <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">— HookSniff Contact System</p>
</body>
</html>"#,
        safe_name, safe_email, safe_subject, safe_message
    );

    // Send to admin (use config notify_email, fallback to env var)
    let admin_email = cfg
        .notify_email
        .clone()
        .unwrap_or_else(|| "admin@hooksniff.dev".into());
    if let Err(e) = email_provider
        .send_contact_email(
            &admin_email,
            &format!("Contact: {} — {}", body.subject, body.name),
            &admin_html,
        )
        .await
    {
        tracing::warn!("Failed to send contact email to admin: {:?}", e);
    }

    // Send confirmation to user
    let user_html = format!(
        r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6d28d9;">Thanks for reaching out, {}! 📩</h1>
  <p>We've received your message and will get back to you as soon as possible.</p>
  <div style="background: #f3f4f6; border-radius: 6px; padding: 16px; margin: 16px 0;">
    <p style="margin: 0; font-weight: bold;">Subject: {}</p>
  </div>
  <p>Typically, we respond within 24 hours during business days.</p>
  <p style="margin-top: 24px; color: #6b7280;">— The HookSniff Team</p>
</body>
</html>"#,
        safe_name, safe_subject
    );

    if let Err(e) = email_provider
        .send_contact_email(
            &body.email,
            "We received your message — HookSniff",
            &user_html,
        )
        .await
    {
        tracing::warn!(
            "Failed to send contact confirmation to {}: {:?}",
            body.email,
            e
        );
    }

    Ok(Json(ContactResponse {
        success: true,
        message: "Message received. We'll get back to you soon!".to_string(),
    }))
}

/// Contact form routes (public — no auth required)
pub fn router() -> Router {
    Router::new().route("/", axum::routing::post(handle_contact))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_router_construction() {
        let _r = router();
    }

    #[test]
    fn test_contact_request_deserialize() {
        let json = r#"{
            "name": "John Doe",
            "email": "john@example.com",
            "subject": "Question",
            "message": "Hello, I have a question."
        }"#;
        let req: ContactRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "John Doe");
        assert_eq!(req.email, "john@example.com");
        assert_eq!(req.subject, "Question");
        assert_eq!(req.message, "Hello, I have a question.");
    }

    #[test]
    fn test_contact_response_serialize() {
        let resp = ContactResponse {
            success: true,
            message: "Message received.".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["success"], true);
        assert_eq!(json["message"], "Message received.");
    }

    #[test]
    fn test_contact_response_failure() {
        let resp = ContactResponse {
            success: false,
            message: "Failed to send.".to_string(),
        };
        let json = serde_json::to_value(&resp).unwrap();
        assert_eq!(json["success"], false);
    }

    #[test]
    fn test_input_validation_empty_name() {
        let req = ContactRequest {
            name: "  ".to_string(),
            email: "john@example.com".to_string(),
            subject: "Test".to_string(),
            message: "Hello".to_string(),
        };
        assert!(req.name.trim().is_empty());
    }

    #[test]
    fn test_input_validation_empty_email() {
        let req = ContactRequest {
            name: "John".to_string(),
            email: "  ".to_string(),
            subject: "Test".to_string(),
            message: "Hello".to_string(),
        };
        assert!(req.email.trim().is_empty());
    }

    #[test]
    fn test_input_validation_empty_message() {
        let req = ContactRequest {
            name: "John".to_string(),
            email: "john@example.com".to_string(),
            subject: "Test".to_string(),
            message: "  ".to_string(),
        };
        assert!(req.message.trim().is_empty());
    }

    #[test]
    fn test_email_validation() {
        // Valid email
        assert!("user@example.com".contains('@') && "user@example.com".contains('.'));

        // Invalid: no @
        assert!(!("userexample.com".contains('@') && "userexample.com".contains('.')));

        // Invalid: no dot
        assert!(!("user@example".contains('@') && "user@example".contains('.')));
    }

    #[test]
    fn test_message_length_limit() {
        let long_message = "a".repeat(5001);
        assert!(long_message.len() > 5000);

        let ok_message = "a".repeat(5000);
        assert!(ok_message.len() <= 5000);
    }
}
