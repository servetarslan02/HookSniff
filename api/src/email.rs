use crate::config::Config;
use crate::error::AppError;

/// Resend email client wrapper.
#[derive(Clone)]
pub struct ResendClient {
    api_key: String,
    from_email: String,
    client: reqwest::Client,
}

#[derive(serde::Serialize)]
struct ResendEmailRequest {
    from: String,
    to: Vec<String>,
    subject: String,
    html: String,
}

impl ResendClient {
    /// Create a new ResendClient from config. Returns None if RESEND_API_KEY is not set.
    pub fn from_config(cfg: &Config) -> Option<Self> {
        let api_key = cfg.resend_api_key.clone()?;
        Some(Self {
            api_key,
            from_email: cfg.notify_from_email.clone(),
            client: reqwest::Client::new(),
        })
    }

    /// Send an email via the Resend API.
    async fn send(&self, to: &str, subject: &str, html: &str) -> Result<(), AppError> {
        let body = ResendEmailRequest {
            from: self.from_email.clone(),
            to: vec![to.to_string()],
            subject: subject.to_string(),
            html: html.to_string(),
        };

        tracing::debug!("Sending email to {} subject={}", to, subject);

        let resp = self
            .client
            .post("https://api.resend.com/emails")
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Resend API request failed: {:?}", e);
                AppError::Internal(anyhow::anyhow!("Email send failed: {}", e))
            })?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            tracing::error!("Resend API error: status={}, body={}", status, text);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Resend API returned {}: {}",
                status,
                text
            )));
        }

        tracing::info!("✅ Email sent to {}: {}", to, subject);
        Ok(())
    }

    /// Send a generic contact/admin email (used by contact form handler).
    pub async fn send_contact_email(
        &self,
        to: &str,
        subject: &str,
        html: &str,
    ) -> Result<(), AppError> {
        self.send(to, subject, html).await
    }

    /// Send a welcome email to a newly registered user.
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

    /// Send a verification email with a token/link.
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

    /// Send a password reset email with a token/link.
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

    /// Notify the admin about a failed webhook delivery.
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
