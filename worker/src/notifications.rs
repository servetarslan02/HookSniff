//! Notification functions for the HookSniff Worker.
//!
//! Handles delivery failure notifications and endpoint down alerts.

use sqlx::PgPool;

use crate::operational_webhook;

/// Create an in-app notification for a dead-lettered delivery.
/// Also sends email notification if user has email_on_failure enabled.
pub async fn create_delivery_failure_notification(
    pool: &sqlx::PgPool,
    customer_id: uuid::Uuid,
    delivery_id: uuid::Uuid,
    endpoint_url: &str,
    error_msg: &str,
) {
    let title = "⚠️ Webhook Teslimat Başarısız";
    let message = format!(
        "{} adresine teslimat başarısız oldu: {}",
        endpoint_url, error_msg
    );
    let link = format!("/deliveries/{}", delivery_id);

    let _ = sqlx::query(
        "INSERT INTO notifications (customer_id, type, title, message, is_read, link) VALUES ($1, 'webhook_failed', $2, $3, false, $4)"
    )
    .bind(customer_id)
    .bind(title)
    .bind(&message)
    .bind(&link)
    .execute(pool)
    .await;

    // Send email notification if user has email_on_failure enabled
    let email_prefs = sqlx::query_as::<_, (String, Option<String>, bool, bool)>(
        r#"SELECT c.email, c.language,
                  COALESCE(np.email_on_failure, true) as email_on_failure,
                  COALESCE(np.email_on_dead_letter, true) as email_on_dead_letter
           FROM customers c
           LEFT JOIN notification_preferences np ON np.customer_id = c.id
           WHERE c.id = $1"#,
    )
    .bind(customer_id)
    .fetch_optional(pool)
    .await;

    if let Ok(Some((email, lang, email_on_failure, email_on_dead_letter))) = email_prefs {
        if !email_on_failure && !email_on_dead_letter {
            return; // User disabled failure emails
        }

        // Get Resend API key from platform settings
        let api_key: Option<String> = sqlx::query_scalar(
            "SELECT value->>'resend_api_key' FROM platform_settings WHERE key = 'main'",
        )
        .fetch_optional(pool)
        .await
        .unwrap_or(None)
        .flatten();

        if let Some(key) = api_key {
            if !key.is_empty() {
                let sender: String = sqlx::query_scalar(
                    "SELECT COALESCE(value->>'email_sender', 'noreply@resend.dev') FROM platform_settings WHERE key = 'main'"
                )
                .fetch_one(pool)
                .await
                .unwrap_or_else(|_| "noreply@resend.dev".to_string());

                let is_tr = lang.as_deref() == Some("tr");
                let (subject, body) = if is_tr {
                    (
                        format!("❌ Teslimat Başarısız: {}", endpoint_url),
                        format!(
                            "Webhook teslimatınız başarısız oldu.\n\nEndpoint: {}\nHata: {}\nTeslimat ID: {}\n\nDashboard'dan kontrol edin: https://hooksniff.vercel.app/deliveries/{}\n\n— HookSniff",
                            endpoint_url, error_msg, delivery_id, delivery_id
                        ),
                    )
                } else {
                    (
                        format!("❌ Delivery Failed: {}", endpoint_url),
                        format!(
                            "Your webhook delivery has failed.\n\nEndpoint: {}\nError: {}\nDelivery ID: {}\n\nCheck your dashboard: https://hooksniff.vercel.app/deliveries/{}\n\n— HookSniff",
                            endpoint_url, error_msg, delivery_id, delivery_id
                        ),
                    )
                };

                let client = reqwest::Client::new();
                let _ = client
                    .post("https://api.resend.com/emails")
                    .header("Authorization", format!("Bearer {}", key))
                    .json(&serde_json::json!({
                        "from": sender,
                        "to": [email],
                        "subject": subject,
                        "text": body,
                    }))
                    .send()
                    .await;
            }
        }
    }
}

/// Send email notification when an endpoint becomes unhealthy (failure_streak >= 5).
/// Reads Resend config from platform_settings.
/// Also dispatches `endpoint.disabled` operational webhook at threshold crossings.
pub async fn notify_endpoint_down(
    pool: &PgPool,
    endpoint_id: uuid::Uuid,
    endpoint_url: &str,
    failure_streak: i32,
) {
    // Only notify at threshold crossings: 5, 10, 20, 50
    if !matches!(failure_streak, 5 | 10 | 20 | 50) {
        return;
    }

    // Get customer email, customer_id, and platform settings
    let result = sqlx::query_as::<_, (String, uuid::Uuid, String, Option<String>, Option<String>)>(
        r#"SELECT c.email, c.id, e.url, s.resend_api_key, s.email_sender
           FROM endpoints e
           JOIN customers c ON e.customer_id = c.id
           CROSS JOIN (SELECT value FROM platform_settings WHERE key = 'main') ps
           LEFT JOIN LATERAL (
               SELECT
                   (ps.value->>'resend_api_key') as resend_api_key,
                   (ps.value->>'email_sender') as email_sender
           ) s ON true
           WHERE e.id = $1"#,
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await;

    let (customer_email, customer_id, _url, api_key_opt, sender_opt) = match result {
        Ok(Some(row)) => row,
        _ => return, // Silently skip if we can't fetch
    };

    // Check notification preferences — skip email if user disabled failure alerts
    let email_on_failure: bool = sqlx::query_scalar(
        "SELECT COALESCE(email_on_failure, true) FROM notification_preferences WHERE customer_id = $1"
    )
    .bind(customer_id)
    .fetch_optional(pool)
    .await
    .unwrap_or(None)
    .unwrap_or(true); // Default: send if no preference set

    // Dispatch operational webhook: endpoint.disabled (always, regardless of email pref)
    {
        let http_client = reqwest::Client::new();
        let op_payload = serde_json::json!({
            "endpoint_id": endpoint_id.to_string(),
            "endpoint_url": endpoint_url,
            "failure_streak": failure_streak,
        });
        operational_webhook::dispatch_event(
            pool,
            &http_client,
            customer_id,
            operational_webhook::OpWebhookEvent::EndpointDisabled,
            op_payload,
        )
        .await;
    }

    if !email_on_failure {
        tracing::debug!(
            "📧 Skipping failure email for {} — user disabled email_on_failure",
            endpoint_url
        );
        return;
    }

    let api_key = match api_key_opt {
        Some(k) if !k.is_empty() => k,
        _ => return, // No Resend key configured
    };

    let sender = sender_opt.as_deref().unwrap_or("noreply@resend.dev");

    let subject = format!("⚠️ Endpoint Down: {}", endpoint_url);
    let body = format!(
        "Your endpoint has been experiencing failures.\n\n\
         Endpoint: {}\n\
         Consecutive failures: {}\n\n\
         Please check your endpoint and ensure it's responding correctly.\n\n\
         — HookSniff",
        endpoint_url, failure_streak
    );

    let client = reqwest::Client::new();
    let _ = client
        .post("https://api.resend.com/emails")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&serde_json::json!({
            "from": sender,
            "to": [customer_email],
            "subject": subject,
            "text": body,
        }))
        .send()
        .await;

    tracing::info!("📧 Endpoint down notification sent for {}", endpoint_url);
}
