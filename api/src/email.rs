use crate::config::Config;
use crate::error::AppError;
use base64::Engine;
use serde::Deserialize;

/// Google Cloud Gmail API email client using service account credentials.
#[derive(Clone)]
pub struct GCloudEmailClient {
    service_account_key: ServiceAccountKey,
    /// Email address to send from (must be authorized in Google Workspace).
    from_email: String,
    /// Cached access token (short-lived, refreshed automatically).
    access_token: std::sync::Arc<tokio::sync::RwLock<Option<CachedToken>>>,
    client: reqwest::Client,
}

#[derive(Clone, Debug, Deserialize)]
struct ServiceAccountKey {
    _type: String,
    _project_id: String,
    _private_key_id: String,
    private_key: String,
    client_email: String,
    _client_id: String,
    _auth_uri: String,
    token_uri: String,
}

struct CachedToken {
    token: String,
    expires_at: std::time::Instant,
}

#[derive(serde::Serialize)]
struct JwtClaims {
    iss: String,
    scope: String,
    aud: String,
    exp: u64,
    iat: u64,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
    expires_in: u64,
}


impl GCloudEmailClient {
    /// Create a new GCloudEmailClient from config.
    /// Reads service account JSON from GCP_SA_JSON env var or GCP_SERVICE_ACCOUNT_PATH file.
    pub fn from_config(cfg: &Config) -> Option<Self> {
        // Try env var first (Cloud Run), then file path (local dev)
        let sa_json = if let Ok(json) = std::env::var("GCP_SA_JSON") {
            json
        } else if let Some(ref path) = cfg.gcp_service_account_path {
            match std::fs::read_to_string(path) {
                Ok(json) => json,
                Err(e) => {
                    tracing::error!("Failed to read GCP service account file {}: {}", path, e);
                    return None;
                }
            }
        } else {
            tracing::debug!("No GCP_SA_JSON or GCP_SERVICE_ACCOUNT_PATH set — email disabled");
            return None;
        };

        let sa_key: ServiceAccountKey = match serde_json::from_str(&sa_json) {
            Ok(key) => key,
            Err(e) => {
                tracing::error!("Failed to parse GCP service account JSON: {}", e);
                return None;
            }
        };

        tracing::info!(
            "✅ GCloud Email client initialized (service_account={}, from={})",
            sa_key.client_email,
            cfg.notify_from_email
        );

        Some(Self {
            service_account_key: sa_key,
            from_email: cfg.notify_from_email.clone(),
            access_token: std::sync::Arc::new(tokio::sync::RwLock::new(None)),
            client: reqwest::Client::new(),
        })
    }

    /// Get a valid OAuth2 access token, refreshing if needed.
    async fn get_access_token(&self) -> Result<String, AppError> {
        // Check cached token
        {
            let cache = self.access_token.read().await;
            if let Some(ref cached) = *cache {
                if cached.expires_at > std::time::Instant::now() {
                    return Ok(cached.token.clone());
                }
            }
        }

        // Generate new token
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let claims = JwtClaims {
            iss: self.service_account_key.client_email.clone(),
            scope: "https://www.googleapis.com/auth/gmail.send".to_string(),
            aud: self.service_account_key.token_uri.clone(),
            exp: now + 3600,
            iat: now,
        };

        // Create JWT
        let header = jsonwebtoken::Header::new(jsonwebtoken::Algorithm::RS256);
        let encoding_key = jsonwebtoken::EncodingKey::from_rsa_pem(
            self.service_account_key.private_key.as_bytes(),
        )
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to create RSA key: {}", e)))?;

        let jwt = jsonwebtoken::encode(&header, &claims, &encoding_key)
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to sign JWT: {}", e)))?;

        // Exchange JWT for access token
        let params = [
            ("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"),
            ("assertion", &jwt),
        ];

        let resp = self
            .client
            .post(&self.service_account_key.token_uri)
            .form(&params)
            .send()
            .await
            .map_err(|e| AppError::Internal(anyhow::anyhow!("Token exchange failed: {}", e)))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            tracing::error!(
                "GCloud token exchange error: status={}, body={}",
                status,
                text
            );
            return Err(AppError::Internal(anyhow::anyhow!(
                "GCloud token exchange returned {}: {}",
                status,
                text
            )));
        }

        let token_resp: TokenResponse = resp.json().await.map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse token response: {}", e))
        })?;

        // Cache the token (expire 5 min early for safety)
        let cached = CachedToken {
            token: token_resp.access_token.clone(),
            expires_at: std::time::Instant::now()
                + std::time::Duration::from_secs(token_resp.expires_in.saturating_sub(300)),
        };

        let mut cache = self.access_token.write().await;
        *cache = Some(cached);

        Ok(token_resp.access_token)
    }

    /// Build a raw MIME email and base64url-encode it for Gmail API.
    fn build_raw_message(&self, to: &str, subject: &str, html: &str) -> String {
        let boundary = "boundary_hooksniff_email";
        let mime = format!(
            "From: {}\r\n\
             To: {}\r\n\
             Subject: {}\r\n\
             MIME-Version: 1.0\r\n\
             Content-Type: multipart/alternative; boundary=\"{}\"\r\n\
             \r\n\
             --{}\r\n\
             Content-Type: text/html; charset=UTF-8\r\n\
             \r\n\
             {}\r\n\
             --{}--",
            self.from_email, to, subject, boundary, boundary, html, boundary
        );

        // Gmail API requires base64url (no padding)
        base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(mime.as_bytes())
    }

    /// Send an email via the Gmail API.
    async fn send(&self, to: &str, subject: &str, html: &str) -> Result<(), AppError> {
        let access_token = self.get_access_token().await?;

        tracing::debug!("Sending email to {} subject={}", to, subject);

        let raw_message = self.build_raw_message(to, subject, html);
        let body = serde_json::json!({ "raw": raw_message });

        let resp = self
            .client
            .post("https://gmail.googleapis.com/gmail/v1/users/me/messages/send")
            .bearer_auth(&access_token)
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                tracing::error!("Gmail API request failed: {:?}", e);
                AppError::Internal(anyhow::anyhow!("Email send failed: {}", e))
            })?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            tracing::error!("Gmail API error: status={}, body={}", status, text);
            return Err(AppError::Internal(anyhow::anyhow!(
                "Gmail API returned {}: {}",
                status,
                text
            )));
        }

        tracing::info!("✅ Email sent to {}: {}", to, subject);
        Ok(())
    }

    /// Send a generic contact/admin email.
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
