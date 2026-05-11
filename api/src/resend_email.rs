use crate::error::AppError;
use serde::Serialize;

/// Resend.com email client — lightweight alternative to GCloudEmailClient.
///
/// Uses Resend's REST API (https://resend.com/docs/api-reference).
/// Free tier: 100 emails/day, 3,000/month.
///
/// Environment: RESEND_API_KEY
#[derive(Clone)]
pub struct ResendEmailClient {
    api_key: String,
    from_email: String,
    client: reqwest::Client,
}

#[derive(Serialize)]
struct ResendSendRequest<'a> {
    from: &'a str,
    to: Vec<&'a str>,
    subject: &'a str,
    html: &'a str,
}

#[derive(serde::Deserialize)]
struct ResendSendResponse {
    id: String,
}

impl ResendEmailClient {
    pub fn from_env() -> Option<Self> {
        let api_key = std::env::var("RESEND_API_KEY").ok()?;
        let from_email =
            std::env::var("NOTIFY_FROM_EMAIL").unwrap_or_else(|_| "onboarding@resend.dev".into());

        if api_key.is_empty() {
            return None;
        }

        tracing::info!("✅ Resend email client initialized (from={})", from_email);

        Some(Self {
            api_key,
            from_email,
            client: reqwest::Client::new(),
        })
    }

    async fn send(&self, to: &str, subject: &str, html: &str) -> Result<(), AppError> {
        let body = ResendSendRequest {
            from: &self.from_email,
            to: vec![to],
            subject,
            html,
        };

        let resp = self
            .client
            .post("https://api.resend.com/emails")
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Resend request failed: {}", e)))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            tracing::error!("Resend API error: status={}, body={}", status, text);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Resend returned {}: {}",
                status,
                text
            )));
        }

        let result: ResendSendResponse = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse Resend response: {}", e))
        })?;

        tracing::info!(
            "✅ Email sent via Resend to {}: {} (id={})",
            to,
            subject,
            result.id
        );
        Ok(())
    }

    pub async fn send_contact_email(
        &self,
        to: &str,
        subject: &str,
        html: &str,
    ) -> Result<(), AppError> {
        self.send(to, subject, html).await
    }

    pub async fn send_welcome_email(&self, to: &str, name: Option<&str>) -> Result<(), AppError> {
        let display_name = name.unwrap_or("there");
        let subject = "Welcome to HookSniff!";
        let html = format!(
            r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6d28d9;">Welcome to HookSniff, {display_name}! 🎉</h1>
  <p>Your account has been created successfully.</p>
  <p>You can now create endpoints, set up webhooks, and start monitoring your deliveries.</p>
  <p style="margin-top: 24px; color: #6b7280;">— The HookSniff Team</p>
</body>
</html>"#
        );
        self.send(to, subject, &html).await
    }

    pub async fn send_verification_email(
        &self,
        to: &str,
        verification_url: &str,
    ) -> Result<(), AppError> {
        let subject = "Verify your HookSniff account";
        let html = format!(
            r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6d28d9;">Verify your email</h1>
  <p>Click the link below to verify your email address:</p>
  <p>
    <a href="{verification_url}"
       style="display:inline-block;background:#6d28d9;color:#fff;
              padding:12px 24px;border-radius:6px;text-decoration:none;
              font-weight:bold;">
      Verify Email
    </a>
  </p>
  <p style="color:#6b7280;font-size:14px;">
    This link expires in 24 hours. If you didn't create an account, ignore this email.
  </p>
  <p style="margin-top: 24px; color: #6b7280;">— The HookSniff Team</p>
</body>
</html>"#
        );
        self.send(to, subject, &html).await
    }

    pub async fn send_password_reset_email(
        &self,
        to: &str,
        reset_url: &str,
    ) -> Result<(), AppError> {
        let subject = "Reset your HookSniff password";
        let html = format!(
            r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6d28d9;">Password Reset Request</h1>
  <p>You requested to reset your password. Click the link below:</p>
  <p>
    <a href="{reset_url}"
       style="display:inline-block;background:#6d28d9;color:#fff;
              padding:12px 24px;border-radius:6px;text-decoration:none;
              font-weight:bold;">
      Reset Password
    </a>
  </p>
  <p style="color:#6b7280;font-size:14px;">
    This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
  </p>
  <p style="margin-top: 24px; color: #6b7280;">— The HookSniff Team</p>
</body>
</html>"#
        );
        self.send(to, subject, &html).await
    }

    pub async fn send_delivery_failed_email(
        &self,
        to: &str,
        endpoint_name: &str,
        error_details: &str,
    ) -> Result<(), AppError> {
        let subject = format!("⚠️ Delivery failed: {}", endpoint_name);
        let html = format!(
            r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #dc2626;">Webhook Delivery Failed ⚠️</h1>
  <p>A webhook delivery to <strong>{endpoint_name}</strong> has failed.</p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;
              padding:16px;margin:16px 0;">
    <pre style="margin:0;white-space:pre-wrap;font-size:13px;color:#991b1b;">{error_details}</pre>
  </div>
  <p>Check your delivery logs in the HookSniff dashboard for more details.</p>
  <p style="margin-top: 24px; color: #6b7280;">— The HookSniff Team</p>
</body>
</html>"#
        );
        self.send(to, &subject, &html).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_env_no_key() {
        std::env::remove_var("RESEND_API_KEY");
        let client = ResendEmailClient::from_env();
        assert!(client.is_none());
    }

    #[test]
    fn test_from_env_empty_key() {
        std::env::set_var("RESEND_API_KEY", "");
        let client = ResendEmailClient::from_env();
        assert!(client.is_none());
        std::env::remove_var("RESEND_API_KEY");
    }

    #[test]
    fn test_from_env_valid_key() {
        std::env::set_var("RESEND_API_KEY", "re_test_key_123");
        let client = ResendEmailClient::from_env();
        assert!(client.is_some());
        let c = client.unwrap();
        assert_eq!(c.api_key, "re_test_key_123");
        std::env::remove_var("RESEND_API_KEY");
    }

    #[test]
    fn test_from_env_custom_from() {
        std::env::set_var("RESEND_API_KEY", "re_test");
        std::env::set_var("NOTIFY_FROM_EMAIL", "custom@example.com");
        let client = ResendEmailClient::from_env().unwrap();
        assert_eq!(client.from_email, "custom@example.com");
        std::env::remove_var("RESEND_API_KEY");
        std::env::remove_var("NOTIFY_FROM_EMAIL");
    }
}
