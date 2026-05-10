use crate::config::Config;
use crate::error::AppError;
use crate::resend_email::ResendEmailClient;
use base64::Engine;
use serde::Deserialize;

/// Unified email provider — tries Resend first, falls back to GCloud Gmail API.
///
/// Priority: Resend (simpler, free tier 100/day) → GCloud Gmail (OAuth2, more complex).
/// If neither is configured, email sending is a no-op with a warning log.
#[derive(Clone)]
pub enum EmailProvider {
    Resend(ResendEmailClient),
    GCloud(GCloudEmailClient),
    None,
}

impl EmailProvider {
    /// Create from environment: Resend if RESEND_API_KEY is set, else GCloud, else None.
    pub fn from_config(cfg: &Config) -> Self {
        if let Some(resend) = ResendEmailClient::from_env() {
            tracing::info!("📧 Email provider: Resend");
            return Self::Resend(resend);
        }
        if let Some(gcloud) = GCloudEmailClient::from_config(cfg) {
            tracing::info!("📧 Email provider: GCloud Gmail API");
            return Self::GCloud(gcloud);
        }
        tracing::warn!("⚠️ No email provider configured (RESEND_API_KEY and GCP_SA_JSON both missing)");
        Self::None
    }

    pub async fn send_contact_email(
        &self,
        to: &str,
        subject: &str,
        html: &str,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => c.send_contact_email(to, subject, html).await,
            Self::GCloud(c) => c.send_contact_email(to, subject, html).await,
            Self::None => {
                tracing::warn!("Email not sent (no provider): to={}, subject={}", to, subject);
                Ok(())
            }
        }
    }

    pub async fn send_welcome_email(&self, to: &str, name: Option<&str>) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => c.send_welcome_email(to, name).await,
            Self::GCloud(c) => c.send_welcome_email(to, name).await,
            Self::None => {
                tracing::warn!("Welcome email not sent (no provider): to={}", to);
                Ok(())
            }
        }
    }

    pub async fn send_verification_email(
        &self,
        to: &str,
        verification_url: &str,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => c.send_verification_email(to, verification_url).await,
            Self::GCloud(c) => c.send_verification_email(to, verification_url).await,
            Self::None => {
                tracing::warn!("Verification email not sent (no provider): to={}", to);
                Ok(())
            }
        }
    }

    pub async fn send_password_reset_email(
        &self,
        to: &str,
        reset_url: &str,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => c.send_password_reset_email(to, reset_url).await,
            Self::GCloud(c) => c.send_password_reset_email(to, reset_url).await,
            Self::None => {
                tracing::warn!("Password reset email not sent (no provider): to={}", to);
                Ok(())
            }
        }
    }

    pub async fn send_delivery_failed_email(
        &self,
        to: &str,
        endpoint_name: &str,
        error_details: &str,
    ) -> Result<(), AppError> {
        match self {
            Self::Resend(c) => {
                c.send_delivery_failed_email(to, endpoint_name, error_details)
                    .await
            }
            Self::GCloud(c) => {
                c.send_delivery_failed_email(to, endpoint_name, error_details)
                    .await
            }
            Self::None => {
                tracing::warn!(
                    "Delivery failed email not sent (no provider): to={}, endpoint={}",
                    to,
                    endpoint_name
                );
                Ok(())
            }
        }
    }
}

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
            .expect("system time after UNIX epoch")
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

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine;

    fn make_test_config() -> Config {
        Config {
            port: 3000,
            database_url: String::new(),
            hmac_secret: String::new(),
            max_webhook_payload_bytes: 0,
            jwt_secret: String::new(),
            retention_days: 0,
            rust_log: String::new(),
            webhook_format: String::new(),
            webhook_timestamp_tolerance_secs: 0,
            stripe_secret_key: None,
            stripe_webhook_secret: None,
            app_url: None,
            otel_enabled: false,
            otel_exporter_otlp_endpoint: None,
            otel_exporter_otlp_headers: None,
            polar_access_token: None,
            polar_webhook_secret: None,
            iyzico_api_key: None,
            iyzico_secret_key: None,
            gcp_service_account_path: None,
            cors_origins: vec![],
            notify_from_email: "noreply@example.com".into(),
            notify_email: None,
            fcm_server_key: None,
            email_base_url: "https://example.com".into(),
        }
    }

    /// Helper: generate a valid service account JSON string that matches the
    /// ServiceAccountKey struct field names (which use underscore-prefixed names).
    fn valid_sa_json() -> String {
        serde_json::json!({
            "_type": "service_account",
            "_project_id": "test-project",
            "_private_key_id": "key-id-123",
            "private_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIBogIBAAJBALRiMLAHudeSA/x3hB2f+2NRkJLA\n-----END RSA PRIVATE KEY-----\n",
            "client_email": "test@test-project.iam.gserviceaccount.com",
            "_client_id": "123456789",
            "_auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token"
        })
        .to_string()
    }

    #[test]
    fn test_from_config_no_env_no_path() {
        std::env::remove_var("GCP_SA_JSON");
        let cfg = make_test_config();
        // No GCP_SA_JSON and no gcp_service_account_path → None
        let client = GCloudEmailClient::from_config(&cfg);
        assert!(client.is_none());
    }

    #[test]
    fn test_from_config_invalid_json() {
        std::env::set_var("GCP_SA_JSON", "not valid json {{{");
        let cfg = make_test_config();
        let client = GCloudEmailClient::from_config(&cfg);
        assert!(client.is_none());
        std::env::remove_var("GCP_SA_JSON");
    }

    #[test]
    fn test_from_config_missing_required_fields() {
        // Valid JSON but missing required fields for ServiceAccountKey
        std::env::set_var("GCP_SA_JSON", r#"{"_type": "service_account"}"#);
        let cfg = make_test_config();
        let client = GCloudEmailClient::from_config(&cfg);
        assert!(client.is_none());
        std::env::remove_var("GCP_SA_JSON");
    }

    #[test]
    fn test_from_config_nonexistent_file() {
        std::env::remove_var("GCP_SA_JSON");
        let mut cfg = make_test_config();
        cfg.gcp_service_account_path = Some("/nonexistent/path/sa.json".into());
        let client = GCloudEmailClient::from_config(&cfg);
        assert!(client.is_none());
    }

    #[test]
    fn test_from_config_valid_sa_json() {
        std::env::set_var("GCP_SA_JSON", valid_sa_json());
        let cfg = make_test_config();
        let client = GCloudEmailClient::from_config(&cfg);
        assert!(client.is_some());
        let client = client.unwrap();
        assert_eq!(client.from_email, "noreply@example.com");
        std::env::remove_var("GCP_SA_JSON");
    }

    #[test]
    fn test_build_raw_message_structure() {
        std::env::set_var("GCP_SA_JSON", valid_sa_json());
        let cfg = make_test_config();
        let client = GCloudEmailClient::from_config(&cfg).unwrap();
        std::env::remove_var("GCP_SA_JSON");

        let raw = client.build_raw_message("user@example.com", "Test Subject", "<h1>Hello</h1>");

        // Should be base64url (no padding)
        assert!(!raw.contains('+'));
        assert!(!raw.contains('/'));
        assert!(!raw.contains('='));

        // Decode and verify MIME structure
        let decoded = base64::engine::general_purpose::URL_SAFE_NO_PAD
            .decode(&raw)
            .expect("should be valid base64url");
        let mime = String::from_utf8(decoded).expect("should be valid UTF-8");

        assert!(mime.contains("From: noreply@example.com"));
        assert!(mime.contains("To: user@example.com"));
        assert!(mime.contains("Subject: Test Subject"));
        assert!(mime.contains("MIME-Version: 1.0"));
        assert!(mime.contains("Content-Type: multipart/alternative"));
        assert!(mime.contains("boundary=\"boundary_hooksniff_email\""));
        assert!(mime.contains("Content-Type: text/html; charset=UTF-8"));
        assert!(mime.contains("<h1>Hello</h1>"));
    }

    #[test]
    fn test_build_raw_message_with_special_chars() {
        std::env::set_var("GCP_SA_JSON", valid_sa_json());
        let cfg = make_test_config();
        let client = GCloudEmailClient::from_config(&cfg).unwrap();
        std::env::remove_var("GCP_SA_JSON");

        let raw = client.build_raw_message(
            "user+tag@example.com",
            "Ünïcödé Subject 🎉",
            "<p>Café & résumé</p>",
        );

        let decoded = base64::engine::general_purpose::URL_SAFE_NO_PAD
            .decode(&raw)
            .expect("should be valid base64url");
        let mime = String::from_utf8(decoded).expect("should be valid UTF-8");

        assert!(mime.contains("To: user+tag@example.com"));
        assert!(mime.contains("Subject: Ünïcödé Subject 🎉"));
        assert!(mime.contains("<p>Café & résumé</p>"));
    }

    #[test]
    fn test_build_raw_message_boundary_present() {
        std::env::set_var("GCP_SA_JSON", valid_sa_json());
        let cfg = make_test_config();
        let client = GCloudEmailClient::from_config(&cfg).unwrap();
        std::env::remove_var("GCP_SA_JSON");

        let raw = client.build_raw_message("a@b.com", "S", "<p>H</p>");
        let decoded = base64::engine::general_purpose::URL_SAFE_NO_PAD
            .decode(&raw)
            .unwrap();
        let mime = String::from_utf8(decoded).unwrap();

        // Should have opening and closing boundary markers
        assert!(mime.contains("--boundary_hooksniff_email\r\n"));
        assert!(mime.contains("--boundary_hooksniff_email--"));
    }

    #[test]
    fn test_from_config_reads_from_file() {
        use std::io::Write;

        std::env::remove_var("GCP_SA_JSON");

        let dir = std::env::temp_dir().join("hooksniff_test_email");
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("sa.json");
        let mut f = std::fs::File::create(&path).unwrap();
        f.write_all(valid_sa_json().as_bytes()).unwrap();

        let mut cfg = make_test_config();
        cfg.gcp_service_account_path = Some(path.to_str().unwrap().into());
        let client = GCloudEmailClient::from_config(&cfg);
        assert!(client.is_some());

        std::fs::remove_dir_all(&dir).ok();
    }
}
